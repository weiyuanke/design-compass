import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  MessageSquare,
  FileText,
  Code2,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useSearchParams } from "react-router-dom";
import { roleDefinitions, collaborationModes } from "@/data/collaboration";

interface AgentStep {
  order: number;
  roleId: string;
  agentName: string;
  status: "pending" | "running" | "completed";
  output?: string;
  duration?: number;
  tokens?: number;
}

const CollaborationDetailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("id") || "session-3";
  const [isRunning, setIsRunning] = useState(false);

  // 模拟数据：交易核心代码审查
  const sessionData = {
    id: sessionId,
    name: "交易核心代码审查",
    template: "代码审查",
    mode: "parallel",
    status: "completed" as const,
    createdAt: "2026-03-27 10:00",
    completedAt: "2026-03-27 11:00",
    cost: { tokens: 18000, time: 60 },
    description: "对交易核心模块进行多维度代码质量检查，包括逻辑审查、安全审计、性能优化建议",
    agents: [
      { roleId: "developer", agentName: "程序员 Agent", status: "completed" as const },
      { roleId: "reviewer", agentName: "评审员 Agent", status: "completed" as const },
    ],
    steps: [
      {
        order: 1,
        roleId: "developer",
        agentName: "程序员 Agent",
        status: "completed" as const,
        duration: 25,
        tokens: 8000,
        output: `## 代码逻辑审查报告

### 审查范围
- \`src/trading/orderExecutor.ts\` - 订单执行核心逻辑
- \`src/trading/riskChecker.ts\` - 风控检查模块
- \`src/trading/positionManager.ts\` - 持仓管理模块

### 发现的问题

#### 🔴 严重问题 (2 个)
1. **订单执行器中的竞态条件**
   - 位置：\`orderExecutor.ts:156\`
   - 问题：多个异步操作同时修改 \`pendingOrders\` 状态
   - 建议：使用互斥锁或队列机制

2. **风控检查未覆盖极端行情**
   - 位置：\`riskChecker.ts:89\`
   - 问题：涨跌停场景下风控阈值计算错误
   - 建议：增加极端行情特殊处理逻辑

#### 🟡 警告 (5 个)
1. 持仓计算精度问题，建议使用 Decimal 类型
2. 订单重试机制缺少指数退避
3. 日志记录缺少关键上下文信息
4. 部分函数复杂度过高（>50 行）
5. 缺少单元测试覆盖边界条件

#### 🟢 优化建议 (8 个)
1. 订单队列可使用优先队列优化
2. 增加批量订单合并逻辑
3. 添加性能监控埋点`,
      },
      {
        order: 1,
        roleId: "reviewer",
        agentName: "评审员 Agent",
        status: "completed" as const,
        duration: 30,
        tokens: 10000,
        output: `## 安全与质量审计报告

### 安全审计

#### 🔐 高危风险 (1 个)
1. **SQL 注入风险**
   - 位置：\`positionManager.ts:234\`
   - 代码：\`db.query(\`SELECT * FROM positions WHERE user_id = \${userId}\`)\`
   - 修复：使用参数化查询

#### ⚠️ 中危风险 (3 个)
1. 敏感配置硬编码（API Key、数据库密码）
2. 缺少输入验证和 sanitization
3. 错误信息泄露内部实现细节

### 代码质量指标

| 指标 | 当前值 | 目标值 | 状态 |
|-----|-------|-------|-----|
| 代码覆盖率 | 67% | 80% | ❌ |
| 圈复杂度 | 12.5 | <10 | ❌ |
| 重复代码率 | 8% | <5% | ❌ |
| 注释覆盖率 | 45% | 60% | ❌ |
| ESLint 错误 | 3 | 0 | ❌ |
| ESLint 警告 | 15 | <5 | ❌ |

### 修复优先级建议

1. **立即修复**：SQL 注入风险
2. **本周内**：竞态条件、风控阈值问题
3. **下次迭代**：代码质量优化`,
      },
    ] as AgentStep[],
  };

  const getRoleInfo = (roleId: string) => {
    return roleDefinitions.find((r) => r.id === roleId);
  };

  const getModeInfo = (mode: string) => {
    return collaborationModes.find((m) => m.id === mode);
  };

  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/collaboration")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{sessionData.name}</h1>
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
              已完成
            </Badge>
            <Badge variant="outline">{sessionData.template}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{sessionData.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            重新运行
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5 mr-1" />
            导出报告
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>协作模式</CardDescription>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-xl">{getModeInfo(sessionData.mode)?.emoji}</span>
              {getModeInfo(sessionData.mode)?.name}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>参与 Agent</CardDescription>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              {sessionData.agents.length} 个
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Token 消耗</CardDescription>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              {(sessionData.cost.tokens / 1000).toFixed(0)}k
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总耗时</CardDescription>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              {sessionData.cost.time} 分钟
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Agent Team */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            协作 Agent 团队
          </CardTitle>
          <CardDescription>参与本次协作的 Agent 角色</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {sessionData.agents.map((agent, i) => {
              const role = getRoleInfo(agent.roleId);
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50"
                >
                  <div
                    className={`h-10 w-10 rounded-lg bg-gradient-to-br ${role?.gradient} flex items-center justify-center text-xl`}
                  >
                    {role?.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{agent.agentName}</p>
                    <p className="text-xs text-muted-foreground">{role?.name}</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Execution Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            执行过程与输出
          </CardTitle>
          <CardDescription>查看每个 Agent 的工作成果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessionData.steps.map((step, index) => {
            const role = getRoleInfo(step.roleId);
            const isExpanded = expandedStep === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-border/50 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : index)}
                  className="w-full flex items-center gap-3 p-4 bg-card hover:bg-secondary/50 transition-colors"
                >
                  <div
                    className={`h-8 w-8 rounded-lg bg-gradient-to-br ${role?.gradient} flex items-center justify-center text-lg flex-shrink-0`}
                  >
                    {role?.emoji}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        步骤 {step.order} - {role?.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        已完成
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{step.agentName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {step.duration} 分钟
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {(step.tokens! / 1000).toFixed(0)}k tokens
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-muted/50 border-t border-border/50">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap text-xs font-mono bg-card p-4 rounded-lg border border-border/50 overflow-x-auto">
                            {step.output}
                          </pre>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-3">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-3.5 w-3.5 mr-1" />
                            追问
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-3.5 w-3.5 mr-1" />
                            复制
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            问题汇总与建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-500">严重问题：3 个</p>
                <p className="text-xs text-red-400/80">需要立即修复</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-500">警告：8 个</p>
                <p className="text-xs text-amber-400/80">建议本周内修复</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-500">优化建议：8 个</p>
                <p className="text-xs text-blue-400/80">可在下次迭代中优化</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborationDetailPage;
