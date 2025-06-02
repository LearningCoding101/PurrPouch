import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Fix for sockjs-client dependency that expects 'global' to be defined
      global: {},
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "window",
      },
    },
  },
});
