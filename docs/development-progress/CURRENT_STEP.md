# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `P02.13` |
| 状态 | `AUTONOMOUS_PROTOCOL_FRESH_REVIEW` |
| 当前 Wave | W2 / MOD-02 Protocol Discovery |
| 当前模块 | `MOD-02 Protocol Discovery`（Issue #6） |
| 当前角色 | 独立 MOD-02 Reviewer |
| 当前打开任务 | 对 PR #28 `62f03155d63db64938bbce7b436bdfc9e2056f15` 按更新后单 SKU契约进行最终只读审查 |
| 受管任务 ID | `/root/mod02_single_sku_reviewer`（Reviewer 必须发布 Issue #6 structured report 并直接回传 Coordinator） |
| 下一个任务 | Reviewer APPROVE 且 CI 通过后自动 merge readiness 和 non-author squash merge |
| 允许写代码 | 否；仅隔离测试与 Issue #6 QA 证据 |
| 允许 commit/push/PR/merge | 可精确 stage、commit、push `agent/mod-02/6-protocol-discovery` 并创建 Draft PR |

## 你现在只做这一件事

Fresh QA 已 PASS `62f0315` 并在 Issue #6 留存证据。Reviewer 必须独立复审单 SKU search、`sales_desc`、项目 1、fail-closed、秘密边界、范围、Issue/PR 证据与 CI；不得重新引入三类别条件或修改生产代码。

不得改 contracts/dependencies、Jobs、Evidence、Export 或 Integration；不得把 APK、Cookie、Token、签名资料、原始响应或真实业务数据提交到 Git。发现风险/登录异常、未知版本、hook/schema 不匹配或秘密泄露立即记录并停止。

## 这一小步完成的证据

- 原 Developer 按单 SKU/sales_desc/first-item 范围完成 Profile/fixtures/tests、Draft PR 更新和 Issue #6 structured report；
- 然后自动创建新的独立 QA，不能复用此前阻塞验收。

## 完成后怎么办

Developer READY_FOR_QA 后自动 fresh QA → fresh Reviewer → CI → squash merge，除非触发自治暂停条件。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
