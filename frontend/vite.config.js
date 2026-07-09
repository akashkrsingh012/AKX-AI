import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const gatewayUrl = env.VITE_GATEWAY_URL || "http://localhost:8000";

  const devPort = parseInt(env.VITE_PORT || "3000", 10);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: devPort,
      strictPort: true,
      host: true,
      proxy: {
        "/api": {
          target: gatewayUrl,
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: gatewayUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: devPort,
      strictPort: true,
      proxy: {
        "/api": {
          target: gatewayUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
