import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Content lives at the repo root in /content as the single source of truth.
// We alias it so the frontend can bundle it directly (works offline / no API
// dependency), while the FastAPI backend can serve the same files for the
// future public API.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@content": fileURLToPath(new URL("../content", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: false,
    fs: {
      // Allow importing the single-source-of-truth content from ../content
      allow: [".."],
    },
  },
});
