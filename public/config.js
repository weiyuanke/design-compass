// 运行时配置文件
// 这个文件会被 nginx 在运行时通过环境变量注入
window.APP_CONFIG = {
  VITE_KAGENT_BASE_URL: "${VITE_KAGENT_BASE_URL}",
  VITE_KAGENT_USER_ID: "${VITE_KAGENT_USER_ID}"
};
