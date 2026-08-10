# 得物库存货号价格与销量采集项目总规划

> 本文是本项目当前唯一的执行总规划。后续每次确认规则、发现问题或调整字段，都直接更新本文，并在 [CHANGELOG.md](./CHANGELOG.md) 中记录变更。
>
> 本规划面向自动化执行，不绑定某一个库存文件、文件日期、货号数量或类别数量。每次运行使用当次传入的库存文件动态建立数据基线。

## 1. 项目目标

从每次运行传入的库存文件中提取唯一货号，通过得物 App 已登录会话和请求签名能力直接调用其商品接口，自动采集每个货号的：

- 得物商品名称；
- 得物购买页面实际显示的全部尺码；
- 每个显示尺码对应的得物卖价；
- 商品级总销量。

正式批量循环不得依赖逐货号点击、输入、滚动或 UI XML 解析。得物 UI 只用于首次登录、协议发现、同刻准确性对照和人工复核。最终交付一份只包含核心结果的 Excel。库存原始尺码与得物页面尺码之间的 US/UK/其他码制转换属于后续阶段，不影响当前阶段对得物页面原始信息的采集。

## 2. 运行时输入与动态数据基线

### 2.1 输入文件

库存文件路径由每次运行的参数提供，不在本规划中写死。未来更换文件时，只要满足输入结构要求，就沿用同一套任务和采集流程。

输入文件至少需要能够识别“货号”字段。品牌、类别、性别、库存尺码等字段可以作为任务辅助信息，但当前得物采集和交付 Excel 不依赖库存尺码与得物尺码的映射。

### 2.2 每次运行开始时动态建立基线

程序在处理任何货号前，必须从当次输入文件动态计算并记录本次运行基线，包括：

- 输入文件标识和读取结果；
- 实际读取的库存明细行数；
- 空货号、格式异常货号和重复货号数量；
- 去重后的唯一货号数量；
- 如果输入文件提供类别字段，则动态统计类别分布；
- 本次生成的货号任务清单。

这些数量只属于本次运行报告、任务状态或日志，不回写到本总规划，也不作为下一次运行的固定基准。不同库存文件的数据量可以不同，但去重、采集、落盘、验收规则保持一致。

### 2.3 货号去重规则

货号去重时去除首尾空格并统一大小写；空值和无法识别的货号进入异常记录，不进入得物搜索任务。每个唯一货号只建立一个主任务，避免库存中同一货号因重复尺码行而重复搜索。

### 2.4 验证输入规则

验证只能使用经批准的合成输入或人工复核的脱敏输入。真实库存文件、其文件名、工作表范围、业务数量和派生样本均属于本地运行数据，不得写入公开规划、测试说明或 Git。

验证输入只用于输入解析、批量运行和性能测试；它不包含得物商品名、价格、销量或原始接口响应，也不得被表述为已验证的得物采集结果。

## 3. 已确认的响应级自动化采集动作

以下顺序是固定动作，不在不同货号之间改变：

1. 读取本次输入文件，动态生成唯一货号任务清单。
2. 启动或连接受控 Root Android Emulator/设备，检查 ADB、Root、Frida Server、得物进程、登录态、网络和协议 Profile。
3. Frida Agent 附加到得物进程，并确认当前得物版本存在已验收的 `ProtocolProfile`；版本未知或 Hook 点失效时全局阻塞。
4. 对当前货号调用得物进程内的搜索请求能力，明确传入通过协议发现确认的“销量降序”参数；不得获取默认结果后在采集器内部自行按销量排序。
5. 校验响应成功且排序模式正确，直接选择响应中的第一条商品。保持现有业务规则：不二次核验页面货号，第一条销量结果就是采集对象。
6. 使用所选商品 ID 调用商品详情和尺码报价接口；请求在得物进程内使用 App 原有的会话、设备参数、请求头和签名能力完成。
7. 根据已验收的响应字段映射读取商品名、全部页面可显示尺码、每个尺码的实际卖价和商品级总销量。接口存在分页时持续请求到服务端明确表示结束，不用 UI 滚动判断完整性。
8. 将脱敏响应证据、解析结果和任务状态原子落盘，再处理下一个货号。

正式批量循环中禁止为每个货号执行搜索框输入、点击“销量”、进入商品页、点击“立即购买”、滚动尺码弹层或读取 UI XML。上述 UI 动作只允许在建立新版本协议 Profile、同刻准确性对照或人工复核时使用。

### 3.1 协议发现与版本兼容原则

