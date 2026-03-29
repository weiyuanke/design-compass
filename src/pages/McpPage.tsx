import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, ExternalLink, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { platformMcpServers, userMcpServers } from "@/data/mcpServers";

const statusMap = {
  online: { label: "运行中", class: "text-emerald-500" },
  offline: { label: "已停止", class: "text-muted-foreground" },
  deploying: { label: "部署中", class: "text-amber-500" },
};

const McpPage = () => {
  const [search, setSearch] = useState("");

  const filteredPlatform = platformMcpServers.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.description.includes(search) || s.category.includes(search)
  );

  const filteredUser = userMcpServers.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.description.includes(search)
  );

  return (
    <div className="p-6 lg:p-8 max-w-full space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">MCP Server</h1>
        <p className="text-sm text-muted-foreground mt-1">
          管理平台内置与自建的 MCP Server，为 Agent 提供工具能力
        </p>
      </motion.div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索 MCP Server..."
            className="pl-10 bg-secondary/50 border-border/50 h-10"
          />
        </div>
      </div>

      <Tabs defaultValue="platform" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="platform">平台内置 ({platformMcpServers.length})</TabsTrigger>
          <TabsTrigger value="user">我的 MCP ({userMcpServers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredPlatform.map((server, i) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex flex-col gap-3 p-5 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center text-xl flex-shrink-0">
                    {server.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{server.name}</span>
                      <Badge variant="secondary" className="text-xs">{server.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{server.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Circle className={`h-2 w-2 fill-current ${statusMap[server.status].class}`} />
                      {statusMap[server.status].label}
                    </span>
                    <span>{server.tools} 个工具</span>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5 h-8">
                    <ExternalLink className="h-3.5 w-3.5" />
                    查看详情
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              部署新 MCP
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredUser.map((server, i) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex flex-col gap-3 p-5 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center text-xl flex-shrink-0">
                    {server.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{server.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{server.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Circle className={`h-2 w-2 fill-current ${statusMap[server.status].class}`} />
                      {statusMap[server.status].label}
                    </span>
                    <span>{server.tools} 个工具</span>
                    <span>创建于 {server.created}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-mono truncate bg-secondary/50 rounded px-2 py-1">
                  {server.endpoint}
                </div>
              </motion.div>
            ))}
            {filteredUser.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">
                暂无自建 MCP Server，点击上方按钮部署
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default McpPage;
