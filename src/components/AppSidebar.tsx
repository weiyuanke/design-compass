import {
  Home,
  MessageSquare,
  Bot,
  Wrench,
  Activity,
  Server,
  Puzzle,
  Workflow,
  Clock,
  Bell,
  Cpu,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

// Workbench - main user-facing features
const workbenchNav = [
  { title: "首页", url: "/", icon: Home },
  { title: "对话", url: "/chat", icon: MessageSquare },
];

// Agent-related features
const agentNav = [
  { title: "平台 Agent", url: "/tools", icon: Wrench },
  { title: "我的 Agent", url: "/my-agents", icon: Bot },
  { title: "大模型配置", url: "/llm-providers", icon: Cpu },
];

// Extension ecosystem - MCP and Skills
const extensionNav = [
  { title: "MCP Server", url: "/mcp", icon: Server },
  { title: "Skill 市场", url: "/skills", icon: Puzzle },
];

// Automation - Workflow, Scheduler, Notification
const automationNav = [
  { title: "工作流编排", url: "/workflows", icon: Workflow },
  { title: "定时任务", url: "/scheduler", icon: Clock },
  { title: "通知中心", url: "/notifications", icon: Bell },
];

// Admin/Management features
const adminNav = [
  { title: "监控概览", url: "/monitor", icon: Activity },
];

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

function NavSection({
  items,
  collapsed,
}: {
  items: NavItem[];
  collapsed: boolean;
}) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.url}
              end={item.url === "/"}
              className="hover:bg-secondary/50 text-muted-foreground transition-colors"
              activeClassName="bg-primary/10 text-primary font-medium"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-gradient-primary tracking-tight">
              Lingjun Agent Hub
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Workbench */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-xs uppercase tracking-wider">
            工作台
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavSection items={workbenchNav} collapsed={collapsed} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Agent Center */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-xs uppercase tracking-wider">
            Agent 中心
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavSection items={agentNav} collapsed={collapsed} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Extension Ecosystem */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-xs uppercase tracking-wider">
            扩展生态
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavSection items={extensionNav} collapsed={collapsed} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Automation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-xs uppercase tracking-wider">
            自动化
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavSection items={automationNav} collapsed={collapsed} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-xs uppercase tracking-wider">
            管理
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavSection items={adminNav} collapsed={collapsed} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-2 rounded-lg hover:bg-secondary/50 transition-colors py-2"
          activeClassName="bg-primary/10"
        >
          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium text-accent flex-shrink-0">
            张
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">张三</p>
            </div>
          )}
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
