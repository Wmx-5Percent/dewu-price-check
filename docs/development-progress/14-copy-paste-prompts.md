# 可复制提示词

把尖括号内容替换成当前模块信息。每条提示词只对应一个原子步骤。

## 所有新任务必须附加的实时交接块

把下列内容放在每个 Developer、QA、Reviewer 提示词的最前面，并替换尖括号。它解决新 worktree 从旧 `main` 基线读取到过期 `CURRENT_STEP.md` 的问题。

```text
Coordinator handoff snapshot（本任务内的当前操作事实）：
- 步骤：<STEP_ID>
- 角色：<ROLE>
- Issue/PR/head：<ISSUE_PR_HEAD>
- 允许动作：<ALLOWED_ACTIONS>
- 禁止动作：<FORBIDDEN_ACTIONS>
- 停止条件：<STOP_CONDITION>
- Coordinator 实时文件：/Users/waywei/Desktop/developer/dewu-price-check/docs/development-progress/CURRENT_STEP.md

先读取本 worktree 内的 AGENTS.md 和进度文件；若本地 `CURRENT_STEP.md` 比该 handoff snapshot 旧，只报告该快照差异，并以本 handoff snapshot 执行本任务。它不是 GitHub 依赖或 PR 状态冲突。不得修改本 worktree 的进度控制文档。
```

## Coordinator：模块就绪检查

```text
你是长期 Coordinator。当前只执行步骤 <STEP_ID>。
请读取 AGENTS.md、CURRENT_STEP、对应 Wave 文件、master plan 和 GitHub Issue #<N>。
只读检查依赖、上游 merge SHA、开放 PR、失败 CI、contract 版本和允许路径。
输出 READY 或 NOT_READY，并用初学者语言解释原因。
不要修改文件、Issue 或进度，不要启动 Developer，完成后停止。
```

## Developer：新任务第一次进入

```text
你是 <MOD-XX> 的唯一 Module Developer，不是 QA、Reviewer 或 Coordinator。
当前只执行步骤 <STEP_ID>，Issue #<N>，分支 <BRANCH>。
请读取 AGENTS.md、CURRENT_STEP、对应 Wave 文件、master plan 和 Issue。
先只读检查仓库、依赖、contract、测试和 allowed paths。
给出最小端到端实现切片、准确文件清单、非目标、风险、自检命令和回滚方法。
不要修改代码，不要 stage/commit/push/PR，等我批准下一步。
```

## Developer：批准实现

```text
我只批准执行步骤 <STEP_ID> 中刚才确认的最小切片。
只改已列出的 allowed paths，完成实现和开发自检后展示 diff 与结果。
不要 stage、commit、push、创建 PR，也不要开始下一切片。
```

## Developer：只授权 stage

```text
我只授权 stage 以下明确路径：<PATHS>。
禁止 git add .、git add -A 或加入其他文件。
stage 后展示 git diff --cached 和仍未提交的文件，然后停止。
不授权 commit 或 push。
```

## Developer：只授权 commit

```text
我已检查 staged diff，只授权创建这一个 commit，消息为：<MESSAGE>。
commit 后报告 SHA 和 git status，然后停止。
不授权 push、PR 或 merge。
```

## Developer：只授权 push

```text
我只授权把当前分支 <BRANCH> push 到 origin。
push 后报告远程分支和 SHA，然后停止。
不授权创建 PR 或 merge。
```

## Developer：只授权 draft PR

```text
我只授权为当前分支创建一个 draft PR，base 为 main。
按 AGENTS.md 写明 Closes #<N>、contract、路径、测试、证据和未完成项。
创建后返回 PR 链接并停止。
不要标记 ready、不要 review、不要 merge。
```

## QA：新任务

```text
你是独立 QA，不是本 PR 的 Developer、Reviewer 或修复者。
当前只执行步骤 <STEP_ID>，验证 PR <URL> / Issue #<N>。
读取 AGENTS.md、CURRENT_STEP、对应 Wave 文件、contract 和 PR diff。
独立设计并运行与风险相称的测试，核对 Developer 没有把自测冒充 QA。
不要修改生产代码。输出 PASS、FAIL 或 BLOCKED，附准确命令、结果和复现步骤。
报告后停止，不要修复、approve 或 merge。
```

## Reviewer：新任务

```text
你是独立 Reviewer，不是 Developer 或 QA。
当前只执行步骤 <STEP_ID>，只读审查 PR <URL> / Issue #<N>。
读取 AGENTS.md 的 Code Review Rules、contract、完整 diff、QA 报告和 CI。
重点检查正确性、安全、数据损失、模块越界、可移植性和验收证据。
输出 APPROVE 或 REQUEST_CHANGES；问题标明文件和行。
不要修改文件、运行修复、commit、push 或 merge，报告后停止。
```

## Coordinator：合并就绪

```text
你是长期 Coordinator。当前只执行步骤 <STEP_ID>，检查 PR <URL>。
只读核对依赖、head SHA、CI、独立 QA、独立 Review、contract、
修改路径和敏感数据扫描。
只输出 READY_TO_MERGE 或 NOT_READY，并列出证据。
不要 merge，不要更新进度，不要启动下一模块。
```

## 用户：只授权合并

```text
我确认 Coordinator 给出 READY_TO_MERGE。
只授权将 PR <URL> squash merge 到 main。
合并后报告 merge SHA 和 Issue 状态，然后停止。
暂不授权删除分支/worktree或启动下一模块。
```
