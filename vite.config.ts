import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

// Safely load the Vercel preset only when building on Vercel.
// This prevents a hard crash when @vercel/remix is not installed
// (local dev, Render, Railway, Fly.io, etc.).
function getVercelPresets() {
  if (!process.env.VERCEL) return [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { vercelPreset } = require("@vercel/remix/vite");
    return [vercelPreset()];
  } catch {
    return [];
  }
}

export default defineConfig({
  server: {
    port: Number(process.env.PORT || 3000),
    hmr: { protocol: "wss" },
    fs: { allow: ["app", "node_modules"] },
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
      presets: getVercelPresets(),
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    assetsInlineLimit: 0,
  },
}) satisfies UserConfig;