- 每个 `ProtocolProfile` 必须绑定得物 `versionName`、`versionCode`、请求构造/签名 Hook 点、销量降序参数、响应字段路径和页面可显示尺码过滤规则。
- 首个实现 Profile 锁定当前已安装的得物 `5.95.1 (versionCode 1101)`；App 版本变化后必须重新执行少量协议发现和回归验收。
- 协议发现至少使用鞋子、服装、配件各一个货号，关联“购买页搜索 → 销量排序 → 第一条商品 → 立即购买”的请求与响应，并生成脱敏离线 fixture。
- 优先由 Frida Agent 直接调用得物内部网络客户端并返回响应，避免把 Cookie、Token 或签名密钥导出到电脑。只有完成独立验证后，才允许使用“App 生成签名、电脑发送请求”的可选传输方式。
- 如果响应含有多个价格、销量或尺码字段，必须通过同一时刻的 UI 对照确定实际展示字段；不得自行取最低价、最大销量或猜测字段含义。

### 3.2 尺码采集原则

- 不假设得物使用欧码、美码、英码或其他固定码制。
- 得物页面显示什么，就记录什么；例如 `40⅔`、`US 9`、`UK 8`、`M` 等均作为页面原始文本保存。
- 不将库存尺码与得物显示尺码做匹配、换算或筛选。
- 不因库存没有对应尺码、尺码格式特殊或价格为空而丢弃得物页面的尺码记录。
- 无报价或页面显示 `--` 时，尺码仍保留，价格留空，并在异常说明中注明。

### 3.3 销量采集原则

- 采集商品级总销量，不按尺码拆分。
- Excel 中保存得物页面的销量原文，例如 `169万+人付款`。
- “销量下限”只允许作为内部排序或调试信息使用，不写入交付 Excel。
- 不在 Excel 中拆分销量来源、销量近似标记或其他中间解析字段。

### 3.4 全局阻塞原则

遇到验证码、风险提示、登录失效、429/明确限流、得物 App 无响应、Frida 断连、协议 Profile 不兼容、响应 Schema 漂移、模拟器异常、ADB 无法连接设备或其他会影响后续货号判断的全局问题时：

1. 立即停止当前运行或当前批次；
2. 保存已经完成的结果和当前任务状态；
3. 将阻塞原因写入本次运行的异常记录；
4. 不继续尝试后面的货号，等待问题处理后再从断点恢复。

## 4. 自动化执行、批次与断点

最终目标是处理每次输入文件中的全部唯一货号，但执行器必须支持安全暂停和自动恢复，不要求一次性把所有任务放在一个不可恢复的长流程中运行。

运行参数至少应支持：

- 输入文件路径；
- 目标设备 serial；
- 可选的类别过滤；
- 可配置的批次大小、最大并发和限速；
- 指定货号执行；
- 断点续跑；
- 普通失败重试；
- 全局阻塞后暂停。

批次大小和并发是运行参数，不是项目范围或固定数据基线。并发采用自适应 `1 → 2 → 4`：从单并发开始，仅在响应成功率和延迟稳定时逐步提升，最大同时处理 4 个货号；出现 429、超时率上升、会话异常或风险响应时立即降速或全局暂停。不得以规避风控为目的重试、改写设备标识或轮换账号。

任务状态和运行状态至少区分：`pending`、`collected`、`failed`、`blocked`。限流、登录失效、Profile 不兼容、Schema 漂移等细分原因作为内部错误码记录。每个货号完成后立即落盘，程序重启时根据状态跳过已完成货号，从未完成货号继续。状态、日志、脱敏响应和错误证据属于运行时数据，不进入交付 Excel，也不写入本总规划。

## 5. 交付 Excel 规范

每次运行根据本次输入文件生成新的交付 Excel。结果表只允许有以下 6 列：

| 列名 | 内容要求 |
| --- | --- |
| 货号 | 本次输入文件去重后的货号 |
| 得物商品名 | 销量降序响应第一条商品在得物页面对应显示的商品名 |
| 得物显示尺码 | 已验收响应字段映射到得物购买弹层的尺码原文，不转换、不改写 |
| 得物卖价（元） | 已验收响应字段映射到该显示尺码的得物卖价；无报价时留空 |
| 总销量 | 商品级总销量原文，例如 `169万+人付款` |
| 异常或人工复核说明 | 无结果、无报价、解析异常、App/ADB/Frida/Profile 阻塞、待采集等说明 |

正常采集结果中，每一行代表一个“货号 × 得物页面显示尺码”。未采集、失败或全局阻塞的货号可以保留一行空尺码记录，仅用于异常追踪；不得填入未经采集的商品名、尺码、价格或销量。

以下字段明确禁止出现在当前阶段交付 Excel 中：

- 匹配后的得物尺码；
- 库存原始尺码；
- 得物页面货号；
- 单独的“销量原文”列；“总销量”列可以直接保存页面原文，但不再额外拆出销量下限、销量近似或销量来源；
- 采集时间；
- 匹配状态、尺码匹配状态、价格状态；
- 其他内部调试、候选排序、来源行号或任务状态字段。

## 6. 内部运行数据与交付数据的边界

