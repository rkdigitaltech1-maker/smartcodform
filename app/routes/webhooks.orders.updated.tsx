import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  if (topic === "ORDERS_UPDATED" && payload?.id) {
    const shopifyOrderId = `gid://shopify/Order/${payload.id}`;
    const fulfillmentStatus = payload.fulfillment_status;

    // Map Shopify fulfillment status to our internal status
    let newStatus: string | null = null;
    if (fulfillmentStatus === "fulfilled") {
      newStatus = "delivered";
    } else if (fulfillmentStatus === "partial") {
      newStatus = "out_for_delivery";
    }

    if (newStatus) {
      await prisma.codSubmission
        .updateMany({
          where: { shopifyOrderId },
          data: { status: newStatus },
        })
        .catch(() => {/* ignore if submission not found */});
    }
  }

  return new Response(null, { status: 200 });
};
