# G32：MOD-00 / Authorized Source Contract

| 项目 | 内容 |
| --- | --- |
| GitHub Issue | #32 |
| 范围 | 仅官方或明确许可数据源的字段、权限与替代 contract 决策 |
| 禁止 | Frida 规避、非官方 host 请求、API 调用、真实库存/凭据/原始响应 |

## 阶段

- [x] `G32.0` 用户批准创建架构/合同 Issue #32；Frida production channel 停止。
- [ ] `G32.1` Coordinator / Architecture Auditor 只读审计官方数据源的公开字段与授权要求。
- [ ] `G32.2` Coordinator 记录 go/no-go：必须同时覆盖 SKU 搜索、服务端销量降序、商品名、各尺码卖价和总销量。
- [ ] `G32.3` 若 go，用户批准 v2 contract 与新的 adapter Module；若 no-go，#9/#10 保持 blocked 并进入用户选择的手动或许可来源方案。
