/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Kagent 服务根 URL，如 http://192.168.3.204:8080；开发环境可设为 /kagent-proxy 配合 Vite 代理避免 CORS */
  readonly VITE_KAGENT_BASE_URL?: string;
  /** 与 kagent UI 中「获取会话列表」对应的 next-action 哈希（随构建变化，需从浏览器请求头复制） */
  readonly VITE_KAGENT_NEXT_ACTION_LIST?: string;
  /** 与「创建会话」对应的 next-action 哈希 */
  readonly VITE_KAGENT_NEXT_ACTION_CREATE?: string;
  /** 默认 admin@kagent.dev */
  readonly VITE_KAGENT_USER_ID?: string;
  /** Vite dev 代理 /kagent-proxy 的目标，默认 http://192.168.3.204:8080 */
  readonly VITE_KAGENT_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
