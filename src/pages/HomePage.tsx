import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, Shield, ArrowRight,
  MessageSquare, Users, Workflow, Clock,
  TrendingUp, Zap, FileText, Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { platformAgents, myAgents } from "@/data/agents";
import { collaborationTemplates } from "@/data/collaboration";

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // 运行中的 Agent
  const runningAgents = myAgents.filter((a) => a.status === "active");

  // 热门 Agent（按调用量）
  const hotAgents = [...platformAgents].sort((a, b) => b.calls - a.calls).slice(0, 4);

  // 最近协作
  const recentCollaborations = collaborationTemplates.slice(0, 3);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Hero Section - 保留 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border border-primary/20"
      >
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Shield className="h-3 w-3 mr-1" />
              企业级 Agent 平台
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            欢迎回来，<span className="text-gradient-primary">张三</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            统一的 AI Agent 管理与协作平台，让智能体像团队一样工作
          </p>
          
          {/* Search */}
          <div className="relative max-w-xl pt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索 Agent、工作流、知识库..." 
              className="pl-10 bg-background/80 backdrop-blur border-border/50 focus:border-primary/50 h-11" 
            />
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </motion.div>

      {/* Section 1: 快速开始 - 核心功能入口 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">快速开始</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="group hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate("/chat")}>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">开始对话</p>
                  <p className="text-xs text-muted-foreground">与 Agent 交互</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:border-purple-500/50 transition-all cursor-pointer" onClick={() => navigate("/collaboration")}>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">多 Agent 协作</p>
                  <p className="text-xs text-muted-foreground">团队式工作</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:border-emerald-500/50 transition-all cursor-pointer" onClick={() => navigate("/workflows")}>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Workflow className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">工作流编排</p>
                  <p className="text-xs text-muted-foreground">自动化流程</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:border-amber-500/50 transition-all cursor-pointer" onClick={() => navigate("/scheduler")}>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">定时任务</p>
                  <p className="text-xs text-muted-foreground">计划执行</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 2: 我的工作台 - 个人 Agent 和协作 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">我的工作台</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 运行中的 Agent */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-500" />
                  <CardTitle className="text-base">运行中的 Agent</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/my-agents")} className="text-xs h-7">
                  管理 <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {runningAgents.length > 0 ? (
                <div className="space-y-2">
                  {runningAgents.slice(0, 3).map((agent) => (
                    <div 
                      key={agent.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/chat?agent=${agent.id}`)}
                    >
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm">
                        {agent.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.vmRegion}</p>
                      </div>
                      <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                        VM
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">暂无运行中的 Agent</p>
                  <Button variant="link" onClick={() => navigate("/my-agents")} className="text-xs">
                    创建一个 <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 最近协作 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-base">协作模板</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/collaboration")} className="text-xs h-7">
                  全部 <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentCollaborations.map((template) => (
                  <div 
                    key={template.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/collaboration/new?template=${template.id}`)}
                  >
                    <span className="text-lg">{template.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{template.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{template.useCase}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 3: 平台 Agent - 热门/推荐 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">平台 Agent</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/tools")} className="text-sm">
            查看全部 <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {hotAgents.map((agent) => (
            <Card 
              key={agent.id} 
              className="group hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => navigate(`/chat?agent=${agent.id}`)}
            >
              <CardHeader className="pb-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform`}>
                  {agent.emoji}
                </div>
                <CardTitle className="text-sm font-semibold">{agent.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{agent.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">{agent.category}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {(agent.calls / 1000).toFixed(0)}k
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
