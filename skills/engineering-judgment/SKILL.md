---
name: engineering-judgment
description: Use on any coding task: writing, adding, refactoring, fixing, reviewing, or choosing dependencies. Gives a 7-rung ladder (needs to exist, reuse, stdlib, native feature, installed dep, one line, minimal code), a plan format that records the decisions an outsider cannot guess, countable criteria instead of adjectives (three-strikes abstraction, un-toggled flags, at least two real implementations today), non-negotiable floors (known failure modes, a runnable check), a debug discipline (root cause before any fix), review reception that verifies before agreeing, and an evidence gate (no completion claim without a fresh run in the same turn). Measured against a no-rules baseline on the same task: 7-12x less code and 9 of 10 invented requirements eliminated, with crash safety unchanged.
---

# 工程判断规则

## 写代码前，按顺序停在第一个人站得住的台阶

1. 这功能需要存在吗？不需要就说清为什么不做。
2. 仓库里已有实现或模式？复用。
3. 语言标准库直接有？用。
4. 平台原生能力覆盖？用。
5. 已装的依赖能解决？用。
6. 能写成一行？一行。
7. 都不成立，才写最小实现。

先读懂需求和调用链再爬阶梯。不理解问题就选最小 diff，那是第二个 bug。

## 多步任务先给计划

改 3 个以上文件、或跨会话才能完成时，先出计划。

计划必须写清这些决定：建或改哪些文件、各自职责、关键函数名与签名、规格里的具体值、每个任务由哪个测试证明。

一步 = 一个动作 + 可检验结果（"完成后端"不算步骤，"写出会失败的测试"算）。
任务按"能否被独立否掉"切分，一个任务一个交付物加它自己的测试。

2 个以上互不依赖、无共享状态的任务并行做，各自划分不同产出目录——写冲突的并行等于没并行。

## 判据：可数、可验，不用形容词

- 第一次重复直接写，第二次记下，第三次才抽抽象。
- 开关从未切过、配置从未改过、参数从未传过非默认值 → 删。
- 抽象需 ≥2 个今天的真实实现，否则不建接口。
- 测出性能问题之前不加缓存。
- 为"以后可能需要"加的列、表、扩展点、事件总线 → 不建。
- 两个 stdlib 写法一样长时，选边界正确的那个。

## 不可协商的下限

- 已知失败模式必须处理：无效输入、网络失败、写盘失败、空值、边界索引。来源不可控的数据（第三方导出、用户上传）尤其如此。
- 非平凡逻辑留一个能跑的检查。项目已有测试设施（test script / pytest / 已有 test 目录）→ 走 TDD；没有 → 3–5 行断言或自检脚本，不引入框架和 fixture。标准：删掉这个检查，有人能改坏这段逻辑还全绿，就是没留。
- 修 bug 打根因：grep 出该函数所有调用方，一次改共享函数。只修报告点名的那条路径，等于留同源的第二个 bug。
- 安全、可访问性、会丢数据的错误处理，不参与偷懒权衡。

## 声称任何状态之前，先拿到本轮证据

不能复述上一轮的输出。跑完完整命令，读输出、退出码、失败数，支持才说。

禁用措辞：应该能过、大概没问题、看起来正常、上次跑过了、只跑了一部分。
agent 报告成功不是证据——查 diff、跑测试、再转述。

交付前拿需求逐条对：规格里每一条，是哪行代码、哪个测试满足的。

## 调 bug

没做完根因调查不提修复方案。读完错误与堆栈；先稳定复现，复现不了去收数据不要猜；查 `git diff` 和最近改动；一次只改一个变量。

越觉得"很简单""只有一处要改""要立刻修好"，越要走这套。

## 收到批评：先验证再改

读完 → 用自己的话复述 → 对照代码库核实 → 判断是否成立 → 回应 → 逐条改逐条验。

不说"你说得完全对""好点子""我马上改"——那是核实前就投降。不成立就用技术理由反驳。
有读不懂的停下来一次问全，不要边改边问：条目通常互相关联，部分理解等于做错。

## YAGNI 的边界

- 不等于忽略架构：按职责切文件和模块不算投机；需要 ≥2 个实现的才叫接口。
- 不等于跳过错误处理：已知会发生的失败不是投机。
- 不等于拒绝零成本扩展：用 map 代替 switch，做。
- 与 DRY 冲突时 YAGNI 优先：两个相似函数好过统一到错的抽象下。

## 标准库缺位时

"标准库优先"+"不加依赖"在标准库无对应物时会逼出手写实现，且通常无测试（实测：Node 无内置 CSV 解析 → 59–125 行手写 RFC4180 状态机，需求没提，零测试）。

1. 真的需要完整解析吗？单分隔符、无引号字段，`split` 就够。
2. 真需要就用依赖，这时"不加依赖"让位。
3. 手写的解析器必须有测试。

## 不做

- 不发明需求。需求没写的格式、参数、编码，一律不做。
- 不为没出现的需求建抽象、配置项、插件系统、接口层。
- 不写没人要的文档、类型体操，不为简单事实套封装。

## 已知取舍用 `ponytail:` 标注

砍掉真实角落（全局锁、O(n²)、启发式猜断）时，用 `ponytail:` 前缀注释写清上限和升级路径。写成别的前缀 `/ponytail-debt` 扫不到。

## 优先级与冲突裁决

仓库自带的 `AGENTS.md`、会话规则、用户直接要求都覆盖本文件。
加载的 skill 只提供做法细节，与本文冲突以本文为准；用户明确要求按某个 skill 完整流程走时例外。
