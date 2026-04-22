# Agent 循环与核心架构

> 核心问题：Claude Code 的 agent loop 如何映射到 TinyMB 的 Observe→Think→Decide→Act？

---

## 一、Claude Code 的核心循环

```
用户输入 → processUserInput() → query()
  ├── fetchSystemPromptParts()    // 组装系统提示词
  ├── StreamingToolExecutor       // 并行工具执行
  ├── autoCompact()               // 上下文自动压缩
  └── runTools()                  // 工具编排调度
→ yield SDKMessage
```

[源码锚点] `query.ts`（785KB，最大单文件）是主 agent 循环所在。`QueryEngine.ts` 是 SDK/Headless 生命周期引擎。

关键设计特征：

- **循环结构**：model 输出 `stop_reason == "tool_use"` 时继续循环，否则返回文本结果
- **工具执行是原子的**：每个工具是一个单独的 `call()` 操作，返回结构化结果
- **循环退出条件明确**：无 tool_use 请求时退出，而非靠超时或步数限制

---

## 二、TinyMB 的 Agent 循环

```
Agent 接收观察包 → Think → 输出结构化行动意图 → Runtime 校验 → Runtime 结算
```

[TinyMB 对接] 极简骑砍规则集 §2.1.1：每个 Agent 运行一条 `Observe → Think → Decide → Act` 循环，输出结构化行动意图。

---

## 三、关键映射关系


| Claude Code 概念             | TinyMB 对应     | 设计启发                                                     |
| -------------------------- | ------------- | -------------------------------------------------------- |
| `fetchSystemPromptParts()` | 观察包组装         | 不是把整个世界塞给 Agent，而是分层：静态世界规则（可缓存） + 动态局势（每轮更新）            |
| `StreamingToolExecutor`    | 行动执行器         | 行动是原子的 `call()` 操作，有明确输入/输出/错误态                          |
| `autoCompact()`            | Agent 记忆压缩    | token 上下文是有限资源，需要分层压缩策略（详见 05）                           |
| Tool validation chain      | Runtime 校验    | 行动合法性不能只靠 prompt 约束，必须有硬校验层                              |
| Permission system          | Agent 权限/自主等级 | 四级自主等级可参考 Claude Code 的 default/bypass/strict 三模式（详见 06） |
| Sub-agent（AgentTool）       | NPC 之间的间接交互   | 子代理返回压缩结果而非共享完整 context（详见 04）                           |


---

## 四、架构拆分对照

### Claude Code 的分层

```
入口层 → 查询引擎 → 工具/服务/状态
```

- 入口层：CLI、SDK、Bridge（多入口共享同一套 agent 栈）
- 查询引擎：`submitMessage()` → `AsyncGenerator<SDKMessage>`
- 工具层：40+ 工具实现，每个工具有描述/schema/call/permission/validation
- 服务层：22 个子目录的业务逻辑
- 状态层：应用状态管理

### TinyMB 建议的对应分层

```
客户端层 → Agent 引擎 → 行动/规则/世界状态
```

- **客户端层**：玩家 Web 界面（对话、观察、指令下达）
- **Agent 引擎**：接收观察包 → LLM 推理 → 输出结构化行动意图
- **行动层**：行动类型注册表，每个行动有 schema/前置条件/执行逻辑/后果
- **规则引擎**：校验、结算、事件触发
- **世界状态层**：角色变量、世界变量、关系图、事件队列

---

## 五、Claude Code agent 循环中值得 TinyMB 注意的细节

### 5.1 循环终止条件必须明确

Claude Code 靠 `stop_reason` 判断是否继续。TinyMB 的 Agent 每个半天时间步应该有一个明确的终止条件：

- **输出了一个合法行动意图** → 进入校验/结算
- **输出了"无行动"** → 跳过本步
- **输出格式错误** → 重试一次，仍失败则执行默认安全行为

### 5.2 Agent 不应直接修改世界状态

Claude Code 的工具执行后返回 `tool_result`，由框架决定如何处理。TinyMB 的 Agent 只输出行动意图，实际状态修改全部由 Runtime 执行。这保证了：

- 多 Agent 并发时不会产生状态冲突
- 所有状态变更有统一的审计入口
- 规则引擎可以拦截/修改任何行动的实际效果

### 5.3 错误恢复策略

Claude Code 有明确的错误恢复模式（如 pre-commit hook 失败后重试一次）。TinyMB 应该为 Agent 定义类似的策略：

- LLM 返回不合法的行动 → 重试一次（降低温度）
- LLM 超时 → 执行角色的默认行为（如"在当前区域等待"）
- LLM 返回空内容 → 当作"无行动"处理

[Trumen 对接] worldboxBot 的 `WorldSnapshot → ActionCommand → WorldDelta` 契约已经走在这条路上。Agent 只提交 `ActionCommand`，bridge 负责执行并返回 `WorldDelta`。