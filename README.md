# Agent Hub

一个企业级 AI Agent 管理平台，提供完整的 Agent 生命周期管理、多 Agent 协作、知识库 RAG、MCP 集成等功能。

## 🎯 核心功能

### Agent 管理
- **创建 & 配置**：直观的 Agent 创建向导，支持自定义配置
- **我的 Agent**：集中管理所有 Agent，查看状态和性能指标
- **Agent 模板**：内置多种 Agent 模板，创建时快速选择

### 交互与协作
- **聊天界面**：实时与 Agent 交互，支持多轮对话
- **多 Agent 协作**：支持多个 Agent 之间的协作和信息交互
- **工作流**：定义复杂的 Agent 工作流程

### 知识与工具
- **知识库**：RAG（检索增强生成）功能，支持文档上传和语义搜索
- **MCP 集成**：管理和部署 MCP（Model Context Protocol）服务器
- **工具库**：集成各类工具和插件

### 运维与监控
- **监控面板**：实时监控 Agent 运行状态、性能指标
- **定时调度**：支持工作流和任务的定时执行
- **通知系统**：灵活的通知配置和告警机制
- **LLM 提供商**：支持多个 LLM 提供商配置和切换

### 系统管理
- **Skills 管理**：管理和配置各类 Skills
- **设置**：系统级别的配置和偏好设置

## 🛠️ 技术栈

### 前端框架
- **React** 18.3 - UI 框架
- **TypeScript** 5.8 - 类型安全
- **Vite** 5.4 - 构建工具
- **React Router** v6 - 路由管理

### UI & 样式
- **shadcn/ui** - 高质量 React 组件库
- **Radix UI** - 无样式的 UI 原语
- **Tailwind CSS** 3.4 - 工具类 CSS 框架
- **Framer Motion** 12.38 - 动画库

### 数据与表单
- **React Hook Form** - 高性能表单库
- **Zod** 3.25 - TypeScript 优先的数据验证
- **TanStack React Query** v5 - 数据获取和缓存
- **Recharts** 2.15 - 图表库

### 开发工具
- **ESLint** - 代码检查
- **Vitest** - 单元测试
- **Playwright** - E2E 测试

## 📦 项目结构

```
agent-hub/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── HomePage.tsx
│   │   ├── LandingPage.tsx       # 聊天首页（欢迎页）
│   │   ├── ChatSessionPage.tsx   # 聊天会话页
│   │   ├── MyAgentsPage.tsx
│   │   ├── CreateAgentPage.tsx
│   │   ├── KnowledgeBasePage.tsx
│   │   ├── McpPage.tsx
│   │   ├── DeployMcpPage.tsx
│   │   ├── SchedulerPage.tsx
│   │   ├── WorkflowsPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── LLMProvidersPage.tsx
│   │   ├── CollaborationPage.tsx
│   │   ├── MonitorPage.tsx
│   │   ├── SkillsPage.tsx
│   │   ├── ToolsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── NotFound.tsx
│   ├── components/         # 可复用组件
│   │   ├── ui/            # shadcn/ui 组件
│   │   └── AppLayout.tsx  # 应用布局
│   ├── App.tsx            # 路由配置
│   ├── main.tsx           # 应用入口
│   └── test/              # 测试文件
├── public/                # 静态资源
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── playwright.config.ts
└── README.md
```

## 🚀 快速开始

### 前置要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
应用将在 `http://localhost:5173` 启动

### 生产构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

### 代码检查
```bash
npm run lint
```

### 运行测试
```bash
# 单次运行
npm run test

# 监听模式
npm run test:watch
```

## 📋 页面功能说明

| 页面 | 路由 | 功能描述 |
|------|------|--------|
| 首页 | `/` | 平台概览和快速导航 |
| 聊天首页 | `/chat` | 聊天欢迎页，选择 Agent 或输入问题 |
| 聊天会话 | `/chat/session` | 与 Agent 实时对话 |
| 我的 Agent | `/my-agents` | 查看和管理所有 Agent |
| 创建 Agent | `/create` | 创建新的 Agent（内置模板选择） |
| 工具 | `/tools` | 工具库和插件管理 |
| MCP | `/mcp` | MCP 服务器管理 |
| MCP 部署 | `/mcp/deploy` | 部署新的 MCP 服务器 |
| 知识库 | `/knowledge-base` | RAG 知识库管理 |
| 工作流 | `/workflows` | 定义和管理工作流 |
| 调度器 | `/scheduler` | 定时任务和调度 |
| 通知 | `/notifications` | 通知配置和告警 |
| LLM 提供商 | `/llm-providers` | 配置 LLM 提供商 |
| 多 Agent 协作 | `/collaboration` | 多 Agent 协作管理 |
| 监控 | `/monitor` | 系统监控和性能指标 |
| Skills | `/skills` | Skills 管理 |
| 设置 | `/settings` | 系统设置 |

## 🔧 配置说明

### Tailwind CSS
自定义主题和样式配置在 `tailwind.config.ts`

### TypeScript
编译选项在 `tsconfig.json` 和 `tsconfig.app.json`

### Vite
构建和开发服务器配置在 `vite.config.ts`

## 📝 开发规范

### Git 工作流
- ❌ **禁止**直接提交到 `main` 分支
- ✅ 创建 feature 分支：`git checkout -b feature/your-feature-name`
- ✅ 提交 Pull Request 进行代码审查
- ✅ PR 通过审查后合并到 `main`

### 代码风格
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码（如配置）

### 提交信息
建议使用清晰的提交信息：
```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码风格调整
refactor: 代码重构
test: 添加测试
chore: 构建或依赖更新
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建 feature 分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，欢迎提交 Issue 或 Pull Request。

---

**最后更新**：2026-03-29
