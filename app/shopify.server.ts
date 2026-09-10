import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const appUrl =
  process.env.SHOPIFY_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "");

const defaultScopes = [
  "write_orders",
  "read_orders",
  "write_draft_orders",
  "read_draft_orders",
  "read_products",
  "read_product_listings",
  "write_customers",
  "read_customers",
  "write_discounts",
  "read_discounts",
  "write_price_rules",
  "read_price_rules",
  "read_inventory",
  "write_inventory",
  "read_script_tags",
  "write_script_tags",
  "read_fulfillments",
  "write_fulfillments",
  "read_shipping",
  "read_themes",
  "write_themes",
  "read_publications",
];

const VALID_SHOPIFY_SCOPES = new Set([
  "read_orders", "write_orders",
  "read_draft_orders", "write_draft_orders",
  "read_products", "write_products",
  "read_product_listings",
  "read_customers", "write_customers",
  "read_discounts", "write_discounts",
  "read_price_rules", "write_price_rules",
  "read_inventory", "write_inventory",
  "read_script_tags", "write_script_tags",
  "read_fulfillments", "write_fulfillments",
  "read_shipping", "write_shipping",
  "read_themes", "write_themes",
  "read_publications", "write_publications",
  "read_content", "write_content",
  "read_locations"
]);

const rawScopes = process.env.SCOPES
  ? process.env.SCOPES.split(",").map((s) => s.trim()).filter(Boolean)
  : defaultScopes;

const scopes = rawScopes.filter((s) => VALID_SHOPIFY_SCOPES.has(s));

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October24,
  scopes,
  appUrl,
  authPathPrefix: "/auth",


  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,

  billing: {
    Premium: {
      amount: 89.99,
      currencyCode: "USD",
      interval: "ANNUAL" as any,
    },
    Enterprise: {
      amount: 269.99,
      currencyCode: "USD",
      interval: "ANNUAL" as any,
    },
    Unlimited: {
      amount: 629.99,
      currencyCode: "USD",
      interval: "ANNUAL" as any,
    },
    // NOTE: the Monthly toggle in app.billing.tsx is UI-only right now —
    // Shopify billing plans are fixed at creation, so a real monthly option
    // needs separate plan entries here (e.g. "Premium Monthly" at the
    // pre-discount rate) that the action branches to based on the chosen
    // interval.
  },
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/uninstalled",
    },
    APP_SUBSCRIPTIONS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app_subscriptions/update",
    },
    ORDERS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/orders/create",
    },
    ORDERS_UPDATED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/orders/updated",
    },
    ORDERS_FULFILLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/orders/fulfilled",
    },
    ORDERS_CANCELLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/orders/cancelled",
    },
    DRAFT_ORDERS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/draft_orders/create",
    },
    CUSTOMERS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/customers/create",
    },
    SHOP_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/shop/update",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      await shopify.registerWebhooks({ session });
    },
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
