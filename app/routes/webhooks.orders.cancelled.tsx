import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload } = await authenticate.webhook(request);

  if (payload?.id) {
    const shopifyOrderId = `gid://shopify/Order/${payload.id}`;
    await prisma.codSubmission
      .updateMany({
        where: { shopifyOrderId },
        data: { status: "failed" },
      })
      .catch(() => {/* ignore if not found */});
  }

  return new Response(null, { status: 200 });
};
