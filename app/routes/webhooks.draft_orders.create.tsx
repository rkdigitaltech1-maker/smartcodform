import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// Acknowledge the draft_orders/create webhook.
// No-op for now — COD draft orders are tracked via our own prisma records.
export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.webhook(request);
  return new Response(null, { status: 200 });
};
