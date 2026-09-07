import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// Acknowledge the customers/create webhook.
// Future: could be used to sync customer data or pre-fill form fields.
export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.webhook(request);
  return new Response(null, { status: 200 });
};
