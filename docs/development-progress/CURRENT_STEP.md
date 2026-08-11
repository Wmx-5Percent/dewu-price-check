# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `P02.3` |
| 状态 | `AUTONOMOUS_PROTOCOL_DEVELOPER_DISCOVERY` |
| 当前 Wave | W2 / MOD-02 Protocol Discovery |
| 当前模块 | `MOD-02 Protocol Discovery`（Issue #6） |
| 当前角色 | 独立 MOD-02 Developer |
| 当前打开任务 | 协议发现方案、数据最小化设计与受控发现工具/Profile 草案 |
| 受管任务 ID | 待 Coordinator 创建并记录 |
| 下一个任务 | Developer READY_FOR_QA 后自动 fresh QA → fresh Reviewer → CI → squash merge |
| 允许写代码 | 是，仅 `src/discovery/**`、`profiles/**` 与人工复核的脱敏 fixtures |
| 允许 commit/push/PR/merge | 可精确 stage、commit、push `agent/mod-02/6-protocol-discovery` 并创建 Draft PR |

## 你现在只做这一件事

P02.1 审计：#1/#2 已关闭，#6 OPEN + `status:ready`，无 MOD-02 PR，main CI/Secret Guard 成功。Coordinator shell 当前未在 `PATH` 发现 `adb`；Developer 必须先使用 MOD-01 可移植 SDK 发现逻辑定位工具，并在获得专用、显式 serial 前不得进行 live hook、登录或业务数据采集。

不得改 contracts/dependencies、Jobs、Evidence、Export 或 Integration；不得把 APK、Cookie、Token、签名资料、原始响应或真实业务数据提交到 Git。发现风险/登录异常、未知版本、hook/schema 不匹配或秘密泄露立即记录并停止。

## 这一小步完成的证据

- 原 Developer 推送仅含允许 Export/测试路径的修复，并发布 Issue #5 structured report；
- 修复后自动创建新的独立 QA，不能复用失败 QA。

## 完成后怎么办

Developer READY_FOR_QA 后自动 fresh QA → fresh Reviewer → CI → squash merge，除非触发自治暂停条件。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
