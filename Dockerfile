# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
LABEL org.opencontainers.image.title="agent-hub" \
      org.opencontainers.image.description="Agent Hub 前端静态站点"
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/docker-entrypoint.sh /docker-entrypoint.sh

# 添加执行权限
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

# 使用自定义入口脚本
ENTRYPOINT ["/docker-entrypoint.sh"]
