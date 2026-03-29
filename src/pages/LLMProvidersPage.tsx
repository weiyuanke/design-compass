import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Key,
  TestTube,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Provider {
  id: string;
  name: string;
  type: string;
  baseUrl: string;
  apiKey: string;
  status: "active" | "inactive";
  models: number;
  lastTested?: string;
  testStatus?: "success" | "failed";
}

interface Model {
  id: string;
  name: string;
  providerId: string;
  providerName: string;
  type: "chat" | "completion" | "embedding";
  contextWindow: string;
  status: "available" | "unavailable";
}

const initialProviders: Provider[] = [
  {
    id: "p-1",
    name: "OpenAI",
    type: "openai",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "sk-***1234",
    status: "active",
    models: 12,
    lastTested: "2026-03-29 10:30",
    testStatus: "success",
  },
  {
    id: "p-2",
    name: "Anthropic",
    type: "anthropic",
    baseUrl: "https://api.anthropic.com",
    apiKey: "sk-ant-***5678",
    status: "active",
    models: 5,
    lastTested: "2026-03-29 09:15",
    testStatus: "success",
  },
  {
    id: "p-3",
    name: "Azure OpenAI",
    type: "azure",
    baseUrl: "https://xxx.openai.azure.com",
    apiKey: "***abcd",
    status: "active",
    models: 8,
    lastTested: "2026-03-28 16:00",
    testStatus: "success",
  },
  {
    id: "p-4",
    name: "本地 Ollama",
    type: "ollama",
    baseUrl: "http://localhost:11434",
    apiKey: "-",
    status: "inactive",
    models: 3,
    lastTested: "2026-03-25 11:00",
    testStatus: "failed",
  },
];

const initialModels: Model[] = [
  { id: "m-1", name: "gpt-4o", providerId: "p-1", providerName: "OpenAI", type: "chat", contextWindow: "128K", status: "available" },
  { id: "m-2", name: "gpt-4o-mini", providerId: "p-1", providerName: "OpenAI", type: "chat", contextWindow: "128K", status: "available" },
  { id: "m-3", name: "gpt-3.5-turbo", providerId: "p-1", providerName: "OpenAI", type: "chat", contextWindow: "16K", status: "available" },
  { id: "m-4", name: "text-embedding-3-large", providerId: "p-1", providerName: "OpenAI", type: "embedding", contextWindow: "8K", status: "available" },
  { id: "m-5", name: "claude-3-5-sonnet", providerId: "p-2", providerName: "Anthropic", type: "chat", contextWindow: "200K", status: "available" },
  { id: "m-6", name: "claude-3-opus", providerId: "p-2", providerName: "Anthropic", type: "chat", contextWindow: "200K", status: "available" },
  { id: "m-7", name: "gpt-4", providerId: "p-3", providerName: "Azure OpenAI", type: "chat", contextWindow: "128K", status: "available" },
  { id: "m-8", name: "gpt-35-turbo", providerId: "p-3", providerName: "Azure OpenAI", type: "chat", contextWindow: "16K", status: "available" },
  { id: "m-9", name: "llama3:8b", providerId: "p-4", providerName: "本地 Ollama", type: "chat", contextWindow: "8K", status: "unavailable" },
  { id: "m-10", name: "llama3:70b", providerId: "p-4", providerName: "本地 Ollama", type: "chat", contextWindow: "8K", status: "unavailable" },
];

