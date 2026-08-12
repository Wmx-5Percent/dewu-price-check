# G32：MOD-00 / Authorized Source Contract

| 项目 | 内容 |
| --- | --- |
| GitHub Issue | #32 |
| 范围 | 仅官方或明确许可数据源的字段、权限与替代 contract 决策 |
| 禁止 | Frida 规避、非官方 host 请求、API 调用、真实库存/凭据/原始响应 |

## 阶段

- [x] `G32.0` 用户批准创建架构/合同 Issue #32；Frida production channel 停止。
- [x] `G32.1` Coordinator / Architecture Auditor 完成官方数据源公开字段与授权要求的只读审计。
- [x] `G32.2` Coordinator 记录 NO-GO：官方开放平台与官方域名资料不能直接证明 SKU 搜索、服务端销量降序、商品名、各尺码卖价、总销量或权限范围。
- [x] `G32.3` no-go 处置：不创建 v2 contract 或 adapter；Issue #32、#9、#10 保持 blocked。只有提供商明确授权并提供五项字段覆盖的官方文档后才能重新审计。
