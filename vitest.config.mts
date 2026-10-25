import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    exclude: ["**/node_modules/**", "**/.next/**", "**/e2e/**"],
    globals: true,
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
