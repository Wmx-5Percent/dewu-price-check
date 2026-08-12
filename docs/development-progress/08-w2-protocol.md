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

- [x] `P02.1` Coordinator 核对 #1/#2 closed、Root/Frida smoke 通过、#6 ready。
- [x] `P02.2` AUTONOMOUS_DELIVERY_MODE 授权启动 MOD-02。
- [x] `P02.3` Protocol Developer 完成最小安全 discovery/profile guard 审计。
- [x] `P02.4` 用户确认单链路：不区分类别，SKU 搜索必须传服务端 `sales_desc` 并选响应项目 1。
- [x] `P02.5` Developer 实现合成、fail-closed Profile/fixture/test；未将其宣称为 live 验证。
- [x] `P02.6` 脱敏/秘密边界以合成 fixture 审查；预先 UI Golden Sample 后由用户明确免除。
- [x] `P02.7`–`P02.10` Developer 按允许路径 stage、commit、push 并创建 Draft PR #28。
- [x] `P02.11` 独立 QA：首轮 PASS；P1/P2 修复后 fresh QA PASS，版本/profile/schema/秘密失败均 fail-closed。
- [x] `P02.12` QA 分流：synthetic fixture 不得解锁 downstream；未知 pagination 字段三层拒绝。
- [x] `P02.13` Reviewer 首轮 REQUEST_CHANGES；修复后 fresh Reviewer APPROVE。
- [x] `P02.14` Review 分流回原 Developer：synthetic Profile 始终 `PROFILE_INCOMPATIBLE`。
- [x] `P02.15` Coordinator merge readiness：QA、Reviewer、范围和 CI/Secret Guard 通过。
- [x] `P02.16` AUTONOMOUS_DELIVERY_MODE 覆盖非作者 squash merge；PR #28 已合并为 `11f8a9b`。
- [x] `P02.17` Coordinator 验证 #6 closed；进入 `A03.1`。注意：已合并的是安全 fail-closed guard，非 live-validated Profile。
