# 标准模块交付循环

每个 MOD 模块都执行同一套 17 个原子步骤。模块文件中的 `<前缀>.1` 到 `<前缀>.17` 分别对应这里的 `C01` 到 `C17`。

## C01 — Coordinator 就绪检查

- 任务：复用 Coordinator。
- 只读检查 Issue 依赖、上游合并 SHA、开放 PR、失败 CI 和本地基线。
- 输出 allowed paths、contract version、验收证据。
- 停止：不得创建 Developer。

## C02 — 用户批准启动

- 任务：你在 Coordinator 中明确说只启动这个模块。
- Coordinator 可把 Issue 标为 in-progress，但没有你的 GitHub 写授权时只能给出建议。
- 停止：不得写代码。

## C03 — 新建 Developer

- 任务：新建，不复用其他模块任务。
- 使用独立 worktree 和 `agent/mod-XX/<issue>-<slug>` 分支。
- 开场只做只读仓库/依赖/契约检查。
- 停止：先交实现小计划，不改代码。

## C04 — 用户批准最小实现

- 你确认 Developer 的文件清单、非目标和最小端到端切片。
- 只授权当前切片，不授权 commit/push/PR。

## C05 — Developer 实现与自检

- 只改允许路径，运行 Issue 规定的开发自检。
- 输出 diff、命令和结果。
- 停止：不得 stage/commit。

## C06 — 用户检查实现说明

- 让 Developer 用初学者语言解释“改了什么、为什么、如何回滚”。
- 发现超范围立即要求缩小。

## C07 — 单独授权 stage

- 只 stage 明确路径，禁止 `git add .`。
- 展示 `git diff --cached` 后停止。

## C08 — 单独授权 commit

- 创建一个模块内聚 commit。
- 返回 SHA 和未提交文件后停止，不 push。

## C09 — 单独授权 push

- 只 push 当前模块分支。
- 返回远程分支和 SHA 后停止，不创建 PR。

## C10 — 单独授权 draft PR

- 创建一个 draft PR，关联 Issue、合同版本、测试结果和修改路径。
- 停止：Developer 不得自审、自行 ready 或合并。

## C11 — 新建独立 QA

- QA 读取 Issue、PR、contract 和 Developer 证据。
- 默认只运行/设计独立测试，不修生产代码。
- 输出 PASS/FAIL/BLOCKED 和可复现证据。

## C12 — QA 分流

- PASS：进入 C13。
- FAIL：返回原 Developer 修复，重复 C05–C12。
- BLOCKED：返回 Coordinator 处理依赖；不得把 blocked 当 pass。

## C13 — 新建独立 Reviewer

- Reviewer 只读审查 diff、边界、安全、数据损失、可移植性和测试证据。
- 输出 APPROVE 或 REQUEST_CHANGES。

## C14 — Review 分流

- APPROVE：进入 C15。
- REQUEST_CHANGES：返回原 Developer，修复后必须重新经历 QA 和 Reviewer，旧批准失效。

## C15 — Coordinator 合并就绪检查

- 复用 Coordinator。
- 核对 QA、Review、CI、依赖、contract、分支 SHA 和敏感数据扫描。
- 只给 READY/NOT_READY；不得自动合并。

## C16 — 用户单独授权合并

- 只有 READY 时，你才授权 squash merge。
- 合并后先不要删除分支/worktree。

## C17 — Coordinator 收尾

- 验证 `main` SHA、Issue 状态、下游解锁和回滚点。
- 只有你批准后更新 `CURRENT_STEP.md` 与 `PROGRESS.md`。
- 再由你决定是否删除分支/worktree和开始下一模块。

## 核心认知

Developer 的“测试通过”只完成 C05，不等于 C11 的独立 QA，更不等于 C13 的审查。PR 存在也不代表可以合并。
