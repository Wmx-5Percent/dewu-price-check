# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `A03.3` |
| 状态 | `MOD-03_DEVELOPER_ACTIVE` |
| 当前 Wave | W3 / MOD-03 Frida Agent |
| 当前模块 | `MOD-03 Frida Agent`（Issue #7） |
| 当前角色 | MOD-03 Developer（受 Coordinator 管理） |
| 当前打开任务 | 仅实现 fail-closed Frida RPC/contract 切片；不得把合成 Protocol guard 当作已验证的 live Profile |
| 受管任务 ID | 启动后由 Coordinator 记录 |
| 下一个任务 | Developer READY_FOR_QA 后自动 fresh QA |
| 允许写代码 | 是，仅 Issue #7 allowed paths |
| 允许 commit/push/PR/merge | Developer 可 commit/push/draft PR；仅非作者可在 QA/Reviewer/CI 后 squash merge |

## 你现在只做这一件事

MOD-02 已由 PR #28 在 `11f8a9b800a26d680d0c95ad0ff7dc4500cbaaa8` squash merge，Issue #6 closed。该模块交付了单 SKU→`sales_desc`→项目 1的安全 fail-closed Profile guard；合成 Profile 必须继续 `PROFILE_INCOMPATIBLE`，直到未来有人工复核的脱敏 live metadata。Coordinator 已在 2026-08-11 核对 #1/#2/#6 closed、main CI/Secret Guard 成功、#7 无模块 PR；#7 因此可由 Developer 开始 fail-closed RPC/contract 切片，不能静默将 guard 当作验证的 live Profile。

用户已授权将本机库存工作簿仅用于受控 live pilot：可从 12,318 条记录中抽取小批真实 SKU，在显式确认的登录 AVD 上采集，并输出仅本机的六列 Excel 供用户事后人工核对。真实 SKU、原始响应、登录态、设备标识和输出文件均不得进入 Git、GitHub、CI 或测试 fixture；不得因缺少预先 Golden Sample 而伪造 Profile 验证。

不得改 contracts/dependencies、Jobs、Evidence、Export 或 Integration；不得把 APK、Cookie、Token、签名资料、原始响应或真实业务数据提交到 Git。发现风险/登录异常、未知版本、hook/schema 不匹配或秘密泄露立即记录并停止。

## 这一小步完成的证据

- #1/#2/#6 已 closed；Issue #7 已由 `status:blocked` 更新为 `status:ready`；无 MOD-03 PR 或失败 CI。
- 库存工作簿仅作本地 pilot 输入，已确认 2,978 个去重 SKU；不向远端披露任何真实 SKU。

## 完成后怎么办

Developer READY_FOR_QA 后自动 fresh QA → fresh Reviewer → CI → 非作者 squash merge，除非触发自治暂停条件。任何真实数据 live pilot 必须在 Agent 与下游编排/导出路径可用后执行，且只输出本机文件。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
