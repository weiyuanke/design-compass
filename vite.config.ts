import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const fromBase =
    env.VITE_KAGENT_BASE_URL?.trim().replace(/\/$/, "") ?? "";
  const kagentProxyTarget =
    env.VITE_KAGENT_PROXY_TARGET?.trim() ||
    (/^https?:\/\//i.test(fromBase) ? fromBase : "") ||
    "http://192.168.3.204:8080";

  return {
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/kagent-proxy": {
        target: kagentProxyTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/kagent-proxy/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
};
});