自动化程序可以在本次运行目录中保存断点、状态、脱敏请求/响应 fixture、商品 ID、搜索排名、排序参数、variant/sku ID、在售状态、得物/Profile 版本、请求关联 ID、证据哈希、截图、错误信息、重试次数和采集时间，以支持恢复和调试。但这些运行数据不是项目计划，也不能改变交付 Excel 的 6 列规范。

Cookie、Authorization、签名、设备令牌和其他会话秘密不得写入日志或普通 JSON。响应证据必须先经过字段白名单和敏感信息脱敏；交付结果必须能通过证据哈希和请求关联 ID 回溯到对应的内部响应。

本项目的规则讨论不保存阶段性计划副本或中间方案。每次讨论结束后，只把最终确认的规则合并到本文件，并在 `CHANGELOG.md` 增加一条变更记录。

当前流程不执行以下规则：

- 不做页面货号二次核验；
- 不要求页面货号与输入货号完全一致后才写入结果；
- 不把库存尺码映射到得物尺码；
- 不用库存尺码过滤得物购买弹层的尺码；
- 不把销量下限当作交付数据。

## 7. 自动化验收标准

每次运行结束或暂停前必须检查：

1. 输入文件已成功读取，动态基线和异常输入已记录；
2. 所有非异常唯一货号均生成了任务状态；
3. 当前 Root、Frida Server、得物版本、登录态和 `ProtocolProfile` 均通过运行前自检；
4. 搜索请求明确使用已经协议验收的销量降序参数，并选择服务端响应第一条；仅获取默认结果后在程序内部按销量排序不算通过；
5. 正式批量循环没有逐货号 UI 点击、输入、滚动或 UI XML 解析；
6. 每个已完成货号都有商品详情和尺码报价响应证据，分页已读取到服务端结束标记；
7. 得物页面显示的尺码没有被强行转换或用库存尺码替换；
8. 每个尺码的卖价与同刻页面对照确认的响应字段一致，无报价尺码没有被删除；
9. 总销量是商品级数据，并以页面显示原文写入；
10. Excel 只有规定的 6 列，不含任何已禁止字段；
11. 公式错误扫描为 0，抽查货号能够通过证据哈希回溯到本次运行的脱敏响应；
12. 出现限流、登录失效、Profile 不兼容、Schema 漂移或其他全局阻塞后，后续货号没有被伪造为已完成；
13. 本次运行产生的数量、状态和异常不会被写死到下一次运行或本总规划中。

## 8. 后续阶段边界

以下事项暂不纳入当前采集阶段：

1. 设计库存 US/UK 尺码到得物页面尺码的转换公式或人工映射表；
2. 将得物价格回填到原始库存明细；
3. 按库存尺码筛选、匹配或推断得物尺码；
4. 改变“销量降序后直接采集第一条”的当前流程；
5. 在没有新证据的情况下补写缺失价格、销量或商品名称。

待当前采集结果经过人工确认后，再单独讨论尺码转换和原始库存回填。转换方案不得改写当前阶段保存的得物显示尺码原文。

## 9. 可移植响应级采集器开发计划

本节定义正式产品化路线：第一版交付“跨电脑 Node.js CLI + 受控 Root Android Emulator + Frida Agent”，而不是继续扩展逐货号 UI 自动化，也不同时开发 Android 伴生 APK。采集器不得绑定当前电脑、用户名、SDK 绝对路径、当前 AVD 名称、设备 serial、分辨率或固定坐标。

现有非 Root AVD 使用 Android 15 `google_apis_playstore`、arm64-v8a、`user/release-keys` 镜像，`ro.debuggable=0`。为避免破坏现有得物安装和登录环境，保留该 AVD，不对它执行 Magisk Root；另建可脚本化重建的 Android 15 `google_apis` arm64 Root AVD。新环境由用户手动登录一次，不复制当前设备私有数据。

### 9.1 运行组件

1. `DewuCli`：统一命令入口，负责环境引导、自检、协议发现、库存任务、批量采集和导出。
2. `AvdBootstrap`：发现 Android SDK，安装或检查所需组件，创建/启动受控 AVD，执行 `adb root`，侧载用户提供的得物 APK splits，并部署 Frida Server。
3. `FridaAgent`：附加到 `com.shizhuang.duapp`，在 App 进程内调用其网络客户端、会话和签名能力，暴露稳定 RPC。
4. `ProtocolProfile`：按得物版本保存 Hook 点、请求模板、销量降序参数、响应 Schema、字段映射和兼容性断言。
5. `JobOrchestrator`：读取库存、建立动态基线、自适应并发、重试、断点恢复和全局阻塞停止。
6. `EvidenceStore`：按货号保存脱敏响应 fixture、解析结果、请求关联 ID、证据哈希和错误。
7. `ResultWriter`：把内部结果转换为第 5 节规定的 6 列 Excel。

