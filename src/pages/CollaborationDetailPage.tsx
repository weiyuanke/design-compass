import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  MessageSquare,
  FileText,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Download,
  TrendingUp,
  BookOpen,
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

interface SessionData {
  id: string;
  name: string;
  template: string;
  mode: string;
  status: "pending" | "running" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  cost: { tokens: number; time: number };
  description: string;
  agents: { roleId: string; agentName: string; status: "completed" | "running" | "pending" }[];
  steps: AgentStep[];
  summary?: {
    critical: number;
    warnings: number;
    suggestions: number;
  };
}

const CollaborationDetailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("id") || "session-2";
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  // 会话数据
  const sessions: Record<string, SessionData> = {
    // 均值回归策略开发
    "session-2": {
      id: "session-2",
      name: "均值回归策略开发",
      template: "量化策略开发",
      mode: "sequential",
      status: "completed",
      createdAt: "2026-03-28 14:00",
      completedAt: "2026-03-28 18:30",
      cost: { tokens: 32000, time: 270 },
      description: "从因子挖掘到策略回测的完整开发流程，基于沪深 300 成分股进行均值回归策略研究",
      agents: [
        { roleId: "quant", agentName: "量化研究员 Agent", status: "completed" },
        { roleId: "developer", agentName: "程序员 Agent", status: "completed" },
        { roleId: "reviewer", agentName: "评审员 Agent", status: "completed" },
      ],
      steps: [
        {
          order: 1,
          roleId: "quant",
          agentName: "量化研究员 Agent",
          status: "completed",
          duration: 120,
          tokens: 15000,
          output: `## 均值回归策略设计方案

### 策略核心逻辑

**理论基础**：价格围绕价值波动，短期偏离后会回归均值

**选股范围**：沪深 300 成分股（2024-2026）

**因子设计**：
1. **价格偏离度因子**
   - 计算当前价格与 N 日均线的偏离百分比
   - 参数：N = 20, 60, 120
   - 公式：(Close - MA_N) / MA_N * 100

2. **布林带位置因子**
   - 计算价格在布林带中的相对位置
   - 参数：period=20, std=2
   - 信号：下轨附近买入，上轨附近卖出

3. **RSI 超跌超买因子**
   - RSI < 30 视为超跌，RSI > 70 视为超买
   - 结合成交量确认信号

### 回测参数

| 参数 | 设置 |
|-----|------|
| 回测区间 | 2024-01-01 ~ 2026-03-28 |
| 初始资金 | 1000 万 |
| 交易成本 | 万 2.5 |
| 滑点 | 0.1% |
| 调仓周期 | 5 日 |
| 持仓上限 | 10 只 |

### 预期效果

- 年化收益：15% ~ 25%
- 最大回撤：< 15%
- 夏普比率：> 1.5
- 胜率：> 55%`,
        },
        {
          order: 2,
          roleId: "developer",
          agentName: "程序员 Agent",
          status: "completed",
          duration: 90,
          tokens: 12000,
          output: `## 策略代码实现

### 核心模块

\`\`\`python
# 均值回归策略主逻辑
class MeanReversionStrategy(Strategy):
    
    def __init__(self, config):
        self.lookback_period = config.get('lookback', 20)
        self.entry_threshold = config.get('entry_threshold', 2.0)
        self.exit_threshold = config.get('exit_threshold', 0.5)
        self.stop_loss = config.get('stop_loss', 0.08)
    
    def generate_signals(self, data):
        """生成交易信号"""
        # 计算均线偏离度
        data['ma20'] = data['close'].rolling(20).mean()
        data['deviation'] = (data['close'] - data['ma20']) / data['ma20'] * 100
        
        # 计算布林带
        data['bb_upper'], data['bb_lower'] = self.calc_bollinger(data)
        
        # 生成信号
        signals = pd.DataFrame(index=data.index)
        signals['signal'] = 0
        
        # 买入信号：偏离度 < -2% 且 RSI < 30
        buy_condition = (
            (data['deviation'] < -self.entry_threshold) & 
            (data['rsi'] < 30) &
            (data['close'] < data['bb_lower'])
        )
        signals.loc[buy_condition, 'signal'] = 1
        
        # 卖出信号：偏离度 > 0.5% 或 止损
        sell_condition = (
            (data['deviation'] > self.exit_threshold) |
            (data['close'] < data['entry_price'] * (1 - self.stop_loss))
        )
        signals.loc[sell_condition, 'signal'] = -1
        
        return signals
    
    def calc_bollinger(self, data, period=20, std=2):
        """计算布林带上下轨"""
        ma = data['close'].rolling(period).mean()
        std_dev = data['close'].rolling(period).std()
        upper = ma + std * std_dev
        lower = ma - std * std_dev
        return upper, lower
\`\`\`

### 回测结果

| 指标 | 数值 |
|-----|------|
| 总收益率 | 47.8% |
| 年化收益 | 21.3% |
| 最大回撤 | -12.4% |
| 夏普比率 | 1.72 |
| 胜率 | 58.2% |
| 盈亏比 | 1.85 |
| 交易次数 | 156 |

### 月度收益分布

- 正收益月份：18 个月
- 负收益月份：8 个月
- 最佳月份：2024-11 (+8.2%)
- 最差月份：2025-06 (-5.1%)`,
        },
        {
          order: 3,
          roleId: "reviewer",
          agentName: "评审员 Agent",
          status: "completed",
          duration: 60,
          tokens: 5000,
          output: `## 策略评审报告

### 策略优势 ✅

1. **逻辑清晰**：基于经典均值回归理论，有坚实的学术基础
2. **参数稳健**：在多个参数组合下均表现良好
3. **风控完善**：设置了 8% 的止损线，控制单笔损失
4. **分散投资**：持仓上限 10 只，降低个股风险

### 潜在风险 ⚠️

1. **趋势市失效**：在强趋势行情中可能持续亏损
   - 建议：增加趋势过滤指标（如 ADX）
   
2. **参数过拟合风险**：回测区间较短（2 年）
   - 建议：扩展到 5-10 年历史数据验证
   
3. **流动性风险**：未考虑停牌、涨跌停限制
   - 建议：增加流动性筛选条件

### 改进建议

1. **增加市场状态判断**
   - 震荡市：启用均值回归策略
   - 趋势市：切换至趋势跟踪策略或降低仓位

2. **动态参数调整**
   - 根据市场波动率调整布林带宽度
   - 根据行业特性调整持仓周期

3. **组合优化**
   - 与其他低相关策略组合
   - 建议与动量策略形成互补

### 上线建议

**条件通过** - 需完成以下改进后上线：
- [ ] 扩展回测区间至 5 年
- [ ] 增加趋势过滤模块
- [ ] 加入流动性筛选
- [ ] 进行压力测试（极端行情模拟）`,
        },
      ],
      summary: {
        critical: 0,
        warnings: 3,
        suggestions: 3,
      },
    },
    // 2026 年 AI 芯片行业深度研究
    "session-1": {
      id: "session-1",
      name: "2026 年 AI 芯片行业深度研究",
      template: "行业研究报告",
      mode: "hierarchical",
      status: "running",
      createdAt: "2026-03-29 09:00",
      cost: { tokens: 45000, time: 150 },
      description: "深度分析 AI 芯片产业链、竞争格局、技术趋势，为投资决策提供参考",
      agents: [
        { roleId: "coordinator", agentName: "协调者 Agent", status: "completed" },
        { roleId: "researcher", agentName: "研究员 Agent", status: "completed" },
        { roleId: "analyst", agentName: "数据分析师 Agent", status: "running" },
        { roleId: "writer", agentName: "写手 Agent", status: "pending" },
      ],
      steps: [
        {
          order: 1,
          roleId: "coordinator",
          agentName: "协调者 Agent",
          status: "completed",
          duration: 15,
          tokens: 3000,
          output: `## 任务拆解与分配

### 研究框架

**研究目标**：AI 芯片行业深度分析报告

**报告结构**：
1. 行业概述（研究员）
2. 产业链分析（研究员）
3. 竞争格局（研究员 + 数据分析师）
4. 技术趋势（研究员）
5. 投资建议（协调者整合）

### 任务分配

| 模块 | 负责人 | 交付时间 |
|-----|--------|---------|
| 行业概述 | 研究员 | 30 分钟 |
| 产业链分析 | 研究员 | 45 分钟 |
| 市场规模数据 | 数据分析师 | 40 分钟 |
| 竞争格局 | 研究员 + 数据分析师 | 60 分钟 |
| 技术趋势 | 研究员 | 30 分钟 |
| 报告整合 | 写手 | 30 分钟 |

### 数据来源

- 公开财报（英伟达、AMD、英特尔等）
- 行业报告（Gartner、IDC、TrendForce）
- 专利数据库
- 学术论文`,
        },
        {
          order: 2,
          roleId: "researcher",
          agentName: "研究员 Agent",
          status: "completed",
          duration: 45,
          tokens: 18000,
          output: `## AI 芯片行业研究报告

### 一、行业概述

**定义**：AI 芯片是专门为人工智能算法设计的处理器，包括训练和推理两大场景

**发展历程**：
- 2012-2016：GPU 主导期（深度学习兴起）
- 2017-2020：ASIC 崛起期（TPU 等专用芯片）
- 2021-2024：多元化发展期（存算一体、类脑芯片）
- 2025-2026：大模型驱动期（千卡集群成为标配）

**市场规模**：
- 2024 年：约 500 亿美元
- 2026 年（预计）：约 900 亿美元
- 2030 年（预测）：约 2000 亿美元
- CAGR（2024-2030）：约 25%

### 二、产业链分析

**上游**：
- IP 核：ARM、Imagination、芯原股份
- EDA 工具：Synopsys、Cadence、华大九天
- 晶圆代工：台积电（7nm/5nm/3nm）、三星、中芯国际

**中游**：
- GPU：英伟达（85% 份额）、AMD、英特尔
- ASIC：谷歌 TPU、华为昇腾、寒武纪
- FPGA：赛灵思、英特尔、安路科技

**下游**：
- 云计算：AWS、Azure、阿里云、腾讯云
- 自动驾驶：特斯拉、小鹏、蔚来
- 边缘 AI：海康威视、大华股份

### 三、竞争格局

**GPU 市场（训练端）**：
| 厂商 | 份额 | 代表产品 | 优势 |
|-----|------|---------|-----|
| 英伟达 | 85% | H100/B100 | 生态壁垒、性能领先 |
| AMD | 10% | MI300X | 性价比高 |
| 英特尔 | 5% | Gaudi3 | 收购 Habana 布局 |

**推理端市场**：
- 呈现多元化竞争
- 华为昇腾、寒武纪等国产厂商崛起
- 边缘推理芯片玩家众多

### 四、技术趋势

1. **大芯片化**：万亿晶体管成为常态
2. **Chiplet 技术**：降低成本、提高良率
3. **存算一体**：突破冯诺依曼瓶颈
4. **光计算**：低功耗、高带宽
5. **类脑芯片**：脉冲神经网络硬件化`,
        },
        {
          order: 3,
          roleId: "analyst",
          agentName: "数据分析师 Agent",
          status: "running",
          duration: 40,
          tokens: 12000,
          output: `## 市场数据分析

### 全球 AI 芯片市场规模

| 年份 | 规模（亿美元）| 增速 |
|-----|-------------|-----|
| 2022 | 285 | +35% |
| 2023 | 380 | +33% |
| 2024 | 500 | +32% |
| 2025E | 680 | +36% |
| 2026E | 900 | +32% |

### 细分市场占比

**按应用场景**：
- 数据中心：55%
- 自动驾驶：18%
- 消费电子：15%
- 工业/医疗：12%

**按地区**：
- 北美：45%
- 中国：25%
- 欧洲：15%
- 亚太（除中国）: 15%

### 主要厂商财务数据

**英伟达（FY2026）**：
- 营收：850 亿美元（+55% YoY）
- 数据中心业务：680 亿美元（+70%）
- 毛利率：72%
- 研发费用：120 亿美元

**AMD（2025）**：
- 营收：280 亿美元（+18% YoY）
- 数据中心 GPU：45 亿美元（+85%）
- 毛利率：51%

### 估值对比

| 公司 | PE(TTM) | PS(TTM) | PEG |
|-----|--------|--------|-----|
| 英伟达 | 55x | 28x | 1.2 |
| AMD | 45x | 8x | 1.5 |
| 英特尔 | 25x | 2x | - |
| 寒武纪 | - | 35x | - |
| 海光信息 | 80x | 25x | 2.1 |

### 资金流向分析

**北向资金持仓（AI 芯片相关）**：
- 总持仓：约 450 亿元
- Q1 增持：海光信息、寒武纪
- Q1 减持：部分高位个股

**公募基金持仓**：
- 配置比例：从 2024Q4 的 3.2% 提升至 2025Q1 的 4.8%
- 加仓方向：国产替代、边缘 AI`,
        },
      ],
      summary: {
        critical: 0,
        warnings: 2,
        suggestions: 5,
      },
    },
  };

  const sessionData = sessions[sessionId] || sessions["session-2"];

  const getRoleInfo = (roleId: string) => {
    return roleDefinitions.find((r) => r.id === roleId);
  };

  const getModeInfo = (mode: string) => {
    return collaborationModes.find((m) => m.id === mode);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/collaboration")}
          className="h-8 w-8 flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{sessionData.name}</h1>
            <Badge
              className={
                sessionData.status === "completed"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                  : sessionData.status === "running"
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                  : ""
              }
            >
              {sessionData.status === "completed" ? "已完成" : "运行中"}
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
              {(sessionData.cost.time / 60).toFixed(0)} 分钟
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sessionData.agents.map((agent, i) => {
              const role = getRoleInfo(agent.roleId);
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50"
                >
                  <div
                    className={`h-10 w-10 rounded-lg bg-gradient-to-br ${role?.gradient} flex items-center justify-center text-xl flex-shrink-0`}
                  >
                    {role?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agent.agentName}</p>
                    <p className="text-xs text-muted-foreground">{role?.name}</p>
                  </div>
                  {agent.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  ) : agent.status === "running" ? (
                    <div className="h-5 w-5 flex-shrink-0">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                    </div>
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
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
                        className={
                          step.status === "completed"
                            ? "text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : step.status === "running"
                            ? "text-xs bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "text-xs"
                        }
                      >
                        {step.status === "completed" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            已完成
                          </>
                        ) : step.status === "running" ? (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            进行中
                          </>
                        ) : (
                          "待开始"
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{step.agentName}</span>
                      {step.duration && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {step.duration} 分钟
                          </span>
                        </>
                      )}
                      {step.tokens && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {(step.tokens / 1000).toFixed(0)}k tokens
                          </span>
                        </>
                      )}
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
      {sessionData.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              问题汇总与建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessionData.summary.critical > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-500">
                      严重问题：{sessionData.summary.critical} 个
                    </p>
                    <p className="text-xs text-red-400/80">需要立即修复</p>
                  </div>
                </div>
              )}
              {sessionData.summary.warnings > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-500">
                      警告：{sessionData.summary.warnings} 个
                    </p>
                    <p className="text-xs text-amber-400/80">建议本周内修复</p>
                  </div>
                </div>
              )}
              {sessionData.summary.suggestions > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-500">
                      优化建议：{sessionData.summary.suggestions} 个
                    </p>
                    <p className="text-xs text-blue-400/80">可在下次迭代中优化</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CollaborationDetailPage;
