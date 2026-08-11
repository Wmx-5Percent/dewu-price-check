# P02：W2 / MOD-02 Protocol Discovery

| 项目 | 内容 |
| --- | --- |
| GitHub Issue | #6 |
| Developer 任务 | `[DEV][MOD-02][#6] Protocol Discovery` |
| 分支 | `agent/mod-02/6-protocol-discovery` |
| 依赖 | #1、#2 已合并，Root/Frida smoke test 通过 |
| 主要路径 | `src/discovery/`、`profiles/`、人工复核的脱敏 fixtures |
| 特殊风险 | 逆向猜测、原始响应/秘密泄漏、错误字段映射 |

## 逐步清单

- [x] `P02.1` Coordinator 核对依赖和受控设备条件：#1/#2 closed、#6 OPEN/ready、无 PR、main CI/Secret Guard 成功；Coordinator shell 未在 PATH 找到 adb，Developer 先走可移植 SDK 发现。
- [x] `P02.2` 用户授权继续 MOD-02 受控开发。
- [x] `P02.3` 新建 Protocol Developer：pre-live audit BLOCKED，Java 17 未通过且无专用在线 serial；未触碰设备/APK/登录/真实数据。
- [x] `P02.5` Java 17、专用 Root AVD、arm64 与 Frida 17.16.4 门禁通过；APK/版本/登录与专用 serial 门禁通过。Draft PR #28 已提供合成安全骨架，但 BLOCKED：尚无鞋/服装/配件真实映射、分页与同刻 UI 对照的 redaction-first live evidence，不能猜测 Profile。
- [ ] `P02.4` 用户批准鞋/服装/配件三个样本的人工发现范围；停止。
- [ ] `P02.5` Developer 在受控会话中建立最小发现工具和 Profile 草案；遇风险立即停止。
- [ ] `P02.6` 用户检查脱敏前后字段、UI 同刻对照和字段证据；停止。
- [ ] `P02.7` 用户授权只 stage 代码、Profile 和复核后的脱敏 fixture；停止。
- [ ] `P02.8` 用户授权 commit；停止。
- [ ] `P02.9` 用户授权 push；停止。
- [ ] `P02.10` 用户授权 draft PR；停止。
- [ ] `P02.11` 新建 Protocol QA，独立验证三个类别、排序参数、schema drift 和秘密扫描；停止。
- [ ] `P02.12` QA 分流。
- [ ] `P02.13` 新建 Protocol Reviewer，只读审查 hook/profile/脱敏边界；停止。
- [ ] `P02.14` Review 分流。
- [ ] `P02.15` Coordinator 核对 live evidence 和 merge readiness；停止。
- [ ] `P02.16` 用户授权 merge；停止。
- [ ] `P02.17` Coordinator 验证 #6 done、Profile 版本固定；用户批准后进入 `A03.1`。