正式运行时不需要 Appium、UiAutomator2 或 AccessibilityService。原有 ADB/UI 脚本保留为协议发现和人工对照工具，不得继续作为批量生产采集器。

### 9.2 统一命令接口

新增统一入口 `node scripts/dewu.mjs`，至少支持：

- `bootstrap --avd <name> --apk-dir <dir>`：检查 Android SDK Command-line Tools，创建/启动 Root AVD，安装得物 APK，下载并校验匹配架构的 Frida Server，推送到 `/data/local/tmp` 并完成进程枚举 smoke test。
- `doctor --device <serial>`：检查设备在线、Root、Frida、得物包和版本、登录态、网络及 Profile 兼容性。
- `discover --device <serial> --sku <sku>`：为少量人工 UI 操作捕获请求构造、签名调用、排序参数和响应字段，生成脱敏 fixture；不得用于全量采集。
- `collect --input <xlsx> --device <serial> [--only <sku,...>] [--category <name>] [--resume] [--max-concurrency 4]`：执行响应级批量采集。
- `export --run-id <id>`：从已落盘的内部结果生成严格 6 列 Excel。

设备只有一个且未显式传入 serial 时可以自动选择；存在多个在线设备时必须要求 `--device`。所有 ADB 和 Frida 操作都必须使用同一目标 serial。

### 9.3 Frida 与环境锁定

- 首个实现将 Frida 客户端和 Android Server 固定为同一版本 `17.16.4`，并在工具链 lock 中记录版本、下载资产名和 SHA-256；升级必须重新运行环境、Hook 和 fixture 回归测试。
- 当前得物 APK 架构为 arm64-v8a，首个完整模拟器验收以 Apple Silicon/arm64 为准。x86_64 主机只有在得物 APK 与模拟器 ABI 实测兼容后才承诺本地 Emulator；否则使用受控 ARM64 真机或远程 ARM64 Emulator。
- 得物 APK、账号数据、Cookie、Token 和签名秘密不得进入 Git 或安装包；APK 由用户从其合法安装实例导出或自行提供。
- 项目增加可安装的 Node 版本和依赖 lock；运行时不得依赖当前 Codex 专用 `node_modules`、当前用户目录或全局安装的脚本包。

### 9.4 Frida Agent RPC 与响应契约

Agent 至少暴露：

- `health()`：返回得物版本、进程、会话、Agent 和 Profile 状态，不返回会话秘密。
- `searchBySku(sku, sort = "sales_desc")`：使用 App 内部网络客户端发送货号搜索请求，并返回排序模式、候选商品和响应关联信息。
- `getProduct(productId)`：返回商品名称、商品级销量和商品响应关联信息。
- `getQuotes(productId)`：返回全部页面可显示尺码、实际卖价、无报价状态、variant/sku ID 和分页状态。

主机优先只传入业务参数，由 Agent 在 App 进程内完成请求构造、会话注入、设备参数和签名。RPC 返回原始业务响应与标准化结果，但在跨进程传输和落盘前必须移除鉴权秘密。若某版本无法独立调用签名器，则由 Agent 直接调用 App 内部完整网络请求方法，不回退到逐货号 UI。

### 9.5 运行数据结构

每条内部结果至少包含：

- 输入货号、商品 ID、商品名、搜索排名和确认过的销量排序参数；
- 商品级销量展示原文及其来源字段；
- 每个页面可显示尺码的原文、价格、无报价状态和 variant/sku ID；
- 得物版本、Profile 版本、采集时间、请求关联 ID 和证据哈希；
- 状态、重试次数、错误码和异常说明。

这些字段用于断点和审计，不扩大交付 Excel。价格、销量和可显示尺码的 JSON 路径必须存在于版本化 Profile 和脱敏 fixture 中；Profile 断言失败即全局阻塞，不允许静默返回空值或切换到其他疑似字段。

### 9.6 开发里程碑

1. **M0：环境引导**。安装 SDK Command-line Tools，保留当前 AVD，创建独立 Root AVD，部署同版本 Frida Server，侧载得物 5.95.1，并由用户手动登录一次。
2. **M1：协议发现**。使用鞋子、服装、配件样本关联搜索、销量排序、商品详情和尺码报价请求，生成脱敏 fixture 和 `ProtocolProfile 5.95.1-1101`。
3. **M2：进程内请求 Agent**。实现 `health`、`searchBySku`、`getProduct`、`getQuotes`，完成会话检查、响应关联、分页和版本守卫。
4. **M3：批量编排器**。接入动态库存、原子落盘、自适应 `1 → 2 → 4` 并发、断点恢复、全局阻塞和 6 列 Excel 导出；移除生产循环中的固定坐标、90 秒等待、UI 内部排序和逐尺码滚动。
5. **M4：可移植打包**。增加统一 CLI、Node/Frida/SDK lock、跨平台路径和安装说明；在第二台干净兼容电脑上重建环境并运行同一经批准测试集。
6. **M5：全量运行**。通过经批准测试集的准确性和性能验收后，对当次输入文件动态计算出的唯一货号执行可恢复全量采集。

