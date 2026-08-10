# R06：W6 / 正式全量运行

W6 不是开发 Wave。只运行通过 W5 的固定 release SHA，不在运行中顺手改代码。

## 原子步骤

- [ ] `R06.1` Coordinator 只读确认 #9、release SHA、Profile 和受控环境；停止。
- [ ] `R06.2` 新建 Run Operator 任务，只做 doctor 和输入动态基线预览；停止。
- [ ] `R06.3` 用户核对输入文件、唯一货号数、输出目录、设备 serial 和备份；停止。
- [ ] `R06.4` 用户授权一个极小 canary（例如指定少量货号）；停止。
- [ ] `R06.5` 新建 Run QA，独立核对 canary 响应证据与 UI；停止。
- [ ] `R06.6` Coordinator 判断是否允许 50 条运行；停止。
- [ ] `R06.7` 用户授权 50 条运行；结束或阻塞后停止。
- [ ] `R06.8` Run QA 验证准确性、耗时、断点、秘密和 6 列 Excel；停止。
- [ ] `R06.9` Coordinator 判断是否满足全量门；停止。
- [ ] `R06.10` 用户明确授权当前库存全量运行；停止条件由全局阻塞规则决定。
- [ ] `R06.11` Run Operator 输出完成/失败/blocked 状态，不修改程序。
- [ ] `R06.12` Run QA 独立抽检结果、证据哈希和公式错误；停止。
- [ ] `R06.13` 新建 Release Reviewer，只读审查验收报告；停止。
- [ ] `R06.14` Coordinator 汇总 Issue #10；由用户决定关闭、重跑或进入新的规划周期。

## 运行中发现代码缺陷

立即停止运行，记录 checkpoint，返回 Coordinator 新建 Bug Issue。不得在 Run Operator 任务里直接修代码。Bug 使用新的 Developer→QA→Reviewer→Merge 循环和新的 release SHA，之后重新从 canary 开始。
