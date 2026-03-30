# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start development server on http://localhost:8080
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run unit tests once
- `npm run test:watch` - Run tests in watch mode

### Testing
- Run single test: Add `.only` to test or use Vitest's filtering
- Test files should be in `src/**/*.{test,spec}.{ts,tsx}`
- Test setup: `src/test/setup.ts` includes jest-dom matchers and matchMedia polyfill

## Architecture Overview

### Tech Stack
- **Framework**: React 18.3 with TypeScript 5.8
- **Build Tool**: Vite 5.4 with SWC compilation
- **UI**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS 3.4 with custom CSS variables for theming
- **State Management**: React Query v5 for server state caching
- **Routing**: React Router v6
- **Testing**: Vitest (unit) + Playwright (E2E)

### Project Structure
- `src/pages/` - Page-level components (20 pages for different features)
- `src/components/` - Reusable components
  - `ui/` - shadcn/ui component library (49 components)
  - Shared components: AgentCard, AppLayout, AppSidebar, StatsCard, TemplateCard
- `src/data/` - Data models and mock data (agents.ts, collaboration.ts, mcpServers.ts, skills.ts)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions (cn() for class merging)

### Key Architectural Patterns

#### 1. Sidebar Navigation System
The app uses a collapsible sidebar (Radix UI) organized into 6 sections:
- Workbench (首页, 对话)
- Agent Center (平台 Agent, 自托管 Agent, 大模型配置)
- Extension Ecosystem (MCP Server, Skill 市场, 知识库 RAG)
- Multi-Agent Collaboration (多 Agent 协作)
- Automation (工作流编排, 定时任务, 通知中心)
- Admin (监控概览)

Navigation configuration is in `src/components/AppSidebar.tsx` with grouped nav arrays.

#### 2. App Layout Structure
`AppLayout` wraps all pages with:
- `SidebarProvider` for sidebar state management
- Fixed header with sidebar trigger
- Main content area with overflow
- Toast notifications (Toaster + Sonner)

#### 3. Agent Data Model
Two agent types defined in `src/data/agents.ts`:
- `PlatformAgent`: Built-in agents (6 predefined: K8s Ops, Project Mgr, ASK, Admin, Report Analyzer, Sentinel)
- `MyAgent`: User-created self-hosted agents with VM isolation and external URLs

Key distinction: Self-hosted agents have `requiresExternalInterface: true` and open in external workspaces, while platform agents are integrated directly.

Helper function `getAllChatAgents()` filters agents for chat interface, excluding those requiring external interfaces.

#### 4. Multi-Agent Collaboration System
Defined in `src/data/collaboration.ts`:
- 4 collaboration modes: parallel, sequential, hierarchical, debate
- 9 agent roles (core + quant-specific): coordinator, researcher, analyst, developer, writer, reviewer, quant, trader, risk_officer
- 5 pre-built templates: industry report, quant strategy, code review, investment debate, data pipeline

Sessions track agent assignments, progress, and costs (tokens/time).

#### 5. Data Layer Pattern
Data is currently static/mocked in `src/data/` files. Each domain (agents, collaboration, MCP, skills) has:
- TypeScript interfaces defining data models
- Exported arrays of mock data
- No API layer implemented yet

#### 6. Component Usage
- Use shadcn/ui components from `@/components/ui/`
- Import path aliases: `@/components`, `@/lib`, `@/hooks`, `@/data`
- Style utility: `cn()` from `@/lib/utils.ts` merges Tailwind classes
- Custom theme colors use CSS variables (e.g., `bg-background`, `text-primary`)

#### 7. Route Configuration
All routes defined in `src/App.tsx` with React Router. No nested routes currently. Pages are simple route components without data fetching logic yet.

### Development Notes
- TypeScript config has relaxed rules (noImplicitAny: false, strictNullChecks: false) - consider tightening
- ESLint allows unused vars - add explicit rules if needed
- Build dedupes React packages for faster builds
- Development server runs on port 8080 with HMR
- Playwright config extends from lovable-agent-playwright-config