### 9.7 测试与产品化验收

1. 脱敏 fixture 单元测试覆盖鞋子、服装、配件、无结果、无报价、特殊尺码、分页、字段缺失和 Schema 漂移。
2. 使用覆盖鞋子、服装、配件的经批准测试集，在同一登录态和短时间窗口内进行接口响应与得物 UI 对照；第一条商品、商品名、全部显示尺码、价格和销量原文必须一致。
3. 使用经批准测试集完成批量运行，正式循环中不得发生逐货号 UI 操作；抽查规模和通过阈值由对应 Issue 在不披露真实业务数量的前提下定义。
4. 会话准备完成后，未触发服务端限流时，性能目标由对应 Issue 针对经批准测试集定义，并与基准路径进行可复现比较。
5. 分别终止 CLI、得物进程和 Frida Server 后重启，已完成任务不得重复，未完成任务能够从断点继续。
6. 登录失效、429、验证码/风险响应、Frida 断连、得物版本变化和 Schema 漂移均必须保存状态并阻止错误扩散；不得绕过验证码或风控。
7. 在当前电脑和另一台干净兼容电脑上从环境引导开始完成同一经批准测试集；配置中不得出现当前用户名、固定 serial、固定 AVD 名称或 SDK 绝对路径。
8. 最终 Excel 仍严格遵守第 5 节的 6 列规范，公式错误为 0，每条已采集结果都能回溯到脱敏响应证据。

### 9.8 后续产品边界

Android 伴生 APK、普通非 Root 真机运行、公开应用商店分发、完整签名算法重写和无需得物 App 的独立 API 客户端都不属于第一版。只有在响应级 CLI 稳定完成全量采集后，才单独评估这些方向；任何后续形态都不得通过 AccessibilityService、Frida 或其他方式绕过验证码、风控、隐私或系统安全控制。

## 10. 模块化、多 Agent 与 GitHub 开发治理

