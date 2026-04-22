# TinyMB 设计开发启发集

> 来源：基于 Claude Code v2.1.88 泄露源码、网上讨论资料库、FateClaw/TinyMB 设计文档和 Trumen 项目文档的交叉分析。
>
> 生成日期：2026-04-01

## 文档索引

| # | 文档 | 主题 | 核心问题 |
|---|------|------|----------|
| 01 | `01-Agent循环与核心架构.md` | Agent 循环设计 | Claude Code 的 agent loop 如何映射到 TinyMB 的 Observe→Think→Decide→Act |
| 02 | `02-SystemPrompt分层策略.md` | Prompt 工程 | 怎样为 NPC/玩家 Agent 分层组装 system prompt，兼顾质量和缓存经济性 |
| 03 | `03-行动系统与工具治理.md` | 行动管线设计 | 从 Claude Code 14 步工具治理链精简出游戏行动管线 |
| 04 | `04-多Agent协调.md` | 多 Agent 编排 | 6 个 NPC + 1 个玩家的并行感知/串行结算策略 |
| 05 | `05-上下文管理与Agent记忆.md` | 记忆与压缩 | 三层压缩策略、日记生成、记忆检索 |
| 06 | `06-自主性与请示机制.md` | 权限与信任 | 从 Claude Code 权限系统到 TinyMB 四级自主等级 |
| 07 | `07-LLM与规则引擎的分工.md` | 混合架构 | NPC 哪些行为用 LLM，哪些用规则引擎（开放问题 O2） |
| 08 | `08-成本控制与复杂度管理.md` | 工程约束 | prompt cache、调用频率、熔断机制、复杂度红线 |

## 使用说明

- 每篇文档独立成篇，可按需阅读。
- 文档中标注 `[源码锚点]` 的内容可回到 `collection-claude-code-source-code/` 核验。
- 文档中标注 `[TinyMB 对接]` 的内容指向 `FateClaw/TinyMB/` 下的具体设计文档。
- 文档中标注 `[Trumen 对接]` 的内容指向 `Trumen/worldboxBot/` 下的具体工程实现。
