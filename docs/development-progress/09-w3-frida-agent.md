# A03：W3 / MOD-03 Frida Agent

| 项目 | 内容 |
| --- | --- |
| GitHub Issue | #7 |
| Developer 任务 | `[DEV][MOD-03][#7] Frida Agent` |
| 分支 | `agent/mod-03/7-frida-agent` |
| 依赖 | #1、#2、#6 已合并 |
| 主要路径 | `agent/`、`src/frida/` |
| RPC | `health`、`searchBySku`、`getProduct`、`getQuotes` |

## 逐步清单

- [x] `A03.1` Coordinator 核对 Profile、Frida 版本和 Issue #7 readiness：#1/#2/#6 已 closed，main CI/Secret Guard 成功；合成 Protocol Profile 仍 fail-closed，不能充当 live 验证。
- [x] `A03.2` 用户授权继续后续开发及本机小批真实 SKU 受控 pilot；真实库存/响应/结果不进入 GitHub。
- [x] `A03.3` 新建受管 Frida Agent Developer：按 #7 仅做 fail-closed RPC/contract 切片，并直接回传 Coordinator。
- [x] `A03.4` AUTONOMOUS_DELIVERY_MODE 覆盖最小 `health`→单搜索→详情→报价切片；Developer 未开展 live collection。
- [x] `A03.5` Developer 实现 fail-closed RPC、会话和版本/schema 守卫；PR #29 head `2fb6f300`。
- [x] `A03.6` Developer 自检无秘密导出、静默 fallback 或 UI 回退；合成 Profile 保持 `PROFILE_INCOMPATIBLE`。
- [x] `A03.7` Developer 按 Issue allowed paths stage。
- [x] `A03.8` Developer commit `[MOD-03] Add fail-closed Frida RPC guard`。
- [x] `A03.9` Developer push `agent/mod-03/7-frida-agent`。
- [x] `A03.10` Developer 创建 Draft PR #29。
- [x] `A03.11` 新建受管 Frida QA：先 fixture/隔离验证断连、版本、Profile、schema 和 redaction；live RPC 仍等待已验证 Profile 与下游编排。
- [ ] `A03.12` QA 分流。
- [x] `A03.13` QA PASS 后新建受管独立 Frida Reviewer；只读审查进程内边界、分页和安全。
- [x] `A03.14` Reviewer REQUEST_CHANGES：distinct-cursor 无界分页 P1；原 Developer 仅修复有界终止与回归测试，随后 fresh QA/Reviewer。
- [ ] `A03.15` Coordinator 判断 merge readiness；停止。
- [ ] `A03.16` 用户授权 merge；停止。
- [ ] `A03.17` Coordinator 验证 #7 done 及 W4 全部上游；用户批准后进入 `I07.1`。

## 本机真实库存 pilot 边界（2026-08-11）

- 输入仅为用户提供的本机工作簿；Coordinator 已只读确认其有 12,318 条非空 SKU 记录和 2,978 个去重 SKU。
- 不需要事先 Golden Sample 或人工同刻 UI 对照；成功后的六列 Excel 仅供用户本机人工检查。
- pilot 只能在版本/Profile/session/schema 守卫通过后进行，且使用显式确认的登录 AVD；任何风险、登录异常、未知版本、hook/schema 不匹配均保存状态并停止。
- 不得把真实 SKU、原始响应、Cookie、Token、签名、设备标识或结果工作簿提交、上传或写入 fixture/Issue/PR。
