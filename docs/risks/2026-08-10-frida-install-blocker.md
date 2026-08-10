# Frida 17.16.4 完整安装风险记录

## 状态

处置已验证；常规预编译下载仍有瞬态网络风险。此记录对应 GitHub Issue #1 的脱敏安装证据评论。

## 复现条件

- 日期：2026-08-10
- Node.js：v22.23.1
- npm：10.9.8
- 依赖：`frida@17.16.4`
- 命令：在新建临时目录中仅复制 `package.json` 和 `package-lock.json` 后运行 `npm ci --foreground-scripts`。

## 原始失败（历史事实）

一次安装以退出码 1 结束：Frida 安装脚本的预编译下载连接中断；脚本随后回退到源码构建，并在 Meson 阶段报告缺少 `package-lock.json`。

该源码回退路径不可用：发布包缺少 `package-lock.json`。普通预编译下载失败时必须记录 blocker 并停止，不得进入源码回退。

## 已验证处置

- 固定依赖为 `frida@17.16.4`，运行时为 Node.js 22，使用现有 lockfile。
- 已验证官方 darwin-arm64 预编译包的 SHA-256：`fe65e5b9b0137c400dd6626f9144cf194374a3df2386689667eccda88ffa6cf3`。
- 将该已校验资产一次性预置到 npm cache 后，完整 `npm ci --foreground-scripts` 与 `import('frida')` 均成功。
- 没有持久 registry、`.npmrc`、代理或 npm cache 改动，也没有版本变更。

## 持续边界

MOD-00 的离线 contract 检查可以使用 `npm ci --ignore-scripts`，但它不是完整 Frida 安装验收。完整安装的已验证处置不消除常规下载的瞬态网络风险；若再次发生下载失败，记录 blocker 并停止，等待新的用户批准后再处理。

原始临时安装目录和日志已在发布脱敏 Issue 证据后删除；本文件不包含本地路径、凭据、Cookie、Token、APK 或设备信息。
