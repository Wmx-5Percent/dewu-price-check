# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `LEARNING_MODE` |
| 当前步骤 | `G00.1` |
| 状态 | `WAITING_FOR_USER` |
| 当前 Wave | 治理基线准备，尚未进入 W0 开发 |
| 当前模块 | 无生产模块 |
| 当前角色 | 用户 |
| 当前打开任务 | 本次规划任务；完成后保留为历史记录 |
| 下一个任务 | 新建一个 Coordinator 任务 |
| 允许写代码 | 否 |
| 允许 commit/push/PR/merge | 否 |

## 你现在只做这一件事

在同一个 Codex Project 中新建任务，标题建议：

`[COORD] Dewu project coordinator`

不要选择某个模块的开发分支。Coordinator 先在当前项目根目录做只读检查。

复制以下提示词：

```text
你是本项目长期 Coordinator，不是 Developer、QA 或 Reviewer。
请完整读取根目录 AGENTS.md、docs/development-progress/README.md、
docs/development-progress/CURRENT_STEP.md、01-governance-baseline.md
以及 master plan 第 10 节。

当前只执行步骤 G00.1：只读核对本地 git status、远程 GitHub Issues、
PR 和 Actions，解释当前未提交文件分别是什么，并给我一个“哪些文件建议
进入治理基线、哪些必须排除”的清单。

不要修改文件，不要 stage，不要 commit，不要 push，不要创建 PR，
不要更新 CURRENT_STEP，也不要启动 Developer。完成清单后停止等我确认。
```

## 这一小步完成的证据

- Coordinator 明确报告自己是 Coordinator；
- 显示 Issue #1 为当前唯一 ready 模块，或说明实时状态已经变化；
- 列出当前本地改动并区分治理文件、真实数据、未知改动；
- 没有发生文件修改、stage、commit、push、PR 或 merge；
- 最后一行明确写“等待用户确认 G00.1”。

## 完成后怎么办

不要自己改本文件。回到该 Coordinator 任务，告诉它你是否接受清单。只有你明确授权后，才进入 `G00.2`。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
