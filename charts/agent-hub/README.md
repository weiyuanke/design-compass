# Agent Hub Helm Chart

## 简介

Agent Hub 的 Helm Chart，用于在 Kubernetes 上部署 Agent Hub 前端应用。

## 安装

### 添加 Helm 仓库（可选）

```bash
helm install agent-hub ./charts/agent-hub
```

### 使用自定义值安装

```bash
helm install agent-hub ./charts/agent-hub \
  --set kagent.baseUrl=http://your-kagent-server:8083 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=agent-hub.yourdomain.com
```

## 配置参数

| 参数 | 描述 | 默认值 |
|------|------|--------|
| `image.repository` | 镜像仓库 | `docker.io/weiyuanke/agent-hub` |
| `image.tag` | 镜像标签 | `1.0` |
| `image.pullPolicy` | 镜像拉取策略 | `IfNotPresent` |
| `replicaCount` | 副本数 | `1` |
| `kagent.baseUrl` | Kagent API 地址 | `http://192.168.3.211:8083` |
| `kagent.userId` | Kagent 用户 ID | `admin@kagent.dev` |
| `service.type` | 服务类型 | `ClusterIP` |
| `service.port` | 服务端口 | `80` |
| `ingress.enabled` | 启用 Ingress | `false` |
| `resources.limits.cpu` | CPU 限制 | `500m` |
| `resources.limits.memory` | 内存限制 | `256Mi` |
| `resources.requests.cpu` | CPU 请求 | `100m` |
| `resources.requests.memory` | 内存请求 | `128Mi` |

## 使用示例

### 基本部署

```bash
helm install agent-hub ./charts/agent-hub
```

### 指定 Kagent 地址

```bash
helm install agent-hub ./charts/agent-hub \
  --set kagent.baseUrl=http://192.168.3.100:8083
```

### 启用 Ingress

```bash
helm install agent-hub ./charts/agent-hub \
  --set ingress.enabled=true \
  --set ingress.className=nginx \
  --set ingress.hosts[0].host=agent-hub.example.com \
  --set ingress.hosts[0].paths[0].path=/ \
  --set ingress.hosts[0].paths[0].pathType=Prefix
```

### 升级

```bash
helm upgrade agent-hub ./charts/agent-hub
```

### 卸载

```bash
helm uninstall agent-hub
```
