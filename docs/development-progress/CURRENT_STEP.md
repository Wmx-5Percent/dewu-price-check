# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `P02.5` |
| 状态 | `AUTONOMOUS_SINGLE_SKU_DISCOVERY_SCOPE` |
| 当前 Wave | W2 / MOD-02 Protocol Discovery |
| 当前模块 | `MOD-02 Protocol Discovery`（Issue #6） |
| 当前角色 | 独立 MOD-02 Developer |
| 当前打开任务 | 回原 Developer：按货号搜索、强制服务端 `sales_desc` 并选择响应第一个项目的单链路 Profile/fixture 验收 |
| 受管任务 ID | `/root/mod02_protocol_developer`（原 Developer 恢复） |
| 下一个任务 | Developer READY_FOR_QA 后自动 fresh QA → fresh Reviewer → CI → merge |
| 允许写代码 | 是，仅 `src/discovery/**`、`profiles/**` 与人工复核的脱敏 fixtures |
| 允许 commit/push/PR/merge | 可精确 stage、commit、push `agent/mod-02/6-protocol-discovery` 并创建 Draft PR |

## 你现在只做这一件事

用户已明确改为单链路验收：输入 SKU、使用已验证的服务端 `sales_desc`、并选择响应项目 1；不再区分鞋/服装/配件，也不以三类别分页/UI 对照为门槛。Draft PR #28 `b1a98c2` 已有合成 fixtures、秘密/原始字段拒绝、`sales_desc` 强制及 fail-closed `PROFILE_INCOMPATIBLE`；原 Developer 必须将 Profile/fixtures/tests 与这一范围精确对齐，且不得猜测字段。

不得改 contracts/dependencies、Jobs、Evidence、Export 或 Integration；不得把 APK、Cookie、Token、签名资料、原始响应或真实业务数据提交到 Git。发现风险/登录异常、未知版本、hook/schema 不匹配或秘密泄露立即记录并停止。

## 这一小步完成的证据

- 原 Developer 按单 SKU/sales_desc/first-item 范围完成 Profile/fixtures/tests、Draft PR 更新和 Issue #6 structured report；
- 然后自动创建新的独立 QA，不能复用此前阻塞验收。

## 完成后怎么办

Developer READY_FOR_QA 后自动 fresh QA → fresh Reviewer → CI → squash merge，除非触发自治暂停条件。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
