# 当前唯一步骤

> 这是人工控制点。除非用户明确批准，任何 Agent 都不得修改本文件、勾选后续步骤或自动开始下一项。

| 字段 | 当前值 |
| --- | --- |
| 模式 | `AUTONOMOUS_DELIVERY_MODE` |
| 当前步骤 | `P02.5` |
| 状态 | `AUTONOMOUS_APK_TRANSFER_AND_PROTOCOL_DISCOVERY` |
| 当前 Wave | W2 / MOD-02 Protocol Discovery |
| 当前模块 | `MOD-02 Protocol Discovery`（Issue #6） |
| 当前角色 | 独立 MOD-02 Developer |
| 当前打开任务 | 从用户指定 `emulator-5554` 只读提取已安装得物 APK，安装到专用 `emulator-5556`，然后回原 Developer 做版本门禁和受控发现 |
| 受管任务 ID | `/root/mod02_protocol_developer`（原 Developer 恢复） |
| 下一个任务 | 版本门禁通过后继续最小受控发现、Profile/脱敏 fixture、Draft PR → fresh QA → fresh Reviewer |
| 允许写代码 | 是，仅 `src/discovery/**`、`profiles/**` 与人工复核的脱敏 fixtures；用户已授权 APK transfer/专用 AVD 安装 |
| 允许 commit/push/PR/merge | 可精确 stage、commit、push `agent/mod-02/6-protocol-discovery` 并创建 Draft PR |

## 你现在只做这一件事

用户已授权：优先从 `emulator-5554` 已安装得物 App 只读提取 APK，再仅安装到专用 Root AVD `emulator-5556`。5554 当前离线，现额外授权仅启动并等待它在线、执行 `pm path`/`adb pull`、随后停止；严禁在其上安装、登录、Hook、搜索或采集。5556 是唯一允许安装、版本门禁、Frida 和受控发现的设备。不得提交 APK 或真实数据。

不得改 contracts/dependencies、Jobs、Evidence、Export 或 Integration；不得把 APK、Cookie、Token、签名资料、原始响应或真实业务数据提交到 Git。发现风险/登录异常、未知版本、hook/schema 不匹配或秘密泄露立即记录并停止。

## 这一小步完成的证据

- 原 Developer 推送仅含允许 Export/测试路径的修复，并发布 Issue #5 structured report；
- 修复后自动创建新的独立 QA，不能复用失败 QA。

## 完成后怎么办

Developer READY_FOR_QA 后自动 fresh QA → fresh Reviewer → CI → squash merge，除非触发自治暂停条件。

实时快照日期：2026-08-09。GitHub 状态会变化，Coordinator 每次必须重新读取，不能只相信这份快照。
