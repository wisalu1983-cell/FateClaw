# 多 Agent 沙盒世界设计参考

> **文档用途**：汇总 LLM 驱动的多 Agent 沙盒世界的学术研究和工程实践，作为 TinyMB 技术方案设计（Phase 2）和 NPC Agent 方案决策（Q-06）的输入材料。
>
> **数据来源**：学术论文（ACM、arXiv）、开源项目、综述文献。数据截至 2025 年。

---

## 一、奠基性工作：Stanford Generative Agents（2023）

### 1.1 论文信息

- **标题**：Generative Agents: Interactive Simulacra of Human Behavior
- **作者**：Joon Sung Park, Joseph C. O'Brien, Carrie J. Cai, Meredith Ringel Morris, Percy Liang, Michael S. Bernstein（Stanford）
- **发表**：UIST 2023（ACM SIGCHI）
- **链接**：[ACM](https://dl.acm.org/doi/fullHtml/10.1145/3586183.3606763) | [arXiv](https://arxiv.org/abs/2304.03442)
- **开源**：[GitHub](https://github.com/joonspk-research/generative_agents)

### 1.2 核心架构：三支柱设计

```
┌─────────────────────────────────────┐
│          Generative Agent           │
├─────────┬──────────┬────────────────┤
│  Memory │ Planning │   Reflection   │
│  Stream │  Module  │    Module      │
└─────────┴──────────┴────────────────┘
```

#### Memory Stream（记忆流）

- 时间排序的数据库，存储每一次观察、计划和反思
- 每条记忆包含：时间戳、内容描述、重要性评分
- 检索时综合考虑：**时效性**（recency）、**重要性**（importance）、**相关性**（relevance）
- 记忆检索公式：`score = α × recency + β × importance + γ × relevance`

#### Planning Module（规划模块）

- 将每日目标分解为时间结构化的行动序列
- 分层规划：日计划 → 小时计划 → 分钟级行动
- 计划会根据新的观察和事件动态调整
- 与其他 Agent 的交互可能触发计划修改

#### Reflection Module（反思模块）

- 定期从近期记忆中抽象出高层次洞察
- 触发条件：累积的重要性评分超过阈值
- 反思过程：
  1. 提出问题："基于最近的经历，我可以回答哪些高层次问题？"
  2. 检索相关记忆
  3. 生成洞察/总结
- 反思结果存回记忆流，可被后续检索使用

### 1.3 实验设置

- **环境**：类 Sims 的小镇沙盒（Smallville），2D 像素风格
- **Agent 数量**：25 个
- **LLM**：GPT-3.5-turbo
- **运行时间**：模拟 2 天

### 1.4 关键发现

| 发现 | 说明 |
|---|---|
| 个体行为可信 | Agent 表现出符合其人设的日常行为 |
| 涌现社交行为 | 给一个 Agent 输入"想办情人节派对"，Agent 们自发传播邀请、两两约会、按时赴会 |
| 信息扩散 | Agent 通过对话自发传播信息，无需中心化调度 |
| 反思提升行为质量 | 移除反思模块后，Agent 行为变得更机械、重复 |
| 记忆检索是核心 | 三因素加权检索（时效性+重要性+相关性）优于单一因素 |

### 1.5 对 TinyMB 的启示

| Smallville 设计 | TinyMB 可借鉴点 |
|---|---|
| 记忆流 | Agent 的"日记/内心世界"可基于记忆流实现 |
| 三因素检索 | Agent 决策时检索相关记忆，而非全量记忆 |
| 反思模块 | 可用于 Agent 形成对其他领主的"印象"和战略判断 |
| 25 Agent 在 GPT-3.5 上可行 | TinyMB 的 7~10 Agent 规模在技术上可行 |
| 涌现社交行为 | 证明"给 Agent 简单指令 → 复杂社交涌现"路径可行 |

---

## 二、综述文献：LLM 多 Agent 系统的架构模式

### 2.1 综述一：LLM-Based Game Agents（2024 年 4 月）

- **标题**：A Survey on Large Language Model-Based Game Agents
- **链接**：[arXiv](https://arxiv.org/abs/2404.02039) | [HuggingFace](https://huggingface.co/papers/2404.02039)

**统一参考架构**：

```
单 Agent 层：
  ┌──────────┬──────────┬────────────────┐
  │ Memory   │Reasoning │ Perception-    │
  │          │          │ Action         │
  │          │          │ Interface      │
  └──────────┴──────────┴────────────────┘

多 Agent 层：
  ┌──────────────────────────────────────┐
  │ Communication  │  Organization      │
  │ Protocols      │  Models            │
  └──────────────────────────────────────┘
```

**单 Agent 三核心**：
1. **Memory**：短期/长期/情景/语义记忆
2. **Reasoning**：思维链（CoT）、计划分解、自我反思
3. **Perception-Action Interface**：环境感知和行动执行的接口

**多 Agent 两核心**：
1. **Communication Protocols**：Agent 之间如何交换信息
2. **Organization Models**：如何协调角色分工和协作

**六大游戏类型的 Agent 需求差异**：

| 游戏类型 | 核心挑战 | Agent 能力要求 |
|---|---|---|
| 冒险游戏 | 探索、解谜、叙事 | 长期记忆、因果推理 |
| 沟通游戏 | 说服、欺骗、谈判 | 自然语言理解、心智理论 |
| 竞技游戏 | 策略、实时决策 | 快速推理、对手建模 |
| 合作游戏 | 团队协作、角色分工 | 通信协议、共享状态 |
| 模拟游戏 | 真实行为、社交动态 | 全面记忆、反思、个性 |
| 沙盒游戏 | 开放探索、创造 | 目标生成、好奇心驱动 |

**TinyMB 属于"模拟游戏"类型**，需要：全面的记忆系统、反思能力、个性化行为、社交互动。

### 2.2 综述二：LLM Multi-Agent Systems（2024 年 2 月）

- **标题**：Large Language Model based Multi-Agents: A Survey of Progress and Challenges
- **链接**：[arXiv](https://arxiv.org/abs/2402.01680)

**Agent 的五层能力结构**：
1. **Profile**：角色设定、个性、背景故事
2. **Perception**：环境感知、信息接收
3. **Self-action**：独立决策和行动
4. **Mutual Interaction**：Agent 之间的交互
5. **Evolution**：学习和成长

**核心挑战**：
- Agent 数量扩展：如何在有限算力下支撑更多 Agent
- 长期一致性：如何保持 Agent 人设不漂移
- 涌现行为的可控性：如何引导而非强制控制涌现

### 2.3 综述三：LLM Multi-Agent Workflow（2024 年 10 月）

- **标题**：A survey on LLM-based multi-agent systems: workflow, infrastructure, and challenges
- **链接**：[Springer](https://link.springer.com/article/10.1007/s44336-024-00009-2)

**工作流基础设施**的关键组件：
- **任务分解**：将复杂目标拆解为子任务
- **角色分配**：根据 Agent 能力分配子任务
- **通信管理**：Agent 之间的信息传递协议
- **状态同步**：共享世界状态的一致性
- **冲突解决**：当多个 Agent 的行动冲突时如何仲裁

---

## 三、关键项目参考

### 3.1 Voyager（2023）——Minecraft 中的开放式 Agent

- **来源**：NVIDIA + Caltech + UT Austin
- **链接**：[voyager.minedojo.org](https://voyager.minedojo.org/)

**核心创新**：
- **自动课程**（Automatic Curriculum）：Agent 自动生成下一个探索目标
- **技能库**（Skill Library）：将成功的行为编码为可复用的技能
- **迭代 Prompting**：环境反馈 + 自我验证 + 重试

**效果**：比之前方法多获取 3.3 倍独特物品、多移动 2.3 倍距离、解锁科技快 15.3 倍。

**对 TinyMB 的启示**：技能库的概念可以借鉴——Agent 的行为不是每次从头推理，而是积累成功的行为模式。

### 3.2 MineLand（2024）——64+ Agent 大规模模拟

- **来源**：arXiv 2024
- **链接**：[arXiv](https://arxiv.org/abs/2403.19267)

**核心特征**：
- 支持 64+ Agent 在 Minecraft 中同时运行
- Agent 有受限的多模态感知和物理需求（饥饿、资源采集）
- 引入 Alex AI 框架，灵感来自多任务理论
- 解决大规模 Agent 的调度和协调问题

**对 TinyMB 的启示**：TinyMB 的 7~10 Agent 远低于 MineLand 的规模，在调度上不是瓶颈。但"物理需求驱动行为"（饥饿→采集食物→…）的设计思路与骑砍的"军饷压力驱动行动"高度一致。

### 3.3 MegaAgent（2024）——无预定义 SOP 的大规模 Agent

- **来源**：arXiv 2024
- **链接**：[arXiv](https://arxiv.org/abs/2408.09955)

**核心创新**：
- 消除预定义的标准操作流程（SOP）
- Agent 根据任务复杂度动态生成
- 可扩展至 590 Agent（国家政策模拟场景）
- 包含系统监控和动态调整能力

**对 TinyMB 的启示**："动态生成 Agent"的理念可以用于 NPC 领主——核心领主是常驻 Agent，次要 NPC 按需创建和销毁。

---

## 四、对 TinyMB 技术方案的关键启示

### 4.1 Agent 架构选择

基于综述文献，推荐 TinyMB 的 Agent 采用以下架构：

```
┌────────────────────────────────────┐
│         TinyMB Agent               │
├──────────┬──────────┬──────────────┤
│ Profile  │ Memory   │ Action       │
│ (人设)    │ (记忆流)  │ (行为接口)   │
│          │          │              │
│ 性格设定  │ 观察记录  │ 移动         │
│ 目标倾向  │ 反思洞察  │ 战斗         │
│ 关系网    │ 检索加权  │ 社交         │
│          │          │ 经济         │
│          │          │ 政治         │
└──────────┴──────────┴──────────────┘
```

### 4.2 Agent 数量与成本控制

| 策略 | 说明 |
|---|---|
| **混合驱动** | 核心领主用 LLM Agent（3~5 个），次要 NPC 用规则驱动 |
| **分层调用** | 日常行为用轻量模型/规则，关键决策（外交/叛变）用完整 LLM |
| **批量处理** | 非紧急的 Agent 行动可以批量处理，降低 API 调用频率 |
| **记忆压缩** | 定期通过反思将大量记忆压缩为高层次总结 |

### 4.3 多 Agent 协调模式

| 模式 | 适用场景 | TinyMB 映射 |
|---|---|---|
| **广播式** | 全局事件通知 | 战争宣告、宴会邀请 |
| **点对点** | 两个 Agent 直接对话 | 领主间外交、玩家与领主对话 |
| **中心调度** | 由一个节点协调多个 Agent | 国王召集军队、元帅指挥战役 |
| **涌现式** | 无中心化控制的自发协调 | 信息传播、联盟形成 |

### 4.4 关键技术风险

| 风险 | 缓解策略 |
|---|---|
| 人设漂移（Agent 行为偏离设定） | 在每次 Prompt 中重申核心人设 |
| LLM 调用延迟 | 世界时间与真实时间脱钩（模拟时间） |
| 幻觉/不一致 | 行动前由规则系统验证合法性 |
| 成本控制 | 日常行为用规则替代 LLM |
| 长期记忆膨胀 | 反思压缩 + 遗忘机制 |

---

## 五、参考文献列表

### 核心论文

1. Park et al. (2023). "Generative Agents: Interactive Simulacra of Human Behavior." UIST 2023. [ACM](https://dl.acm.org/doi/fullHtml/10.1145/3586183.3606763)
2. Hu et al. (2024). "A Survey on Large Language Model-Based Game Agents." arXiv:2404.02039. [arXiv](https://arxiv.org/abs/2404.02039)
3. Guo et al. (2024). "Large Language Model based Multi-Agents: A Survey of Progress and Challenges." arXiv:2402.01680. [arXiv](https://arxiv.org/abs/2402.01680)
4. Li et al. (2024). "A survey on LLM-based multi-agent systems: workflow, infrastructure, and challenges." Springer. [Link](https://link.springer.com/article/10.1007/s44336-024-00009-2)

### 相关项目

5. Wang et al. (2023). "Voyager: An Open-Ended Embodied Agent with Large Language Models." NeurIPS 2023. [Link](https://voyager.minedojo.org/)
6. Yu et al. (2024). "MineLand: Simulating Large-Scale Multi-Agent Interactions with Limited Multimodal Senses and Physical Needs." arXiv:2403.19267. [arXiv](https://arxiv.org/abs/2403.19267)
7. Jiang et al. (2024). "MegaAgent: A Large-Scale Autonomous LLM-based Multi-Agent System Without Predefined SOPs." arXiv:2408.09955. [arXiv](https://arxiv.org/abs/2408.09955)

### 补充参考

8. Smallville Open Source Implementation: [GitHub (nickm980)](https://github.com/nickm980/smallville)
9. Stanford HAI 新闻稿: [Link](https://hai.stanford.edu/news/computational-agents-exhibit-believable-humanlike-behavior)
