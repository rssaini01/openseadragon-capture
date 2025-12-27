import { defineConfig } from "vite";
import path from "node:path";
import preact from "@preact/preset-vite";

export default defineConfig(({ mode }) => ({
  plugins: [preact()],
  base: mode === "prod" ? "/openseadragon-screenshot" : "/",
  resolve: {
    alias: {
      "openseadragon-screenshot":
        mode === "prod"
          ? path.resolve(__dirname, "../dist/esm/index.js")
          : path.resolve(__dirname, "../src/index.ts"),
    },
  },
  server: {
    port: 3000,
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}));
