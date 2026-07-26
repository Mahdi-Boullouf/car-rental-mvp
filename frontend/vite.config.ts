import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy /api and /uploads to the Express backend so dev is same-origin
// (no CORS juggling, and image paths like /uploads/x.jpg just work).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
});
