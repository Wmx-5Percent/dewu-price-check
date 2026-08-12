# 当前唯一步骤

| 字段 | 当前值 |
| --- | --- |
| 模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `I07.14` |
| 状态 | `MOD-07_SERIAL_GRAMMAR_REPAIR_ACTIVE` |
| 当前 Wave | W4 / MOD-07 Integration |
| 当前模块 | `MOD-07 Integration`（Issue #8） |
| 当前角色 | 原 MOD-07 Developer（受 Coordinator 管理） |
| 当前打开任务 | 仅增加安全、可移植的 serial grammar；malformed serial 在 bind 前 `EMULATOR_UNAVAILABLE` |
| 受管任务 ID | `/root/mod07_integration_developer` |
| 下一个任务 | Developer READY_FOR_QA 后自动 fresh QA → fresh Reviewer |
| 允许写代码 | 是，仅 Issue #8 allowed paths |
| 允许 commit/push/PR/merge | Developer 可 commit/push 更新 Draft PR；不可 QA/review/merge |

## 当前边界

MOD-03 已在 `7abbc2a391b650d2f7236c0c56de33bfe2e9582d` squash merge，Issue #7 closed；main CI/Secret Guard 成功。#3/#4/#5/#7 均已 closed，MOD-07 可开始集成。集成层不得补写上游内部逻辑、引入逐 SKU UI 或把合成 Profile 当作 live 验证。

用户已明确免除预先 Golden Sample/12 条同刻 UI 对照，改为受控小批本机真实 SKU 的事后人工 Excel 检查。实施顺序为：fixture 端到端安全切片 → 守卫通过的受控 live pilot → 仅本机严格六列 Excel。真实 SKU、原始响应、登录态、设备标识和结果文件不得进入 Git、GitHub、CI 或 fixture。

## 当前证据与停止条件

- #3/#4/#5/#7 已 closed；main `7abbc2a` 的 CI/Secret Guard 成功；Issue #8 已为 `status:ready`。
- 原 MOD-07 Developer 正确发现旧 Coordinator 分支 `c9811ab` 不含已合并的 MOD-03 文件；main-based handoff 已重建。Developer 已创建 Draft PR #30，head `0e663fee72a86a3754d2382f74cd1892de4abc03`。
- 不得使用真实 SKU、设备或登录态来代替 fixture/contract 测试；任何 Profile/session/schema/risk/version 失败必须全局阻断并停止。

QA 已验证目录创建和 blocked binding 归一化；最终 Reviewer 发现 ready 返回的 `data.device` 未与请求 `--device` 精确比对，可能静默使用错误 serial。最终聚焦修复覆盖完整 device-binding 安全语义：Developer 必须精确比对 serial，不一致则在采集前返回 `EMULATOR_UNAVAILABLE`，随后 fresh QA/Reviewer。真实数据 pilot 仍不得执行。