const LLMProvidersPage = () => {
  const [activeTab, setActiveTab] = useState("providers");
  const [providers, setProviders] = useState(initialProviders);
  const [models] = useState(initialModels);
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  const toggleProviderStatus = (id: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p
      )
    );
  };

  const testConnection = (id: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, testStatus: "success", lastTested: new Date().toLocaleString("zh-CN") } : p
      )
    );
  };

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">大模型配置</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理 LLM Provider、API Key 和可用模型
          </p>
        </div>
        <Dialog open={isProviderOpen} onOpenChange={setIsProviderOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              添加 Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>添加 LLM Provider</DialogTitle>
              <DialogDescription>
                配置大模型服务提供商的接入信息
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="provider-name">Provider 名称</Label>
                <Input id="provider-name" placeholder="例如：OpenAI 主账号" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="provider-type">类型</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择 Provider 类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI 兼容</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="azure">Azure OpenAI</SelectItem>
                    <SelectItem value="ollama">Ollama (本地)</SelectItem>
                    <SelectItem value="custom">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="base-url">Base URL</Label>
                <Input id="base-url" placeholder="https://api.openai.com/v1" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input id="api-key" type="password" placeholder="sk-..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProviderOpen(false)}>
                取消
              </Button>
              <Button onClick={() => setIsProviderOpen(false)}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="providers">Provider 列表</TabsTrigger>
          <TabsTrigger value="models">模型列表</TabsTrigger>
          <TabsTrigger value="test">连接测试</TabsTrigger>
        </TabsList>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider, i) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/5 flex items-center justify-center text-xl">
                          {provider.type === "openai" && "🟢"}
                          {provider.type === "anthropic" && "🟠"}
                          {provider.type === "azure" && "🔵"}
                          {provider.type === "ollama" && "🟣"}
                          {provider.type === "custom" && "⚪"}
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">
                            {provider.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {provider.type} • {provider.baseUrl}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={provider.status === "active" ? "default" : "secondary"}
                        className={`text-xs ${
                          provider.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                            : ""
                        }`}
                      >
                        {provider.status === "active" ? "启用" : "停用"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <Key className="h-3.5 w-3.5 text-muted-foreground" />
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                        {showApiKeys[provider.id] ? provider.apiKey : "••••••••"}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleApiKeyVisibility(provider.id)}
                      >
                        {showApiKeys[provider.id] ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => navigator.clipboard.writeText(provider.apiKey)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{provider.models} 个模型</span>
                      {provider.lastTested && (
                        <div className="flex items-center gap-1">
                          {provider.testStatus === "success" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          )}
                          <span>测试于 {provider.lastTested}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => testConnection(provider.id)}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      测试连接
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleProviderStatus(provider.id)}
                      >
                        {provider.status === "active" ? (
                          <Zap className="h-4 w-4" />
                        ) : (
                          <Zap className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit2 className="h-3.5 w-3.5" /> 编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" /> 删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索模型..."
              className="pl-10 bg-secondary/50 border-border/50 h-10"
            />
          </div>

          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm">
                        {model.type === "chat" && "💬"}
                        {model.type === "completion" && "📝"}
                        {model.type === "embedding" && "🔢"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{model.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {model.providerName} • {model.contextWindow} 上下文
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {model.type === "chat" && "对话"}
                        {model.type === "completion" && "补全"}
                        {model.type === "embedding" && "嵌入"}
                      </Badge>
                      {model.status === "available" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-4 mt-4">
          <Alert>
            <AlertDescription>
              在此测试与 Provider 的连接，验证 API Key 是否有效
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>连接测试</CardTitle>
              <CardDescription>
                选择一个 Provider 和模型进行测试
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>选择 Provider</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择 Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="p-1">OpenAI</SelectItem>
                    <SelectItem value="p-2">Anthropic</SelectItem>
                    <SelectItem value="p-3">Azure OpenAI</SelectItem>
                    <SelectItem value="p-4">本地 Ollama</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>选择模型</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                    <SelectItem value="claude-3-5-sonnet">claude-3-5-sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="test-prompt">测试 Prompt</Label>
                <Textarea
                  id="test-prompt"
                  placeholder="输入测试消息，例如：Hello, who are you?"
                  defaultValue="Hello, who are you?"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <TestTube className="h-4 w-4 mr-2" />
                运行测试
              </Button>
            </CardFooter>
          </Card>

          {/* Test Result */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                测试结果
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Provider</span>
                <span>OpenAI</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">模型</span>
                <span>gpt-4o</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">响应时间</span>
                <span className="text-emerald-500">234ms</span>
              </div>
              <div className="bg-muted p-3 rounded-lg text-sm font-mono">
                <p className="text-muted-foreground mb-2">// Response:</p>
                <p>Hello! I'm an AI assistant powered by GPT-4. How can I help you today?</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LLMProvidersPage;
