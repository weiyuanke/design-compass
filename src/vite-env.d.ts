/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Kagent Controller 服务根 URL，如 http://192.168.3.211:8083；开发环境可设为 /kagent-proxy 配合 Vite 代理避免 CORS */
  readonly VITE_KAGENT_BASE_URL?: string;
  /** Vite dev 代理 /kagent-proxy 的目标，默认 http://192.168.3.211:8083 */
  readonly VITE_KAGENT_PROXY_TARGET?: string;
  /** 可选：用户 ID，默认 admin@kagent.dev */
  readonly VITE_KAGENT_USER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}