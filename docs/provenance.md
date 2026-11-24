# 来源与许可

本仓库是衍生作品。以下三个上游项目均为 MIT 许可，逐条标明本仓库用了什么、改了什么。

## ponytail

- 仓库：https://github.com/DietrichGebert/ponytail
- 作者：Dietrich Gebert
- 许可证：MIT
- 取用：7 级决策阶梯（原文几乎照搬）、"bug fix = root cause"的根因修复条款、"非平凡逻辑留一个可跑检查"、"用注释标注已知上限"的机制
- 改动：删去 "lazy senior developer" 人设与 "Boring over clever" 等不影响行为的态度描述；把注释前缀从 `// ceiling:` 固定为 `ponytail:` 以兼容其 `/ponytail-debt` 扫描器；"留检查"一条由"必须留"细化为按项目现状分档（有测试设施走 TDD，没有则 3–5 行断言）

## codingskills

- 仓库：https://github.com/JordanCoin/codingskills
- 作者：Jordan Coin Jackson
- 许可证：MIT
- 取用：`skills/yagni` 与 `skills/kiss` 的可数判据（"三次才抽象"、"开关注册未切换即删"、"抽象需 ≥2 个今日真实实现"）、YAGNI 的四条边界、YAGNI 与 DRY 冲突时的裁决规则
- 改动：未采用其 `solid`、`separation-of-concerns`、`law-of-demeter` 等条目——它们与"不为未请求的需求建抽象"存在张力，且无实测支撑；未采用其 `detect-stack`（会向项目写入 `.agents/stack-context.md`，且依赖 context7 MCP）

## superpowers

- 仓库：https://github.com/obra/superpowers
- 作者：obra
- 许可证：MIT
- 取用：`verification-before-completion` 的证据闸门（识别命令 → 完整执行 → 读输出与退出码 → 再声称）、`systematic-debugging` 的四阶段纪律（读完错误、稳定复现、查最近改动、单变量推进）
- 改动：压缩为常驻规则里的两节；完整方法论作为独立 skill 按需加载，不并入本仓库

## 本项目新增（非衍生）

以下条款来自对照实验的实测观察，在上述三个上游中都不存在：

1. **标准库缺位时的陷阱**——"标准库优先"与"不加依赖"在标准库无对应物时会反向逼出手写实现。实测：Node 无内置 CSV 解析，结果产出 59–125 行手写 RFC4180 状态机且零测试。
2. **不发明需求**——作为独立禁令列出，并给出常见越界项清单。
3. **"留检查"的项目分档**——用项目是否已有测试设施来决定走 TDD 还是 3–5 行断言，用来消解与 TDD 类规则的直接冲突。
4. **规则内部冲突消解记录**——见 README 与 docs/benchmark.md 中的修正记录。

## 许可证全文

```
MIT License

Copyright (c) 2026 a87150

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

上游三个项目的 MIT 条款与此相同，版权人分别为 Dietrich Gebert、Jordan Coin Jackson、obra。
