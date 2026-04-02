#!/bin/sh
# Docker 入口脚本：用环境变量替换 config.js 中的占位符

set -e

CONFIG_FILE="/usr/share/nginx/html/config.js"

# 如果 config.js 存在，替换占位符
if [ -f "$CONFIG_FILE" ]; then
    # 使用环境变量替换占位符
    sed -i "s|\\\${VITE_KAGENT_BASE_URL}|${VITE_KAGENT_BASE_URL:-}|g" "$CONFIG_FILE"
    sed -i "s|\\\${VITE_KAGENT_USER_ID}|${VITE_KAGENT_USER_ID:-admin@kagent.dev}|g" "$CONFIG_FILE"
    echo "Config file updated with runtime environment variables"
fi

# 启动 nginx
exec nginx -g "daemon off;"
