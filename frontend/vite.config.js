import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  // In dev, the unified server runs on 8001 (auth service port).
  // In prod, VITE_SERVER_URL is set to the Render backend URL.
  const backendUrl = env.VITE_SERVER_URL || "http://localhost:8001";

  const devPort = parseInt(env.VITE_PORT || "3000", 10);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: devPort,
      strictPort: true,
      host: true,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: backendUrl,
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
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
