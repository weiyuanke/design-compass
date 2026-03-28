import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";

const templateOptions = [
  { id: "opencrawl", name: "OpenCrawl", emoji: "🕷️", desc: "网页爬虫 Agent" },
  { id: "chatbot", name: "Chatbot", emoji: "💬", desc: "对话机器人" },
  { id: "coding", name: "Coding Agent", emoji: "💻", desc: "代码助手" },
  { id: "doc", name: "文档助手", emoji: "📝", desc: "文档处理" },
  { id: "task", name: "任务执行者", emoji: "🎯", desc: "自动化任务" },
];

const steps = ["选择模板", "配置参数", "命名描述", "完成创建"];

const CreateAgentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get("template");

  const [step, setStep] = useState(preselected ? 1 : 0);
  const [selectedTemplate, setSelectedTemplate] = useState(preselected || "");
  const [config, setConfig] = useState({ persona: "", tone: "专业、简洁", targetUrl: "" });
  const [agentName, setAgentName] = useState("");
  const [agentDesc, setAgentDesc] = useState("");

  const canNext = () => {
    if (step === 0) return !!selectedTemplate;
    if (step === 1) return true;
    if (step === 2) return !!agentName;
    return true;
  };

  const handleCreate = () => {
    // Simulate creation
    setStep(3);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold">创建新 Agent</h1>
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
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <p className="text-muted-foreground text-sm">选择一个模版作为起点</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {templateOptions.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selectedTemplate === tpl.id
                      ? "border-primary bg-primary/5 shadow-[0_0_16px_-4px_hsl(175,80%,50%,0.2)]"
                      : "border-border/50 bg-card hover:border-border"
                  }`}
                >
                  <span className="text-2xl block mb-2">{tpl.emoji}</span>
                  <span className="font-medium text-sm text-foreground">{tpl.name}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{tpl.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 1: Configure */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <p className="text-muted-foreground text-sm">配置你的 Agent 参数</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">人设 / Persona</Label>
                <Input
                  value={config.persona}
                  onChange={(e) => setConfig({ ...config, persona: e.target.value })}
                  placeholder="例如：专业的数据爬虫助手"
                  className="bg-secondary/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">语调风格</Label>
                <Input
                  value={config.tone}
                  onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                  className="bg-secondary/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">目标 URL（可选）</Label>
                <Input
                  value={config.targetUrl}
                  onChange={(e) => setConfig({ ...config, targetUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="bg-secondary/50 border-border/50"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Name & description */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <p className="text-muted-foreground text-sm">为你的 Agent 取个名字</p>
            <div className="space-y-4">
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
            </div>
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
