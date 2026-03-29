import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Trash2,
  Upload,
  FileText,
  FolderOpen,
  Database,
  Code2,
  MoreHorizontal,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface KnowledgeSource {
  id: string;
  name: string;
  type: "pdf" | "word" | "excel" | "code" | "database";
  path: string;
  size: string;
  updatedAt: string;
  status: "indexed" | "pending" | "failed";
  docCount?: number;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  sourceCount: number;
  vectorCount: number;
  updatedAt: string;
}

const initialSources: KnowledgeSource[] = [
  { id: "s-1", name: "2026 年 A 股策略报告.pdf", type: "pdf", path: "/docs/strategy/2026-a-share.pdf", size: "12.5 MB", updatedAt: "2026-03-28", status: "indexed", docCount: 156 },
  { id: "s-2", name: "Q1 交易记录汇总.xlsx", type: "excel", path: "/docs/trading/q1-records.xlsx", size: "8.2 MB", updatedAt: "2026-03-27", status: "indexed", docCount: 2340 },
  { id: "s-3", name: "因子挖掘代码库", type: "code", path: "/src/factors/", size: "-", updatedAt: "2026-03-26", status: "indexed", docCount: 45 },
  { id: "s-4", name: "历史回测报告.docx", type: "word", path: "/docs/backtest/2025-report.docx", size: "5.8 MB", updatedAt: "2026-03-25", status: "indexed", docCount: 89 },
  { id: "s-5", name: "实时行情数据库", type: "database", path: "postgres://market-data", size: "-", updatedAt: "2026-03-29", status: "indexed", docCount: 150000 },
];

const initialCollections: Collection[] = [
  { id: "c-1", name: "内部研报库", description: "券商研报、内部策略报告", sourceCount: 256, vectorCount: 45000, updatedAt: "2026-03-29" },
  { id: "c-2", name: "历史交易记录", description: "2024 年至今的交易记录和持仓数据", sourceCount: 12, vectorCount: 28000, updatedAt: "2026-03-28" },
  { id: "c-3", name: "策略文档与代码", description: "策略说明文档和关联代码", sourceCount: 38, vectorCount: 12000, updatedAt: "2026-03-27" },
];

const KnowledgeBasePage = () => {
  const [activeTab, setActiveTab] = useState("sources");
  const [sources] = useState(initialSources);
  const [collections] = useState(initialCollections);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">知识库 RAG</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理文档、代码、数据库等知识源，为 Agent 提供检索增强
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCollectionOpen} onOpenChange={setIsCollectionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderOpen className="h-4 w-4 mr-2" />
                新建知识库
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>创建知识库</DialogTitle>
                <DialogDescription>
                  创建一个知识库集合，用于组织相关的文档和数据
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="collection-name">知识库名称</Label>
                  <Input id="collection-name" placeholder="例如：宏观研报库" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="collection-desc">描述</Label>
                  <Textarea
                    id="collection-desc"
                    placeholder="描述这个知识库的用途..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCollectionOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setIsCollectionOpen(false)}>创建</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Upload className="h-4 w-4 mr-2" />
                上传文档
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>上传文档</DialogTitle>
                <DialogDescription>
                  支持 PDF、Word、Excel 等格式，自动进行向量化处理
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">点击或拖拽文件到此处</p>
                  <p className="text-xs text-muted-foreground mt-1">支持 PDF、Word、Excel、TXT</p>
                </div>
                <div className="grid gap-2">
                  <Label>选择知识库</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option>内部研报库</option>
                    <option>历史交易记录</option>
                    <option>策略文档与代码</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>自动向量化</Label>
                    <p className="text-xs text-muted-foreground">上传后立即进行 Embedding</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setIsUploadOpen(false)}>上传</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>文档总数</CardDescription>
            <CardTitle className="text-2xl">150,433</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+1,234 本周新增</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>向量数量</CardDescription>
            <CardTitle className="text-2xl">85,000</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">平均每个文档 5.6 个向量</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>知识库</CardDescription>
            <CardTitle className="text-2xl">3</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">256 个数据源</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>检索次数 (今日)</CardDescription>
            <CardTitle className="text-2xl">1,892</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-500">↑ 12% 较昨日</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="sources">数据源</TabsTrigger>
          <TabsTrigger value="collections">知识库</TabsTrigger>
          <TabsTrigger value="search">检索测试</TabsTrigger>
        </TabsList>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索数据源..."
              className="pl-10 bg-secondary/50 border-border/50 h-10"
            />
          </div>

          <div className="grid gap-4">
            {sources.map((source) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    {source.type === "pdf" && <FileText className="h-5 w-5 text-red-400" />}
                    {source.type === "word" && <FileText className="h-5 w-5 text-blue-400" />}
                    {source.type === "excel" && <FileText className="h-5 w-5 text-emerald-400" />}
                    {source.type === "code" && <Code2 className="h-5 w-5 text-purple-400" />}
                    {source.type === "database" && <Database className="h-5 w-5 text-amber-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{source.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {source.path} • {source.size} • 更新于 {source.updatedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-xs">
                    {source.docCount?.toLocaleString()} 文档
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      source.status === "indexed"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : source.status === "pending"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {source.status === "indexed" ? "已索引" : source.status === "pending" ? "处理中" : "失败"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <ExternalLink className="h-3.5 w-3.5" /> 查看
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <RefreshCw className="h-3.5 w-3.5" /> 重新索引
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" /> 删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection, i) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/5 flex items-center justify-center">
                        <Database className="h-5 w-5 text-indigo-400" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">编辑</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">管理数据源</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">删除</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-base font-semibold mt-3">
                      {collection.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {collection.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">{collection.sourceCount}</span> 个数据源
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{collection.vectorCount.toLocaleString()}</span> 个向量
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      管理数据源
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>检索测试</CardTitle>
              <CardDescription>
                测试知识库的检索效果，查看返回的相关文档
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>选择知识库</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>内部研报库</option>
                  <option>历史交易记录</option>
                  <option>策略文档与代码</option>
                  <option>全部知识库</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="query">检索 query</Label>
                <Textarea
                  id="query"
                  placeholder="输入检索问题，例如：2026 年 A 股投资策略的核心观点是什么？"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>返回数量</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Top 3</option>
                  <option>Top 5</option>
                  <option>Top 10</option>
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                执行检索
              </Button>
            </CardFooter>
          </Card>

          {/* Search Results */}
          <Card>
            <CardHeader>
              <CardTitle>检索结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Score: 0.92</Badge>
                    <span className="text-xs text-muted-foreground">2026 年 A 股策略报告.pdf</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">查看原文</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  ...我们预计 2026 年 A 股将呈现**结构性牛市**特征，建议重点关注科技创新、高端制造、消费升级三大主线...
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Score: 0.87</Badge>
                    <span className="text-xs text-muted-foreground">Q1 交易记录汇总.xlsx</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">查看原文</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  ...Q1 科技板块持仓占比 35%，收益率 +12.5%；消费板块持仓占比 25%，收益率 +8.3%...
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Score: 0.81</Badge>
                    <span className="text-xs text-muted-foreground">因子挖掘代码库</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">查看原文</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  ...动量因子、价值因子、成长因子在多因子模型中的权重配置建议...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeBasePage;
