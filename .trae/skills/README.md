# Vendored Skills（项目级）

本目录是 `d:\无限世界大赛` 的项目级 skill 目录，Trae CN 会按工作区扫描 `.trae/skills/`，
因此这里的 skill 只对本项目生效。未写入任何用户级/全局 skill 目录，也未改动全局 git 配置。

每个 skill 目录保持上游原始结构（`SKILL.md` + 脚本/模板/参考文档），并随附上游 LICENSE
（`web-design-guidelines` 上游仓库未提供 LICENSE 文件，其 README 声明为 MIT）。

## 来源与版本

| 项目内目录 | 上游仓库 | 分支 | Commit | 上游路径 |
| --- | --- | --- | --- | --- |
| `brainstorming/` | https://github.com/obra/superpowers | main | `22f0b463e7a5e579904dd6211a520321035526f7` | `skills/brainstorming/` |
| `writing-plans/` | https://github.com/obra/superpowers | main | `22f0b463e7a5e579904dd6211a520321035526f7` | `skills/writing-plans/` |
| `subagent-driven-development/` | https://github.com/obra/superpowers | main | `22f0b463e7a5e579904dd6211a520321035526f7` | `skills/subagent-driven-development/` |
| `test-driven-development/` | https://github.com/obra/superpowers | main | `22f0b463e7a5e579904dd6211a520321035526f7` | `skills/test-driven-development/` |
| `requesting-code-review/` | https://github.com/obra/superpowers | main | `22f0b463e7a5e579904dd6211a520321035526f7` | `skills/requesting-code-review/` |
| `verification-before-completion/` | https://github.com/obra/superpowers | main | `22f0b463e7a5e579904dd6211a520321035526f7` | `skills/verification-before-completion/` |
| `game-engine/` | https://github.com/github/awesome-copilot | main | `797337f33f73e35d08d82f840e21c4b8c4932d88` | `skills/game-engine/` |
| `sprite-gen/` | https://github.com/aldegad/sprite-gen | main | `35a27e137bfd72440cc856b080913c66f69c772e` | 仓库根目录（SKILL.md 位于根） |
| `webapp-testing/` | https://github.com/anthropics/skills | main | `2c5958ecac7cee2b583967a2c4981d0f4a75c579` | `skills/webapp-testing/` |
| `web-design-guidelines/` | https://github.com/vercel-labs/agent-skills | main | `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` | `skills/web-design-guidelines/` |
| `grill-me/` | https://github.com/mattpocock/skills | main | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | `skills/productivity/grill-me/` |
| `grilling/` | https://github.com/mattpocock/skills | main | `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` | `skills/productivity/grilling/` |
| `frontend-design/` | https://github.com/anthropics/skills | main | `2c5958ecac7cee2b583967a2c4981d0f4a75c579` | `skills/frontend-design/` |
| `userinterface-wiki/` | https://github.com/raphaelsalaja/userinterface-wiki | main | `256a954080c8bcf1b1ceb1e2a4079d1f24cf593a` | `skills/`（上游 skill 目录整体，152 条规则） |
| `interaction-design/` | https://github.com/wshobson/agents | main | `4bde3168b43c0655c4d00ea2726e631719908a6d` | `plugins/ui-design/skills/interaction-design/` |
| `better-ui/` | https://github.com/jakubkrehel/skills | main | `157da62016338e8693dcff93d47154a9e36f2157` | `skills/better-ui/` |
| `wild-type/` | https://github.com/arla6ka/design.how | main | `419fa5af1721eebfab9e0062a630de36ffd0b342` | `vault/wild-type/skill/`（见下方结构说明） |
| `warp-type/` | https://github.com/arla6ka/design.how | main | `419fa5af1721eebfab9e0062a630de36ffd0b342` | `vault/warp-type/skill/`（见下方结构说明） |
| `word-stickers/` | https://github.com/arla6ka/design.how | main | `419fa5af1721eebfab9e0062a630de36ffd0b342` | `vault/word-stickers/skill/`（见下方结构说明） |
| `word-carousel/` | https://github.com/arla6ka/design.how | main | `419fa5af1721eebfab9e0062a630de36ffd0b342` | `vault/word-carousel/skill/`（见下方结构说明） |
| `improve-animations/` | https://github.com/emilkowalski/skills | main | `c8a79627b59d72d764d6ab6f2c87c09a48169833` | `skills/improve-animations/` |

