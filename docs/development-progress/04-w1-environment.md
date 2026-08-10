# E01：W1 / MOD-01 Environment

| 项目 | 内容 |
| --- | --- |
| GitHub Issue | #2 |
| Developer 任务 | `[DEV][MOD-01][#2] Environment` |
| 分支 | `agent/mod-01/2-environment` |
| 依赖 | #1 已合并 |
| 主要路径 | `src/environment/`、批准的环境脚本 |
| 特殊风险 | 安装 Java/SDK、创建 AVD、Root、Frida Server、APK 与设备状态 |

## 逐步清单

- [ ] `E01.1` Coordinator 只读确认 #1 已合并、#2 ready；停止。
- [ ] `E01.2` 用户批准只启动 MOD-01；停止。
- [ ] `E01.3` 新建 Environment Developer，只做本机环境探测和变更计划；停止。
- [ ] `E01.4` 用户逐项批准软件安装和新 AVD 方案；不得修改现有 `Medium_Phone`；停止。
- [ ] `E01.5` Developer 先实现最小 doctor/bootstrap dry-run；停止。
- [ ] `E01.6` 用户检查路径可移植性、设备 serial 和回滚说明；停止。
- [ ] `E01.7` 用户授权 stage 指定文件；停止。
- [ ] `E01.8` 用户授权 commit；停止。
- [ ] `E01.9` 用户授权 push；停止。
- [ ] `E01.10` 用户授权 draft PR；停止。
- [ ] `E01.11` 新建 Environment QA：先做离线测试，再在明确授权下做新 Root AVD/Frida smoke test；停止。
- [ ] `E01.12` QA 分流；现有 AVD 或真实数据被触碰视为 FAIL。
- [ ] `E01.13` 新建 Environment Reviewer，重点看 destructive actions、绝对路径和版本锁；停止。
- [ ] `E01.14` Review 分流；修改后重新 QA/Review。
- [ ] `E01.15` Coordinator 核对受控 live evidence 与 merge readiness；停止。
- [ ] `E01.16` 用户单独授权 merge；停止。
- [ ] `E01.17` Coordinator 验证 #2 done，并检查 #6 是否满足除 #1 外全部门；用户批准后进入 `J04.1`。

## 学习模式顺序

虽然 #3–#5 此时也可能 ready，暂不并行。先完整体验 MOD-01 的 Developer→QA→Reviewer→Merge。
