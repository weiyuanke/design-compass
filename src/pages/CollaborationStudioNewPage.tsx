import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  GitBranch,
  Network,
  Zap,
  Plus,
  X,
  GripVertical,
  Play,
  Sparkles,
  Settings2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  collaborationTemplates,
  collaborationModes,
  roleDefinitions,
  type CollaborationMode,
  type AgentRole,
} from "@/data/collaboration";

const modeVisuals: Record<CollaborationMode, { icon: typeof Layers; color: string; bgClass: string }> = {
  parallel: { icon: Layers, color: "text-blue-500", bgClass: "from-blue-500/15 to-blue-500/5" },
  sequential: { icon: GitBranch, color: "text-emerald-500", bgClass: "from-emerald-500/15 to-emerald-500/5" },
  hierarchical: { icon: Network, color: "text-violet-500", bgClass: "from-violet-500/15 to-violet-500/5" },
  debate: { icon: Zap, color: "text-amber-500", bgClass: "from-amber-500/15 to-amber-500/5" },
};

const STEPS = ["基本信息", "协作模式", "角色配置", "参数设置", "确认启动"] as const;

const CollaborationStudioNewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template");

  const template = templateId ? collaborationTemplates.find((t) => t.id === templateId) : null;

  const [step, setStep] = useState(0);
  const [name, setName] = useState(template?.name ? `${template.name} - 副本` : "");
  const [description, setDescription] = useState(template?.description || "");
  const [mode, setMode] = useState<CollaborationMode>(template?.mode || "parallel");
  const [selectedRoles, setSelectedRoles] = useState<{ roleId: AgentRole; order: number; instruction: string }[]>(
    template?.roles.map((r) => ({ roleId: r.roleId, order: r.order || 1, instruction: "" })) || []
  );
  const [maxTokens, setMaxTokens] = useState([50000]);
  const [timeout, setTimeoutVal] = useState([30]);
  const [autoRetry, setAutoRetry] = useState(true);
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);

  const canNext = useMemo(() => {
    if (step === 0) return name.trim().length > 0;
    if (step === 2) return selectedRoles.length >= 2;
    return true;
  }, [step, name, selectedRoles]);

  const addRole = (roleId: AgentRole) => {
    if (selectedRoles.find((r) => r.roleId === roleId)) return;
    setSelectedRoles((prev) => [...prev, { roleId, order: prev.length + 1, instruction: "" }]);
  };

  const removeRole = (roleId: AgentRole) => {
    setSelectedRoles((prev) => prev.filter((r) => r.roleId !== roleId).map((r, i) => ({ ...r, order: i + 1 })));
  };

  const moveRole = (index: number, dir: -1 | 1) => {
    const next = [...selectedRoles];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSelectedRoles(next.map((r, i) => ({ ...r, order: i + 1 })));
  };

  const handleLaunch = () => {
    // In a real app this would create the session via API
    navigate("/collaboration-studio");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="px-6 lg:px-8 py-4 max-w-5xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/collaboration-studio")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">
              {template ? `使用蓝图：${template.name}` : "新建编排"}
            </h1>
            <p className="text-sm text-muted-foreground">配置多 Agent 协作任务</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="px-6 lg:px-8 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                    ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : <span className="w-5 text-center">{i + 1}</span>}
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="px-6 lg:px-8 pb-8 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 0: Basic info */}
            {step === 0 && (
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">编排名称 *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：行业研究报告生成"
                    className="bg-card"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">任务描述</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="描述协作任务的目标和预期产出..."
                    className="bg-card min-h-[120px]"
                  />
                </div>
                {template && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 text-sm text-primary font-medium mb-1">
                      <Sparkles className="h-4 w-4" />
                      基于蓝图创建
                    </div>
                    <p className="text-xs text-muted-foreground">
                      已从「{template.name}」蓝图预填模式与角色配置，可按需调整
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Mode selection */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-4 max-w-2xl">
                {collaborationModes.map((m) => {
                  const vis = modeVisuals[m.id];
                  const MIcon = vis.icon;
                  const selected = mode === m.id;
                  return (
                    <Card
                      key={m.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selected
                          ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                          : "border-border/50 hover:border-primary/30"
                      }`}
                      onClick={() => setMode(m.id)}
                    >
                      <CardContent className="p-5">
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${vis.bgClass} flex items-center justify-center mb-3`}>
                          <MIcon className={`h-5 w-5 ${vis.color}`} />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {m.emoji} {m.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{m.description}</p>
                        {selected && (
                          <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                            <Check className="h-3.5 w-3.5" /> 已选择
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Step 2: Role configuration */}
            {step === 2 && (
              <div className="grid grid-cols-5 gap-6">
                {/* Role catalog */}
                <div className="col-span-2 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">角色目录</h3>
                  <div className="space-y-2">
                    {roleDefinitions.map((role) => {
                      const added = selectedRoles.some((r) => r.roleId === role.id);
                      return (
                        <div
                          key={role.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            added ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card hover:border-primary/20"
                          }`}
                        >
                          <span className="text-xl">{role.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{role.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{role.description}</p>
                          </div>
                          <Button
                            size="sm"
                            variant={added ? "outline" : "default"}
                            className="h-7 text-xs"
                            onClick={() => (added ? removeRole(role.id) : addRole(role.id))}
                          >
                            {added ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected roles with ordering */}
                <div className="col-span-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      已选角色 ({selectedRoles.length})
                    </h3>
                    {selectedRoles.length < 2 && (
                      <span className="text-xs text-destructive">至少需要 2 个角色</span>
                    )}
                  </div>

                  {selectedRoles.length === 0 ? (
                    <div className="p-8 rounded-xl border border-dashed border-border text-center text-sm text-muted-foreground">
                      从左侧目录添加角色
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedRoles.map((sr, i) => {
                        const role = roleDefinitions.find((r) => r.id === sr.roleId)!;
                        return (
                          <motion.div
                            key={sr.roleId}
                            layout
                            className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card"
                          >
                            <div className="flex flex-col items-center gap-1 pt-1">
                              <button
                                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                disabled={i === 0}
                                onClick={() => moveRole(i, -1)}
                              >
                                <ChevronUp className="h-3.5 w-3.5" />
                              </button>
                              <span className="text-xs font-mono text-muted-foreground">{i + 1}</span>
                              <button
                                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                disabled={i === selectedRoles.length - 1}
                                onClick={() => moveRole(i, 1)}
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-2xl mt-1">{role.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-foreground">{role.name}</span>
                                <Badge variant="outline" className="text-xs">{role.description}</Badge>
                              </div>
                              <Input
                                placeholder={`为${role.name}设置专属指令（可选）`}
                                className="text-xs h-8 bg-secondary/50"
                                value={sr.instruction}
                                onChange={(e) => {
                                  const next = [...selectedRoles];
                                  next[i] = { ...next[i], instruction: e.target.value };
                                  setSelectedRoles(next);
                                }}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removeRole(sr.roleId)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Flow preview */}
                  {selectedRoles.length >= 2 && (
                    <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
                      <p className="text-xs font-medium text-muted-foreground mb-3">执行流程预览</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {selectedRoles.map((sr, i) => {
                          const role = roleDefinitions.find((r) => r.id === sr.roleId)!;
                          return (
                            <div key={sr.roleId} className="flex items-center gap-1">
                              <div className="h-8 px-3 rounded-full bg-card border border-border/50 flex items-center gap-1.5 text-xs font-medium">
                                <span>{role.emoji}</span>
                                <span className="text-foreground">{role.name}</span>
                              </div>
                              {i < selectedRoles.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Parameters */}
            {step === 3 && (
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    最大 Token 数：{maxTokens[0].toLocaleString()}
                  </label>
                  <Slider value={maxTokens} onValueChange={setMaxTokens} min={5000} max={200000} step={5000} />
                  <p className="text-xs text-muted-foreground mt-1">控制单次编排的总 Token 消耗上限</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    超时时间：{timeout[0]} 分钟
                  </label>
                  <Slider value={timeout} onValueChange={setTimeoutVal} min={5} max={120} step={5} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">失败自动重试</p>
                    <p className="text-xs text-muted-foreground">单个 Agent 失败时自动重试一次</p>
                  </div>
                  <Switch checked={autoRetry} onCheckedChange={setAutoRetry} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">完成通知</p>
                    <p className="text-xs text-muted-foreground">编排完成后发送通知</p>
                  </div>
                  <Switch checked={notifyOnComplete} onCheckedChange={setNotifyOnComplete} />
                </div>
              </div>
            )}

            {/* Step 4: Confirm & Launch */}
            {step === 4 && (
              <div className="space-y-6 max-w-2xl">
                <Card className="border-border/50">
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">编排名称</p>
                      <p className="text-lg font-semibold text-foreground">{name}</p>
                      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">协作模式</p>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const vis = modeVisuals[mode];
                            const MIcon = vis.icon;
                            const mInfo = collaborationModes.find((m) => m.id === mode);
                            return (
                              <>
                                <MIcon className={`h-4 w-4 ${vis.color}`} />
                                <span className="text-sm font-medium text-foreground">{mInfo?.name}</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">参与角色</p>
                        <div className="flex -space-x-1">
                          {selectedRoles.map((sr) => {
                            const role = roleDefinitions.find((r) => r.id === sr.roleId);
                            return (
                              <div
                                key={sr.roleId}
                                className="h-7 w-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs"
                                title={role?.name}
                              >
                                {role?.emoji}
                              </div>
                            );
                          })}
                          <span className="ml-2 text-sm text-muted-foreground self-center">
                            {selectedRoles.length} 个角色
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/30">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Token 上限</p>
                        <p className="text-sm font-mono font-medium text-foreground">{maxTokens[0].toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">超时时间</p>
                        <p className="text-sm font-mono font-medium text-foreground">{timeout[0]} 分钟</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">自动重试</p>
                        <p className="text-sm font-medium text-foreground">{autoRetry ? "是" : "否"}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 text-sm text-primary font-medium mb-1">
                        <Sparkles className="h-4 w-4" />
                        预估资源消耗
                      </div>
                      <p className="text-xs text-muted-foreground">
                        约 {(maxTokens[0] * 0.6 / 1000).toFixed(0)}k tokens · 预计 {Math.ceil(timeout[0] * 0.4)} 分钟完成
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30 max-w-5xl">
          <Button variant="outline" onClick={() => (step > 0 ? setStep(step - 1) : navigate("/collaboration-studio"))}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step > 0 ? "上一步" : "返回"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext}>
              下一步
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
              onClick={handleLaunch}
            >
              <Play className="h-4 w-4 mr-2" />
              启动编排
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationStudioNewPage;