以上 2026-11-08 新增的 9 个 UI/视觉类 skill 来自 ui-skills.com 目录
（https://www.ui-skills.com/ ）收录的上游仓库，均聚焦游戏/前端界面视觉：
`frontend-design`（反 AI 味的整体视觉设计）、`userinterface-wiki`（152 条动画/CSS/
排版/UX 审查规则）、`interaction-design`（微交互与动效）、`better-ui`（视觉细节打磨）、
arla6ka 四个 Canvas 2D 动态字体 skill（标题界面/动态文字）、`improve-animations`
（动效审计与改进计划，只读不改码）。原始目录结构与完整仓库快照（含 vault 顶层
README）保存在 `.vendor-src/` 对应目录；下载当日本机 git 协议被网络阻断，改用
codeload.github.com tarball + GitHub API 校验 commit SHA 完成，快照与上表 SHA 一致。

`grill-me` 是用户入口（`disable-model-invocation: true`，只做转发），实际逻辑在 `grilling`
skill 中，因此两个目录必须同时存在。上游 MIT LICENSE 已随目录附上。

为什么采用 vendoring（直接落到项目 skill 目录）：Trae CN 的项目级作用域是工作区
`.trae/skills/` 与 `.trae/plugins/`；其中 `.trae/plugins/` 只接受插件包（`.trae-plugin/plugin.json`
或 `.claude-plugin/plugin.json` 清单）。上述 5 个上游仓库都不是 Trae/Claude 插件包，
直接散装复制它们的 skill 目录到 `.trae/skills/` 是官方支持的项目级 skill 形态，
无需全局 marketplace 或用户级配置即可生效。

## sprite-gen 的结构说明

上游仓库本身以仓库根目录作为 skill 目录，因此这里保留 `SKILL.md`、`sprite_gen/`（Python 包）、
`scripts/`（22 个 CLI 包装脚本）、`docs/`、`tests/`、`pyproject.toml`、`LICENSE`、`NOTICE`。
为控制仓库体积，未复制 `docs/assets/` 下的演示 GIF（约 45 MB，纯文档配图，不影响任何命令）；
VCS/CI 配置（`.git/`、`.github/`、`.githooks/`）也未复制。

## 依赖（全部在项目内）

- Python：项目根 `.venv`，依赖声明见根目录 `requirements.txt`，安装脚本 `tools/setup-skills-env.ps1`。
- Playwright 浏览器：下载到项目内 `.playwright-browsers/`（已被 `.gitignore` 排除），
  通过环境变量 `PLAYWRIGHT_BROWSERS_PATH` 指向该目录；安装脚本会把该变量写入 `.venv` 的激活脚本。
- 无 Node 依赖：上述 skill 均不需要 npm 包（superpowers 本身零依赖，game-engine 只提供模板/文档）。

### 安装 / 复现

```powershell
# 在项目根目录执行
powershell -ExecutionPolicy Bypass -File .\tools\setup-skills-env.ps1
```

`sprite-gen` 的 `codex`、`ffmpeg`、`img2webp`、`rife-ncnn-vulkan` 是其生成/视频流程的外部可执行文件，
按"不装全局"的约束本次未安装；仅 Python 包与 Playwright 浏览器已就位。

## arla6ka 四个 skill 的结构说明

上游 `arla6ka/design.how` 中每个效果位于 `vault/<效果名>/`，实际 skill 定义在其
`skill/` 子目录（`SKILL.md`、`assets/template/`、`references/`、`scripts/`），
`vault/<效果名>/README.md` 为效果演示说明。为满足 Trae 对
`.trae/skills/<名称>/SKILL.md` 的扫描要求，`.trae/skills/` 下取 `skill/` 子目录
内容作为 skill 根；完整原始结构（含顶层 README）保留在
`.vendor-src/arla6ka-design-how/vault/`。四个 skill 的模板为 TypeScript/tsx
参考实现，游戏内直接以原生 Canvas 2D 重写即可，无任何运行时 npm 依赖。

## 使用

Trae CN 启动工作区时会扫描 `.trae/skills/`，skill 名称取自 `SKILL.md` frontmatter 的 `name`
（与本目录名一致）。新增会话后即可直接按名称触发，例如 `brainstorming`、`game-engine`、
`webapp-testing`。
