import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, MessageSquare, Code2, Bot, Settings, Server, Brain, Database, Puzzle, Clock, ExternalLink, Sparkles, Zap, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearchParams } from "react-router-dom";

const templateOptions = [
  {
    id: "openclaw",
    name: "OpenClaw",
    emoji: "🦞",
    icon: MessageSquare,
    desc: "7×24 小时在线的专属智能体，一键部署、零门槛即刻唤醒你的个人助手，随时随地对话",
    features: ["一键部署", "7×24 在线", "ReAct 智能循环", "持久化记忆", "ClawHub 技能市场", "心跳层定时任务"],
    gradient: "from-emerald-500/20 to-teal-500/5",
    color: "text-emerald-500",
    badge: "热门",
    badgeColor: "bg-emerald-500",
    difficulty: "进阶",
    deployTime: "5-10 分钟",
  },
  {
    id: "codeagent",
    name: "Code Agent",
    emoji: "💻",
    icon: Code2,
    desc: "部署自己的编码 Agent，在线提需求自动写代码",
    features: ["在线提需求", "自动改代码", "提交 PR", "代码审查"],
    gradient: "from-blue-500/20 to-indigo-500/5",
    color: "text-blue-500",
    badge: "推荐",
    badgeColor: "bg-blue-500",
    difficulty: "简单",
    deployTime: "3-5 分钟",
  },
  {
    id: "chatbot",
    name: "Chat Bot",
    emoji: "🤖",
    icon: Bot,
    desc: "部署自己的聊天机器人，支持多渠道接入",
    features: ["多轮对话", "知识库", "自定义人设", "多渠道接入"],
    gradient: "from-purple-500/20 to-pink-500/5",
    color: "text-purple-500",
    badge: null,
    difficulty: "入门",
    deployTime: "2-3 分钟",
  },
  {
    id: "custom",
    name: "自定义 Agent",
    emoji: "⚙️",
    icon: Settings,
    desc: "完全自定义的 Agent，灵活配置所有参数",
    features: ["自定义工具", "Skill 集成", "系统提示词", "知识库 + 大模型"],
    gradient: "from-amber-500/20 to-orange-500/5",
    color: "text-amber-500",
    badge: "灵活",
    badgeColor: "bg-amber-500",
    difficulty: "专家",
    deployTime: "10-30 分钟",
  },
];

const steps = ["选择模板", "配置参数", "命名描述", "完成创建"];

const CreateAgentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get("template");

  const [step, setStep] = useState(preselected ? 1 : 0);
  const [selectedTemplate, setSelectedTemplate] = useState(preselected || "");
  const [config, setConfig] = useState({
    persona: "",
    tone: "专业、简洁",
    messagingApps: [],
    repoUrl: "",
    programmingLanguage: "",
    knowledgeBase: "",
    systemPrompt: "",
    llmProvider: "",
  });
  const [agentName, setAgentName] = useState("");
  const [agentDesc, setAgentDesc] = useState("");

  const canNext = () => {
    if (step === 0) return !!selectedTemplate;
    if (step === 2) return !!agentName;
    return true;
  };

  const handleCreate = () => {
    setStep(3);
  };

  const getSelectedTemplate = () => templateOptions.find((t) => t.id === selectedTemplate);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">创建新 Agent</h1>
          <p className="text-sm text-muted-foreground mt-1">
            选择一个模板，部署属于你的专属 Agent（自托管虚拟机）
          </p>
        </div>
      </motion.div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              i < step ? "bg-primary text-primary-foreground" :
              i === step ? "bg-primary/20 text-primary border border-primary/40" :
              "bg-secondary text-muted-foreground"
            }`}>
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
            {i < steps.length - 1 && <div className={`w-8 h-px ${i < step ? "bg-primary/50" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Select template */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">选择一个模版作为起点</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5" />
                <span>快速部署 · 自托管 · 数据隔离</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templateOptions.map((tpl, index) => {
                const Icon = tpl.icon;
                const isSelected = selectedTemplate === tpl.id;

                return (
                  <motion.div
                    key={tpl.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`group cursor-pointer transition-all duration-300 overflow-hidden ${
                        isSelected
                          ? "border-primary/50 shadow-xl shadow-primary/5 ring-2 ring-primary/20"
                          : "border-border/50 hover:border-primary/30 hover:shadow-lg"
                      }`}
                      onClick={() => setSelectedTemplate(tpl.id)}
                    >
                      {/* Top gradient bar */}
                      <div className={`h-1 w-full bg-gradient-to-r ${tpl.gradient}`} />

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${tpl.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                              <span className="text-2xl mr-0.5">{tpl.emoji}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-base font-semibold">{tpl.name}</CardTitle>
                                {tpl.badge && (
                                  <Badge className={`${tpl.badgeColor} text-white text-xs h-5 px-2`}>
                                    {tpl.badge}
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="text-xs mt-1 line-clamp-2">{tpl.desc}</CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {/* Meta info */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span>{tpl.difficulty}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{tpl.deployTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>自托管</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-1.5">
                          {tpl.features.slice(0, 4).map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs h-6">
                              {feature}
                            </Badge>
                          ))}
                          {tpl.features.length > 4 && (
                            <Badge variant="outline" className="text-xs h-6">
                              +{tpl.features.length - 4}
                            </Badge>
                          )}
                        </div>

                        {/* Selected indicator */}
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 pt-2 border-t border-border/50"
                          >
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                            <span className="text-xs font-medium text-primary">已选择</span>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 1: Configure */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getSelectedTemplate()?.gradient} flex items-center justify-center`}>
                    {(() => {
                      const tpl = getSelectedTemplate();
                      if (!tpl) return null;
                      const Icon = tpl.icon;
                      return <Icon className={`h-5 w-5 ${tpl.color}`} />;
                    })()}
                  </div>
                  <div>
                    <CardTitle className="text-base">配置 {getSelectedTemplate()?.name}</CardTitle>
                    <CardDescription className="text-xs">根据模板配置你的 Agent 参数</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Common fields */}
                <div className="space-y-2">
                  <Label className="text-sm">人设 / Persona</Label>
                  <Textarea
                    value={config.persona}
                    onChange={(e) => setConfig({ ...config, persona: e.target.value })}
                    placeholder="例如：专业的 AI 助手"
                    className="bg-secondary/50 border-border/50 min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">语调风格</Label>
                  <Input
                    value={config.tone}
                    onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                    placeholder="专业、简洁、友好"
                    className="bg-secondary/50 border-border/50"
                  />
                </div>

                {/* OpenClaw specific fields */}
                {selectedTemplate === "openclaw" && (
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">概述</TabsTrigger>
                      <TabsTrigger value="config">配置</TabsTrigger>
                      <TabsTrigger value="examples">示例</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-500">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm font-medium">OpenClaw 是什么？</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          OpenClaw 是一个开源的自主 AI 智能体框架，由 Peter Steinberger 于 2025 年底发布。
                          它将被动回答问题的聊天机器人，转变为能够主动执行复杂工作流的"数字员工"。
                        </p>
                      </div>

                      {/* Core Architecture */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">核心架构（五层设计）</Label>
                        <div className="grid gap-2">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <Server className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Gateway（网关层）</p>
                              <p className="text-xs text-muted-foreground">管理 WebSocket 连接，支持 WhatsApp、Telegram、Slack、Discord 等 20+ 消息平台</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <Brain className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Brain（大脑层）</p>
                              <p className="text-xs text-muted-foreground">基于 ReAct 循环（Reason + Act）进行推理和行动决策</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                              <Database className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Memory（记忆层）</p>
                              <p className="text-xs text-muted-foreground">本地 Markdown/YAML 文件持久化存储，包含短期日志、长期记忆、人格配置</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                              <Puzzle className="h-4 w-4 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Skills（技能层）</p>
                              <p className="text-xs text-muted-foreground">ClawHub 技能市场，已有 13,729+ 个公开技能</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-red-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Heartbeat（心跳层）</p>
                              <p className="text-xs text-muted-foreground">Cron 定时任务调度，让 Agent 能自主"醒来"执行任务，无需人工触发</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key Features */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">关键特性</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Badge variant="outline" className="justify-start p-2 h-auto">
                            <span className="text-xs">🏠 本地优先架构</span>
                          </Badge>
                          <Badge variant="outline" className="justify-start p-2 h-auto">
                            <span className="text-xs">🧠 ReAct 智能循环</span>
                          </Badge>
                          <Badge variant="outline" className="justify-start p-2 h-auto">
                            <span className="text-xs">📝 持久化记忆系统</span>
                          </Badge>
                          <Badge variant="outline" className="justify-start p-2 h-auto">
                            <span className="text-xs">🔒 安全沙箱机制</span>
                          </Badge>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="config" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-sm">接入的消息应用</Label>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">WhatsApp</Badge>
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Telegram</Badge>
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Discord</Badge>
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Slack</Badge>
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">iMessage</Badge>
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">+ 添加</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">部署位置</Label>
                        <Input placeholder="本地机器 / 服务器地址" className="bg-secondary/50 border-border/50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">本地模型（可选）</Label>
                        <Input placeholder="Ollama / LM Studio / llama.cpp" className="bg-secondary/50 border-border/50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">启用的技能</Label>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">浏览器自动化</Badge>
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">文件操作</Badge>
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">终端执行</Badge>
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">+ 从 ClawHub 添加</Badge>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="examples" className="space-y-4 mt-4">
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                          <p className="text-xs font-medium mb-1">📊 舆情监控</p>
                          <p className="text-xs text-muted-foreground">自动抓取小红书、抖音等平台数据，AI 分析并生成报告，推送到飞书/邮件</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                          <p className="text-xs font-medium mb-1">🎮 游戏开发</p>
                          <p className="text-xs text-muted-foreground">通过自然语言指令生成 Unity C# 脚本、3D 关卡、物理组件，开发速度提升 90%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                          <p className="text-xs font-medium mb-1">📧 自动化办公</p>
                          <p className="text-xs text-muted-foreground">管理日历、筛选邮件、生成会议纪要，实现"Inbox Zero"</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                          <p className="text-xs font-medium mb-1">📚 学术研究</p>
                          <p className="text-xs text-muted-foreground">多 Agent 协作抓取 arXiv 论文，自动分析并生成 LaTeX 综述，节省 78% 研究时间</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                {/* Code Agent specific fields */}
                {selectedTemplate === "codeagent" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm">代码仓库地址</Label>
                      <Input
                        placeholder="https://github.com/owner/repo"
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">编程语言</Label>
                      <Input placeholder="Python, TypeScript, ..." className="bg-secondary/50 border-border/50" />
                    </div>
                  </>
                )}

                {/* Chat Bot specific fields */}
                {selectedTemplate === "chatbot" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm">知识库（可选）</Label>
                      <Textarea placeholder="粘贴你的知识库内容或上传文档..." className="bg-secondary/50 border-border/50 min-h-[80px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">接入渠道</Label>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">网页</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">钉钉</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">企业微信</Badge>
                      </div>
                    </div>
                  </>
                )}

                {/* Custom Agent specific fields */}
                {selectedTemplate === "custom" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm">系统提示词</Label>
                      <Textarea
                        value={config.systemPrompt}
                        onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                        placeholder="你是一个专业的助手..."
                        className="bg-secondary/50 border-border/50 min-h-[100px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">大模型 Provider</Label>
                        <Input value={config.llmProvider} onChange={(e) => setConfig({ ...config, llmProvider: e.target.value })} placeholder="OpenAI / Anthropic / ..." className="bg-secondary/50 border-border/50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">关联知识库</Label>
                        <Input value={config.knowledgeBase} onChange={(e) => setConfig({ ...config, knowledgeBase: e.target.value })} placeholder="选择知识库..." className="bg-secondary/50 border-border/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">集成 Skill / 工具</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">+ 添加 Skill</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">+ 添加工具</Badge>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Name & description */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">最后一步</CardTitle>
                <CardDescription className="text-xs">为你的 Agent 取个名字</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm">Agent 名称 *</Label>
                  <Input
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="例如：我的爬虫助手"
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">描述（可选）</Label>
                  <Textarea
                    value={agentDesc}
                    onChange={(e) => setAgentDesc(e.target.value)}
                    placeholder="描述这个 Agent 的用途..."
                    className="bg-secondary/50 border-border/50 min-h-[100px]"
                  />
                </div>

                {/* Deployment info */}
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <Code2 className="h-4 w-4" />
                    <span className="text-sm font-medium">自托管部署</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    你的 Agent 将部署在专属虚拟机中，数据完全隔离，你拥有绝对控制权
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Agent 创建成功！</h2>
            <p className="text-muted-foreground text-sm">你的 Agent "{agentName || "新 Agent"}" 已准备就绪</p>
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" onClick={() => navigate("/my-agents")} className="border-border/50">
                查看我的 Agent
              </Button>
              <Button onClick={() => navigate("/chat?agent=custom")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                开始对话
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      {step < 3 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> 上一步
          </Button>
          <Button
            onClick={() => step === 2 ? handleCreate() : setStep((s) => s + 1)}
            disabled={!canNext()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {step === 2 ? "创建 Agent" : "下一步"} {step < 2 && <ArrowRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreateAgentPage;
