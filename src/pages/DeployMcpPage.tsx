import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Server } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface EnvVar {
  key: string;
  value: string;
}

const DeployMcpPage = () => {
  const navigate = useNavigate();

  // 基础信息
  const [name, setName] = useState("");
  const [namespace, setNamespace] = useState("default");
  const [labels, setLabels] = useState("");

  // 传输层
  const [transportType, setTransportType] = useState<"stdio" | "http">("http");
  const [httpPort, setHttpPort] = useState("");
  const [httpPath, setHttpPath] = useState("");

  // 部署配置
  const [image, setImage] = useState("");
  const [cmd, setCmd] = useState("");
  const [args, setArgs] = useState("");
  const [port, setPort] = useState("3000");
  const [pullPolicy, setPullPolicy] = useState("IfNotPresent");
  const [envVars, setEnvVars] = useState<EnvVar[]>([{ key: "", value: "" }]);

  const addEnvVar = () => setEnvVars([...envVars, { key: "", value: "" }]);
  const removeEnvVar = (i: number) => setEnvVars(envVars.filter((_, idx) => idx !== i));
  const updateEnvVar = (i: number, field: "key" | "value", val: string) => {
    const updated = [...envVars];
    updated[i][field] = val;
    setEnvVars(updated);
  };

  const handleSubmit = () => {
    if (!name.trim()) { toast.error("请输入 MCP Server 名称"); return; }
    if (!namespace.trim()) { toast.error("请输入命名空间"); return; }
    if (!image.trim()) { toast.error("请输入容器镜像地址"); return; }
    if (transportType === "http" && !httpPort.trim()) { toast.error("请输入 HTTP 服务端口号"); return; }

    toast.success("MCP Server 部署请求已提交");
    navigate("/mcp");
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/mcp")} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">部署新 MCP Server</h1>
          <p className="text-sm text-muted-foreground mt-0.5">填写以下信息创建并部署 MCP Server</p>
        </div>
      </motion.div>

      {/* 基础信息 */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              基础信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm">
                  名称 <span className="text-destructive">*</span>
                </Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-mcp-server" className="bg-secondary/30 border-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">
                  命名空间 <span className="text-destructive">*</span>
                </Label>
                <Input value={namespace} onChange={(e) => setNamespace(e.target.value)} placeholder="default" className="bg-secondary/30 border-border/50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">标签</Label>
              <Input value={labels} onChange={(e) => setLabels(e.target.value)} placeholder="app=mcp, env=prod（逗号分隔）" className="bg-secondary/30 border-border/50" />
              <p className="text-xs text-muted-foreground">key=value 格式，多个标签用逗号分隔</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 传输层配置 */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">传输层配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">传输类型</Label>
              <Select value={transportType} onValueChange={(v: "stdio" | "http") => setTransportType(v)}>
                <SelectTrigger className="bg-secondary/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stdio">stdio</SelectItem>
                  <SelectItem value="http">HTTP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {transportType === "http" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm">
                    HTTP 端口 <span className="text-destructive">*</span>
                  </Label>
                  <Input type="number" value={httpPort} onChange={(e) => setHttpPort(e.target.value)} placeholder="8080" className="bg-secondary/30 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">MCP 路径</Label>
                  <Input value={httpPath} onChange={(e) => setHttpPath(e.target.value)} placeholder="/mcp（可选）" className="bg-secondary/30 border-border/50" />
                </div>
              </div>
            )}

            {transportType === "stdio" && (
              <div className="rounded-lg bg-secondary/30 p-4 text-sm text-muted-foreground">
                stdio 传输模式无需额外配置，将通过标准输入/输出与 Agent 通信。
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* 部署配置 */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">部署配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">
                容器镜像 <span className="text-destructive">*</span>
              </Label>
              <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="registry.example.com/my-mcp:latest" className="bg-secondary/30 border-border/50 font-mono text-sm" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm">启动命令</Label>
                <Input value={cmd} onChange={(e) => setCmd(e.target.value)} placeholder="node（可选）" className="bg-secondary/30 border-border/50 font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">启动参数</Label>
                <Input value={args} onChange={(e) => setArgs(e.target.value)} placeholder="server.js --port 3000（可选）" className="bg-secondary/30 border-border/50 font-mono text-sm" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm">服务端口</Label>
                <Input type="number" value={port} onChange={(e) => setPort(e.target.value)} placeholder="3000" className="bg-secondary/30 border-border/50" />
                <p className="text-xs text-muted-foreground">默认 3000</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">镜像拉取策略</Label>
                <Select value={pullPolicy} onValueChange={setPullPolicy}>
                  <SelectTrigger className="bg-secondary/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Always">Always</SelectItem>
                    <SelectItem value="Never">Never</SelectItem>
                    <SelectItem value="IfNotPresent">IfNotPresent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 环境变量 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">环境变量</Label>
                <Button type="button" variant="outline" size="sm" onClick={addEnvVar} className="gap-1.5 h-7 text-xs">
                  <Plus className="h-3 w-3" />
                  添加
                </Button>
              </div>
              {envVars.map((env, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={env.key}
                    onChange={(e) => updateEnvVar(i, "key", e.target.value)}
                    placeholder="KEY"
                    className="flex-1 bg-secondary/30 border-border/50 font-mono text-sm"
                  />
                  <span className="text-muted-foreground">=</span>
                  <Input
                    value={env.value}
                    onChange={(e) => updateEnvVar(i, "value", e.target.value)}
                    placeholder="value"
                    className="flex-1 bg-secondary/30 border-border/50 font-mono text-sm"
                  />
                  <Button type="button" variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeEnvVar(i)} disabled={envVars.length === 1}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 pb-8">
        <Button onClick={handleSubmit} className="gap-2">
          <Server className="h-4 w-4" />
          提交部署
        </Button>
        <Button variant="outline" onClick={() => navigate("/mcp")}>
          取消
        </Button>
      </motion.div>
    </div>
  );
};

export default DeployMcpPage;
