import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// Acknowledge the shop/update webhook.
// Future: could be used to sync shop currency, timezone, etc.
export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.webhook(request);
  return new Response(null, { status: 200 });
};
