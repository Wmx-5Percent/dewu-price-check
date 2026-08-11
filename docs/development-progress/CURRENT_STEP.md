# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `I07.3` |
| 状态 | `MOD-07_INTEGRATION_DEVELOPER_ACTIVE` |
| 当前 Wave | W4 / MOD-07 Integration |
| 当前模块 | `MOD-07 Integration`（Issue #8） |
| 当前角色 | MOD-07 Developer（受 Coordinator 管理） |
| 当前打开任务 | 只装配已合并的 Jobs/Evidence/Export/Frida 模块与 CLI；不得重写上游逻辑 |
| 受管任务 ID | 启动后由 Coordinator 记录 |
| 下一个任务 | Developer READY_FOR_QA 后自动 fresh QA |
| 允许写代码 | 是，仅 Issue #8 allowed paths |
| 允许 commit/push/PR/merge | Developer 可 commit/push/draft PR；仅非作者可在 QA/Reviewer/CI 后 squash merge |

## 你现在只做这一件事

MOD-03 已在 `7abbc2a391b650d2f7236c0c56de33bfe2e9582d` squash merge，Issue #7 closed；main CI/Secret Guard 成功。#3/#4/#5/#7 均已 closed，MOD-07 可开始集成。不得在集成层补写上游内部逻辑、引入逐 SKU UI 或把合成 Profile 当作 live 验证。

用户已明确免除预先 Golden Sample/12 条同刻 UI 对照，改为受控小批本机真实 SKU 的事后人工 Excel 检查。实施顺序仍为：fixture 端到端安全切片 → 守卫通过的受控 live pilot → 仅本机六列 Excel。真实 SKU、原始响应、登录态、设备标识和结果文件不得进入 Git、GitHub、CI 或 fixture。

不得改 contracts/dependencies、Jobs、Evidence、Export 或 Integration；不得把 APK、Cookie、Token、签名资料、原始响应或真实业务数据提交到 Git。发现风险/登录异常、未知版本、hook/schema 不匹配或秘密泄露立即记录并停止。

## 这一小步完成的证据

- #3/#4/#5/#7 已 closed；MOD-03 main CI/Secret Guard 成功；Issue #8 已由 `status:blocked` 更新为 `status:ready`。
- 库存工作簿仅作本地 pilot 输入，已确认 2,978 个去重 SKU；不向远端披露任何真实 SKU。

## 完成后怎么办

Developer READY_FOR_QA 后自动 fresh QA → fresh Reviewer → CI → 非作者 squash merge。任何真实数据 live pilot 必须在 Integration/Agent 守卫可用后执行，且只输出本机文件。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
