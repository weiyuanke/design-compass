import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import TemplatesPage from "./pages/TemplatesPage";
import MyAgentsPage from "./pages/MyAgentsPage";
import ToolsPage from "./pages/ToolsPage";
import McpPage from "./pages/McpPage";
import DeployMcpPage from "./pages/DeployMcpPage";
import MonitorPage from "./pages/MonitorPage";
import SkillsPage from "./pages/SkillsPage";
import CreateAgentPage from "./pages/CreateAgentPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import WorkflowsPage from "./pages/WorkflowsPage";
import SchedulerPage from "./pages/SchedulerPage";
import NotificationsPage from "./pages/NotificationsPage";
import LLMProvidersPage from "./pages/LLMProvidersPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import CollaborationPage from "./pages/CollaborationPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/mcp" element={<McpPage />} />
            <Route path="/mcp/deploy" element={<DeployMcpPage />} />
            <Route path="/monitor" element={<MonitorPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/my-agents" element={<MyAgentsPage />} />
            <Route path="/create" element={<CreateAgentPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/scheduler" element={<SchedulerPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/llm-providers" element={<LLMProvidersPage />} />
            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="/collaboration" element={<CollaborationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