项目使用 [Wmx-5Percent/dewu-price-check](https://github.com/Wmx-5Percent/dewu-price-check) 作为唯一远程开发仓库。GitHub Issues 是模块状态和依赖关系的唯一事实来源，Pull Request 是代码评审和合并的唯一入口，GitHub Actions 是自动化质量门禁。聊天记录、agent 本地说明或未推送分支不得替代 GitHub 状态。

### 10.1 强制多 Agent 边界

- 一个开发 agent 在本项目生命周期内只负责一个模块；模块编号、允许修改路径和验收标准必须在对应 Issue 中固定。
- 每个模块必须使用独立 Codex task/chat、独立 Git worktree、独立分支和独立 draft PR。禁止在本聊天窗口或任何单一聊天窗口内从 0 到 1 开发整个应用。
- 总协调 agent 只负责任务拆分、依赖检查、接口裁决、进度监控和合并顺序，不得替代模块 agent 编写完整实现。
- 模块 agent 不得修改其他模块的内部文件。需要跨模块变更时，先在 GitHub 建立接口变更 Issue，由 `MOD-00` 确认契约，再分别交回对应模块 agent 实现。
- 集成 agent 只允许编写组合层、适配器和端到端装配，不得把未完成的模块逻辑复制到集成层重新实现。
- QA agent 只负责测试、审查、CI 和验收，不承担任一生产模块的补写；发现问题必须退回模块 Issue/PR。
- 开发 agent 不得自行合并自己的 PR。每个 PR 至少需要 CI 通过和一个非作者审查；涉及协议、安全或证据脱敏的 PR 还必须经过 QA agent 审查。

### 10.2 模块清单与代码所有权

| 模块 | 单一职责 | 允许修改的主要范围 | 直接依赖 | 完成定义 |
| --- | --- | --- | --- | --- |
| `MOD-00 Foundation` | 仓库骨架、公共类型、JSON Schema、错误码、配置和 CLI 契约 | `package*.json`、`schemas/`、公共 contract、`.github/` | 无 | 契约测试、目录边界和 CI 基线通过 |
| `MOD-01 Environment` | Android SDK/AVD/ADB/Root/Frida Server 引导与 doctor | `src/environment/`、环境脚本 | `MOD-00` | 干净兼容电脑可创建 Root AVD 并通过 Frida smoke test |
| `MOD-02 Protocol Discovery` | Hook 点发现、请求关联、脱敏 fixture 和版本化 Profile | `src/discovery/`、`profiles/`、脱敏 fixtures | `MOD-00`、`MOD-01` | 生成 `5.95.1-1101` Profile，并完成三类别同刻对照 |
| `MOD-03 Frida Agent` | 进程内网络调用和 `health/searchBySku/getProduct/getQuotes` RPC | `agent/`、`src/frida/` | `MOD-00`、`MOD-01`、`MOD-02` | 四个 RPC、分页、会话与版本守卫契约测试通过 |
| `MOD-04 Jobs` | Excel 输入、动态基线、任务状态、自适应并发、重试和断点 | `src/jobs/` | `MOD-00` | 动态基线、恢复和并发状态机测试通过 |
| `MOD-05 Evidence` | 原子落盘、脱敏、证据哈希、运行日志和秘密扫描 | `src/evidence/` | `MOD-00` | 鉴权秘密不落盘，崩溃恢复和证据回溯测试通过 |
| `MOD-06 Export` | 严格 6 列 Excel 生成、公式错误和格式验收 | `src/export/` | `MOD-00` | 6 列契约、异常行和公式错误扫描通过 |
| `MOD-07 Integration` | 统一 `dewu` CLI、模块装配、数据流和端到端运行 | `src/cli/`、`src/integration/` | `MOD-03`、`MOD-04`、`MOD-05`、`MOD-06` | 经批准跨类别同刻对照和响应级运行通过 |
| `MOD-08 QA & Portability` | CI、契约/集成/故障测试、第二台电脑和发布验收 | `test/`、CI workflow、测试文档 | `MOD-01` 至 `MOD-07` | 全部门禁通过并输出可审计验收报告 |

任何模块需要新增共享接口时，只能先修改 `MOD-00` 管理的 Schema/contract 并发布新契约版本，依赖模块再据此更新。不得通过读取其他模块私有文件或复制内部实现形成隐式依赖。

### 10.3 开发 Waves 与依赖门

`G00` 是 `W0 / MOD-00 Foundation` 开始前的治理前置步骤：它只建立和审查治理基线，不启动任何生产模块，也不满足 `MOD-00` 的进入条件。

| Wave | 可并行模块 | 进入条件 | 退出条件 |
| --- | --- | --- | --- |
| `W0 / MOD-00 Foundation` | `MOD-00` | `G00` 治理基线完成且 master plan 已确认 | 仓库骨架、contract v1、Issue/PR 模板、CI 基线和依赖 lock 合并 |
| `W1 Parallel Foundations` | `MOD-01`、`MOD-04`、`MOD-05`、`MOD-06` | `MOD-00` 合并 | 四个模块分别通过离线单元/契约测试；不得等待协议逆向后才开始 |
| `W2 Protocol` | `MOD-02` | `MOD-01` Root/Frida smoke test 通过 | `5.95.1-1101` Profile、脱敏 fixture、三类别响应映射完成 |
| `W3 Agent RPC` | `MOD-03` | `MOD-02` Profile 合并 | 四个 RPC、分页、登录态和 Schema 守卫通过 fixture 与受控设备测试 |
| `W4 Integration` | `MOD-07` | `MOD-03`、`MOD-04`、`MOD-05`、`MOD-06` 全部合并 | 统一 CLI、经批准跨类别同刻准确性和端到端运行通过 |
| `W5 QA & Portability` | `MOD-08` | `MOD-07` 合并 | 故障注入、断点、性能、秘密扫描、第二台电脑重建全部通过 |
| `W6 Full Run` | 只执行已合并版本，不新增生产模块 | `MOD-08` 发布门通过 | 当次动态基线中的唯一货号完成或以可解释阻塞状态收口 |

关键路径为 `MOD-00 → MOD-01 → MOD-02 → MOD-03 → MOD-07 → MOD-08`。并行路径为 `MOD-00 → MOD-04/MOD-05/MOD-06 → MOD-07`。后续 Wave 不得仅因排期需要绕过依赖门；阻塞必须记录在 GitHub Issue 中。

### 10.4 已确认的工具链和软件依赖

- Node.js 固定使用 22.x，ESM `.mjs`/JavaScript 路线保持与现有代码一致；使用 `package-lock.json` 和 `npm ci`，禁止依赖全局 npm 包。
- 生产依赖固定为 `frida@17.16.4`、`exceljs@4.4.0`、`ajv@8.17.1`。HTTP、参数解析、并发调度、哈希、文件系统和测试优先使用 Node.js 内置 `fetch`、`util.parseArgs`、`crypto`、`fs` 和 `node:test`，不增加 Axios、Commander、P-limit 或第二套验证库。
- Android 工具链需要 Java 17、Android SDK Command-line Tools、Platform Tools/ADB、Android Emulator 和 `system-images;android-35;google_apis;arm64-v8a`。Frida Android Server 与 Node 客户端必须同为 `17.16.4`。
- 首个协议 Profile 依赖得物 `5.95.1 (versionCode 1101)`；版本升级视为协议变更，不得由 Dependabot 或自动任务替换。
- Excel 运行时不得依赖 `@oai/artifact-tool` 或当前 Codex 缓存路径；该工具只允许用于开发过程中的人工检查。
- GitHub Actions 对纯 Node 单元/契约测试使用 macOS、Ubuntu、Windows 矩阵；需要 Root AVD、得物登录或 Frida 的 live test 只允许在受控 self-hosted runner 上手动触发，不把账号、APK 或会话数据上传到 GitHub-hosted runner。
- Dependabot 每周检查 npm 和 GitHub Actions 依赖，只创建升级 PR，不自动合并；Frida、Android API 和得物 Profile 升级必须关联兼容性 Issue 和完整回归证据。

当前依赖审计结果：本机 Node.js 为 `v22.23.1`；`frida@17.16.4`、`exceljs@4.4.0`、`ajv@8.17.1` 均已确认存在于 npm，且前两者声明的 Node 版本范围包含 Node 22。当前电脑尚未安装 Java Runtime，Android SDK 也缺少 Command-line Tools，因此 Java 17、`sdkmanager` 和 `avdmanager` 是 `MOD-01` 必须先解决的显式环境依赖。

### 10.5 GitHub Issue、分支和 PR 协议

- 每个模块建立一个父 Issue，标题格式为 `[MOD-XX][Wn] 模块名`。Issue 正文必须包含：唯一 agent、允许路径、非目标、直接依赖、阻塞对象、接口版本、验收命令、交付证据和安全注意事项。
- 依赖统一写为 `Blocked by #<issue>` 和 `Unblocks #<issue>`；只有依赖 Issue 对应 PR 已合并，模块状态才可从 `blocked` 进入 `ready`。
- 分支格式为 `agent/mod-XX/<issue-number>-<slug>`；一个分支只能对应一个模块 Issue，一个 agent 只能拥有一个模块分支。
- PR 标题格式为 `[MOD-XX] <change>`，默认 draft，正文必须写 `Closes #<issue>`、契约版本、测试结果、未完成项和实际修改路径。
- 统一标签：`module:MOD-XX`、`wave:Wn`、`status:blocked|ready|in-progress|review|done`、`type:contract|feature|test|infra|security`。
- Agent 至少在开始、发生阻塞、提交 draft PR、CI 完成和准备合并时更新 Issue。状态评论固定包含 `Completed / Current / Blockers / Tests / Next`，禁止只在聊天窗口报告进度。
- 合并顺序必须遵循依赖图；优先 squash merge。主分支禁止直接开发和直接推送，任何紧急修复也必须有 Issue、分支、PR 和 CI。

### 10.6 GitHub 监控与发布门

- 总协调 agent 每轮开始读取所有 open Issues、draft/open PR、失败 Actions 和关键路径阻塞，再决定能启动哪些模块 agent；不得启动尚未满足依赖的 Wave。
- 监控摘要按 Wave 输出：完成模块、进行中模块、阻塞模块、下一可启动模块、失败门禁和最新集成基线 SHA。
- 必需检查至少包含：`contracts`、`unit`、`redaction`、`export-contract`、`integration-fixtures`、`dependency-audit`。Live AVD 检查以受控 runner 的具名结果附加到相关 PR。
- `MOD-07` 合并前必须确认所有上游模块已合并且 contract 版本一致；`MOD-08` 发布前必须确认经批准测试集的同刻对照、性能、故障恢复、秘密扫描和第二台电脑重建证据齐全。
- GitHub 仓库是公开仓库，因此真实库存表、原始响应、APK、账号信息、Cookie、Token、签名、设备标识和未脱敏日志一律不得提交。仓库只允许合成测试数据和经过复核的脱敏 fixture；CI 增加敏感文件路径与秘密模式扫描。

### 10.7 已建立的 GitHub 监控入口

| Wave/模块 | GitHub Issue | 初始状态 |
| --- | --- | --- |
| `W0 / MOD-00` | [#1 Foundation](https://github.com/Wmx-5Percent/dewu-price-check/issues/1) | `ready` |
| `W1 / MOD-01` | [#2 Environment](https://github.com/Wmx-5Percent/dewu-price-check/issues/2) | `blocked by #1` |
| `W1 / MOD-04` | [#3 Jobs](https://github.com/Wmx-5Percent/dewu-price-check/issues/3) | `blocked by #1` |
| `W1 / MOD-05` | [#4 Evidence](https://github.com/Wmx-5Percent/dewu-price-check/issues/4) | `blocked by #1` |
| `W1 / MOD-06` | [#5 Export](https://github.com/Wmx-5Percent/dewu-price-check/issues/5) | `blocked by #1` |
| `W2 / MOD-02` | [#6 Protocol Discovery](https://github.com/Wmx-5Percent/dewu-price-check/issues/6) | `blocked by #1, #2` |
| `W3 / MOD-03` | [#7 Frida Agent](https://github.com/Wmx-5Percent/dewu-price-check/issues/7) | `blocked by #1, #2, #6` |
| `W4 / MOD-07` | [#8 Integration](https://github.com/Wmx-5Percent/dewu-price-check/issues/8) | `blocked by #3, #4, #5, #7` |
| `W5 / MOD-08` | [#9 QA & Portability](https://github.com/Wmx-5Percent/dewu-price-check/issues/9) | `blocked by #2–#8` |
| `W6 / Full Run` | [#10 Full inventory run](https://github.com/Wmx-5Percent/dewu-price-check/issues/10) | `blocked by #9` |

GitHub 标签已经建立为 `module:*`、`wave:*`、`status:*` 和 `type:*` 四组。初始状态只允许 #1 为 `status:ready`；#2–#10 必须保持 `status:blocked`，直到其依赖 Issue 对应 PR 已合并并由总协调 agent 更新状态。

### 10.8 根级 AGENTS.md 与实现原则

仓库根目录使用 `AGENTS.md` 作为所有 Codex 开发、测试和审查任务的常驻项目约束。它必须引用本总规划而不是复制或替代本总规划，并把模块边界、Wave 依赖门、角色分离、数据安全、验收证据和代码审查红线转换成开工前可执行检查。需要模块特例时可以在更近目录增加 `AGENTS.md` 或 `AGENTS.override.md`，但不得放宽本节的数据安全、角色分离和发布门禁。

所有模块遵守以下实现原则：

1. 第一版发布前不做无证据的向后兼容；过时的内部实现直接删除，不叠加兼容层、双路径或静默 fallback。该规则绝不授权破坏真实库存、证据、断点、账号、App/设备数据或已发布契约；涉及持久数据和公开契约的变更必须有 Issue、备份、演练、验证和可逆回滚。
2. 选择满足当前 Issue 的最简单实现，不做预防性抽象、通用框架或只使用一次的配置层。
3. 先保持最小端到端链路可运行，再逐层增加能力；不得为未完成的复杂度拆掉已跑通链路。
4. 组件按单一职责和版本化公共契约协作，不读取其他模块私有文件，不复制其实现。
5. 优先使用成熟、持续维护的库和 Node.js 内置能力；没有可测量理由不得重写已解决的问题。
6. 新增依赖或工具前必须先检查 `package.json`、lockfile、已有 import、公共 contract 和现有测试。
7. 架构决策必须符合已确认的长期产品边界，不接受“先临时这样、以后再换”的平行生产路径；证据变化时通过 Issue/ADR 明确替换旧方案。
8. 设计协议、落盘格式、测试框架或安全机制前，先查阅一手文档和成熟产品的已验证模式，不从零发明。

共同准则是“写最少、但能够安全运行并通过当前验收的代码”。Git 历史负责代码回滚，显式状态备份负责数据回滚；不得用死代码、注释方案、重复工具或无条件 fallback 充当回滚机制。

### 10.9 初学者协作进度门

项目增加 `docs/development-progress/` 作为用户操作层的学习进度系统。它不取代 GitHub 的代码状态或本总规划，而是明确初学者在每个原子步骤应打开、复用或关闭哪个 Codex task/chat，该任务担任 Coordinator、Developer、QA、Reviewer、Integration 或 Run Operator 中的哪一个角色，以及该步骤的证据和强制停止点。

- 默认使用 `LEARNING_MODE`：一次只允许一个生产 Developer；Developer 停止后依次进行独立 QA、独立 Reviewer 和 Coordinator 合并检查。
- W1 的四个模块虽然在依赖图上允许并行，但初学者模式默认按 `MOD-01 → MOD-04 → MOD-05 → MOD-06` 串行体验完整流程。只有用户明确切换 `TEAM_MODE` 后才可增加并行度。
- 根目录 `AGENTS.md`、`docs/development-progress/CURRENT_STEP.md` 和当前 Wave 文件共同构成开工门。Agent 每次只能执行 `CURRENT_STEP.md` 指定的一个步骤，提交证据后必须停止。
- 只有用户可以验收原子步骤。Coordinator 可以建议下一步，但未经用户对具体步骤的明确批准，不得更新 `CURRENT_STEP.md`、`PROGRESS.md`、启动新角色或继续后续步骤。
- 修改文件、stage、commit、push、创建 draft PR、转为 ready、merge、删除分支/worktree、安装系统软件、修改设备和更改进度分别视为独立授权，不得由“继续”一次性推定。
- Coordinator 长期复用；每个模块 Developer、每次独立 QA 和每次独立 Reviewer 使用新的 task/chat。同一 PR 返工回到原 Developer，修复后旧 QA/Review 结论失效，必须使用新的 QA 和 Reviewer 任务重新验证。
- GitHub 实时状态与人工进度文件冲突时立即暂停，由 Coordinator 只读解释差异，不能静默修改任一事实来源。
