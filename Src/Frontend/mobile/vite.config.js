import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:6333",
        changeOrigin: true,
      },
      "/static": {
        target: "http://127.0.0.1:6333",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://127.0.0.1:6333",
        ws: true,
      },
    },
  },
});
