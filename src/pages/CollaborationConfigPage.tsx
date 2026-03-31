import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Plus, X, GripVertical,
  Zap, Users, Settings2, Play, Sparkles, AlertCircle,
  ChevronDown, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { collaborationModes, roleDefinitions, type CollaborationMode, type AgentRole } from "@/data/collaboration";
import { platformAgents } from "@/data/agents";
import { toast } from "sonner";

interface SelectedRole {
  roleId: AgentRole;
  agentSource: "platform" | "custom";
  agentId?: string;
  customPrompt: string;
  order: number;
}

const steps = ["协作模式", "角色配置", "任务与参数", "确认启动"];

const CollaborationConfigPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 0: Mode
  const [selectedMode, setSelectedMode] = useState<CollaborationMode | "">("");

  // Step 1: Roles
  const [selectedRoles, setSelectedRoles] = useState<SelectedRole[]>([]);
  const [roleSearch, setRoleSearch] = useState("");

  // Step 2: Task
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [maxTokens, setMaxTokens] = useState([50000]);
  const [timeout, setTimeout] = useState([30]);
  const [autoRetry, setAutoRetry] = useState(true);
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);

  const filteredRoles = useMemo(() => {
    if (!roleSearch) return roleDefinitions;
    return roleDefinitions.filter(
      (r) => r.name.includes(roleSearch) || r.description.includes(roleSearch)
    );
  }, [roleSearch]);

  const isRoleSelected = (roleId: AgentRole) =>
    selectedRoles.some((r) => r.roleId === roleId);

  const addRole = (roleId: AgentRole) => {
    if (isRoleSelected(roleId)) return;
    setSelectedRoles((prev) => [
      ...prev,
      {
        roleId,
        agentSource: "platform",
        customPrompt: "",
        order: prev.length + 1,
      },
    ]);
  };

  const removeRole = (roleId: AgentRole) => {
    setSelectedRoles((prev) => {
      const filtered = prev.filter((r) => r.roleId !== roleId);
      return filtered.map((r, i) => ({ ...r, order: i + 1 }));
    });
  };

  const updateRole = (roleId: AgentRole, updates: Partial<SelectedRole>) => {
    setSelectedRoles((prev) =>
      prev.map((r) => (r.roleId === roleId ? { ...r, ...updates } : r))
    );
  };

  const moveRole = (index: number, direction: "up" | "down") => {
    const newRoles = [...selectedRoles];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newRoles.length) return;
    [newRoles[index], newRoles[swapIndex]] = [newRoles[swapIndex], newRoles[index]];
    setSelectedRoles(newRoles.map((r, i) => ({ ...r, order: i + 1 })));
  };

  const canNext = () => {
    if (step === 0) return !!selectedMode;
    if (step === 1) return selectedRoles.length >= 2;
    if (step === 2) return !!taskName.trim();
    return true;
  };

  const handleLaunch = () => {
    toast.success("协作任务已创建", {
      description: `${taskName} - ${selectedRoles.length} 个 Agent 参与`,
    });
    navigate("/collaboration");
  };

  const modeData = collaborationModes.find((m) => m.id === selectedMode);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/collaboration")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">自定义多 Agent 协作</h1>
          <p className="text-sm text-muted-foreground mt-1">
            自由组合 Agent 角色，配置协作模式和任务参数
          </p>
        </div>
      </motion.div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {s}
            </span>
            {i < steps.length - 1 && <div className={`w-8 h-px ${i < step ? "bg-primary/50" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: 协作模式选择 */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <p className="text-sm text-muted-foreground">选择 Agent 之间的协作方式</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collaborationModes.map((mode) => {
                const isSelected = selectedMode === mode.id;
                return (
                  <Card
                    key={mode.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "border-primary/50 shadow-lg ring-2 ring-primary/20"
                        : "border-border/50 hover:border-primary/30 hover:shadow-md"
                    }`}
                    onClick={() => setSelectedMode(mode.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{mode.emoji}</span>
                          <div>
                            <CardTitle className="text-base">{mode.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">{mode.description}</CardDescription>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {mode.id === "parallel" && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex -space-x-1">
                            {["🔬", "📊", "💻"].map((e, i) => (
                              <span key={i} className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs border-2 border-card">{e}</span>
                            ))}
                          </div>
                          <span>所有角色同时执行，最终汇总</span>
                        </div>
                      )}
                      {mode.id === "sequential" && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {["🔬", "→", "💻", "→", "🔍"].map((e, i) => (
                            <span key={i} className={e === "→" ? "text-primary" : "h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs"}>{e}</span>
                          ))}
                          <span className="ml-2">按顺序逐步传递</span>
                        </div>
                      )}
                      {mode.id === "hierarchical" && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs">🎯</span>
                            <span>协调者分配 →</span>
                            <div className="flex -space-x-1">
                              {["🔬", "📊"].map((e, i) => (
                                <span key={i} className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs border-2 border-card">{e}</span>
                              ))}
                            </div>
                            <span>→ 协调者整合</span>
                          </div>
                        </div>
                      )}
                      {mode.id === "debate" && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs">🔬</span>
                          <span className="text-primary font-medium">⚡</span>
                          <span className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs">📊</span>
                          <span className="ml-2">多角度辩论达成共识</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 1: 角色配置 */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">选择参与协作的 Agent 角色（至少 2 个）</p>
                {modeData && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {modeData.emoji} {modeData.name}
                  </Badge>
                )}
              </div>
              <Badge variant="secondary">{selectedRoles.length} 个已选</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left: Role catalog */}
              <div className="lg:col-span-2 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    placeholder="搜索角色..."
                    className="pl-10 bg-secondary/50 border-border/50 h-9"
                  />
                </div>
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {filteredRoles.map((role) => {
                    const selected = isRoleSelected(role.id);
                    return (
                      <button
                        key={role.id}
                        onClick={() => (selected ? removeRole(role.id) : addRole(role.id))}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          selected
                            ? "border-primary/50 bg-primary/5"
                            : "border-border/50 hover:border-primary/30 bg-card"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-lg flex-shrink-0`}>
                            {role.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{role.name}</span>
                              {selected && <Check className="h-3.5 w-3.5 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{role.description}</p>
                          </div>
                          {!selected && <Plus className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Selected roles config */}
              <div className="lg:col-span-3 space-y-3">
                <Label className="text-sm font-medium">
                  {selectedMode === "sequential" ? "执行顺序（拖动调整）" : "已选角色"}
                </Label>
                {selectedRoles.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground border border-dashed border-border/50 rounded-xl">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">从左侧选择 Agent 角色</p>
                    <p className="text-xs mt-1">至少选择 2 个角色</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedRoles.map((sr, index) => {
                      const roleDef = roleDefinitions.find((r) => r.id === sr.roleId);
                      if (!roleDef) return null;
                      return (
                        <Card key={sr.roleId} className="border-border/50">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              {(selectedMode === "sequential" || selectedMode === "hierarchical") && (
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    onClick={() => moveRole(index, "up")}
                                    disabled={index === 0}
                                    className="h-5 w-5 rounded flex items-center justify-center hover:bg-secondary disabled:opacity-20 text-muted-foreground"
                                  >
                                    <ChevronDown className="h-3 w-3 rotate-180" />
                                  </button>
                                  <button
                                    onClick={() => moveRole(index, "down")}
                                    disabled={index === selectedRoles.length - 1}
                                    className="h-5 w-5 rounded flex items-center justify-center hover:bg-secondary disabled:opacity-20 text-muted-foreground"
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${roleDef.gradient} flex items-center justify-center text-lg flex-shrink-0`}>
                                {roleDef.emoji}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {(selectedMode === "sequential" || selectedMode === "hierarchical") && (
                                    <Badge variant="outline" className="text-xs h-5">
                                      #{sr.order}
                                    </Badge>
                                  )}
                                  <span className="text-sm font-medium">{roleDef.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{roleDef.description}</p>
                              </div>
                              <button
                                onClick={() => removeRole(sr.roleId)}
                                className="h-7 w-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Agent source */}
                            <div className="flex items-center gap-3">
                              <Label className="text-xs text-muted-foreground w-20 flex-shrink-0">执行 Agent</Label>
                              <Select
                                value={sr.agentSource}
                                onValueChange={(v) => updateRole(sr.roleId, { agentSource: v as "platform" | "custom" })}
                              >
                                <SelectTrigger className="h-8 text-xs bg-secondary/50 border-border/50">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="platform">平台自动分配</SelectItem>
                                  <SelectItem value="custom">指定 Agent</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {sr.agentSource === "custom" && (
                              <div className="flex items-center gap-3">
                                <Label className="text-xs text-muted-foreground w-20 flex-shrink-0">选择 Agent</Label>
                                <Select
                                  value={sr.agentId || ""}
                                  onValueChange={(v) => updateRole(sr.roleId, { agentId: v })}
                                >
                                  <SelectTrigger className="h-8 text-xs bg-secondary/50 border-border/50">
                                    <SelectValue placeholder="选择一个 Agent" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {platformAgents.map((a) => (
                                      <SelectItem key={a.id} value={a.id}>
                                        {a.emoji} {a.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Custom instructions */}
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">角色指令（可选）</Label>
                              <Textarea
                                value={sr.customPrompt}
                                onChange={(e) => updateRole(sr.roleId, { customPrompt: e.target.value })}
                                placeholder={`给 ${roleDef.name} 的额外指令...`}
                                className="text-xs min-h-[60px] bg-secondary/50 border-border/50"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: 任务与参数 */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Task info */}
              <div className="space-y-4">
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">任务信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">任务名称 *</Label>
                      <Input
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        placeholder="例如：Q2 行业深度研究报告"
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">任务描述</Label>
                      <Textarea
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        placeholder="详细描述任务目标、输入数据、期望输出..."
                        className="bg-secondary/50 border-border/50 min-h-[120px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Parameters */}
              <div className="space-y-4">
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">运行参数</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Token 上限</Label>
                        <span className="text-xs text-muted-foreground font-mono">{(maxTokens[0] / 1000).toFixed(0)}k</span>
                      </div>
                      <Slider
                        value={maxTokens}
                        onValueChange={setMaxTokens}
                        min={5000}
                        max={200000}
                        step={5000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5k</span>
                        <span>200k</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">超时时间</Label>
                        <span className="text-xs text-muted-foreground font-mono">{timeout[0]} 分钟</span>
                      </div>
                      <Slider
                        value={timeout}
                        onValueChange={setTimeout}
                        min={5}
                        max={120}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5 分钟</span>
                        <span>120 分钟</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label className="text-sm">失败自动重试</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Agent 执行失败时自动重试</p>
                      </div>
                      <Switch checked={autoRetry} onCheckedChange={setAutoRetry} />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label className="text-sm">完成通知</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">协作完成后发送通知</p>
                      </div>
                      <Switch checked={notifyOnComplete} onCheckedChange={setNotifyOnComplete} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: 确认启动 */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{taskName}</CardTitle>
                    <CardDescription>{taskDescription || "自定义多 Agent 协作任务"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Mode */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <span className="text-xl">{modeData?.emoji}</span>
                  <div>
                    <p className="text-sm font-medium">{modeData?.name}</p>
                    <p className="text-xs text-muted-foreground">{modeData?.description}</p>
                  </div>
                </div>

                {/* Roles summary */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">参与角色（{selectedRoles.length}）</Label>
                  <div className="grid gap-2">
                    {selectedRoles.map((sr) => {
                      const roleDef = roleDefinitions.find((r) => r.id === sr.roleId);
                      if (!roleDef) return null;
                      const assignedAgent = sr.agentSource === "custom" && sr.agentId
                        ? platformAgents.find((a) => a.id === sr.agentId)
                        : null;
                      return (
                        <div key={sr.roleId} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
                          {(selectedMode === "sequential" || selectedMode === "hierarchical") && (
                            <Badge variant="outline" className="text-xs h-5 w-5 flex items-center justify-center p-0">
                              {sr.order}
                            </Badge>
                          )}
                          <span className="text-lg">{roleDef.emoji}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{roleDef.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {assignedAgent ? `指定：${assignedAgent.emoji} ${assignedAgent.name}` : "平台自动分配"}
                            </p>
                          </div>
                          {sr.customPrompt && (
                            <Badge variant="secondary" className="text-xs">有自定义指令</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Parameters summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/30 text-center">
                    <p className="text-lg font-semibold">{(maxTokens[0] / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-muted-foreground">Token 上限</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 text-center">
                    <p className="text-lg font-semibold">{timeout[0]}min</p>
                    <p className="text-xs text-muted-foreground">超时时间</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 text-center">
                    <p className="text-lg font-semibold">{autoRetry ? "开启" : "关闭"}</p>
                    <p className="text-xs text-muted-foreground">自动重试</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 text-center">
                    <p className="text-lg font-semibold">{notifyOnComplete ? "开启" : "关闭"}</p>
                    <p className="text-xs text-muted-foreground">完成通知</p>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    <p>启动后将消耗 Token 资源，预估本次协作消耗约 <span className="text-foreground font-medium">{(maxTokens[0] * 0.3 / 1000).toFixed(0)}k ~ {(maxTokens[0] * 0.8 / 1000).toFixed(0)}k tokens</span></p>
                    <p className="mt-1">运行中可随时暂停或终止</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <Button variant="outline" onClick={() => (step > 0 ? setStep(step - 1) : navigate("/collaboration"))}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step > 0 ? "上一步" : "返回"}
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
            下一步
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleLaunch} className="bg-primary text-primary-foreground">
            <Play className="h-4 w-4 mr-2" />
            启动协作
          </Button>
        )}
      </div>
    </div>
  );
};

export default CollaborationConfigPage;
