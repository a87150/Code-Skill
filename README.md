# Code-Skill

给 AI 编码 agent 用的工程判断规则。核心理念一句：**不发明需求，不写没有检查的实现。**

## 安装

常驻用法——把 `AGENTS.md` 放到 agent 每轮会读的位置：

```
~/.dsh/AGENTS.md        # DeepSeek Harness，全局生效
<项目根>/AGENTS.md       # 单项目生效，优先级高于全局
~/.claude/AGENTS.md     # Claude Code，全局生效
```

按需加载用法——把 skill 目录放到 skills 根：

```
~/.agents/skills/engineering-judgment/SKILL.md
```

两种方式内容相同，**不要同时启用**，否则同样的规则会被喂两遍。

## 使用

装好之后不需要额外操作，规则随上下文生效。想显式调用可以说一句"按工程判断规则来"。

判断是否生效：给它一个需求含糊的小功能，看它先问还是先猜；或者看它交付的代码里有没有需求没提过的功能。

## 文档

| 文件 | 内容 |
|---|---|
| [docs/DESIGN.md](docs/DESIGN.md) | 规则管什么、不管什么、设计取舍、已知失效点 |
| [docs/benchmark.md](docs/benchmark.md) | 三臂对照实验：18 个样本的完整数据、测量口径、五次结论修正 |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | 变更记录 |
| [docs/provenance.md](docs/provenance.md) | 每段规则的来源、上游许可证、哪些条款是自有 |

## 一句话

它不能让你比 ponytail 更省代码，换来的是更宽的行为约束。
