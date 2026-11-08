# 《天台夜班》双人实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 两名开发者通过 GitHub 并行完成一个符合 SAVE_STATE v3、270 秒内可通关的纯鼠标天台便利店解谜关卡。

**Architecture:** 采用 A 轨 ZIP、原生 HTML/CSS/JavaScript ES Modules、DOM/SVG 与 CSS 动画。纯逻辑和场景渲染分离；A 的营业区模块与 B 的仓库模块只通过冻结的挂载接口通信，避免双人修改同一文件。

**Tech Stack:** HTML5、CSS3、JavaScript（无运行时框架）、Node.js 22 `node:test`、项目 `.venv` 内 Python Playwright、官方 `shared/save-protocol.js`。

**Spec:** [《天台夜班》设计文档](../specs/2026-11-08-rooftop-night-shift-design.md)

## Global Constraints

- 所有依赖、Python 虚拟环境、Playwright 浏览器、配置和缓存只放项目目录；禁止全局安装和修改用户级配置。
- 正常完整路线 ≤270 秒，前 5 秒安全；不设置死亡和误操作扣血。
- 零外部装备可通关；理智遗物只跳过调频，不消耗、不赋予科技功能。
- 本关不新增跨关道具：`global-items.json` 必须为空声明，成功传 `acquiredItemIds: []`。
- A 轨使用 `WL.readSave()` / `WL.completeLevel()` / `WL.failLevel()`；不得混用 B 轨接口。
- 禁止 `alert()`、`confirm()`、顶层跳转、商业素材、第四面墙台词和自行指定下一关地址。
- `game/` 是投稿运行目录；最终 ZIP 只打包其运行产物，不带测试、交付包、`node_modules`、`.git`、密钥或源素材工程。
- 两人不得直接推 `master`，不得强推，不得修改对方所有文件；接口变更必须由 A 在独立 PR 中先修改契约并通知 B。

## Review Focus

1. **延迟或更新存档**：`iw-save-ready` / `iw-admin` 到达后必须使用新存档，不能保留默认角色；由 Task 6 和 Task 7 的接档测试覆盖。
2. **异常扫码顺序**：任意顺序、重复扫码、未扫码先放胶囊都不能产生错误密码或消耗物品；由 Task 2 的逻辑测试覆盖。
3. **错误装配与重置**：错误导管、错误组件、单项调频锁定和局部重置不能清空其他进度；由 Task 3 的逻辑测试覆盖。
4. **遗物 ID 缺失或未配置**：空背包、其他理智道具、待替换 ID 都不能误触发捷径；由 Task 3、Task 6 和 Task 7 的发布检查覆盖。
5. **重复结束请求与超时路线**：连续点击启动/放弃只能提交一次；实际完整路线必须 ≤270 秒；由 Task 6 的结束锁测试和 Task 7 的浏览器/实跑测试覆盖。

---

## 1. 文件结构与所有权

Task 1 由 A 创建全部基线占位文件。基线合并后，B 才替换自己的占位模块；此后严格按下表执行。

| 文件或目录 | 负责人 | 职责 |
| --- | --- | --- |
| `package.json` | A | Node 22 声明和测试脚本，无运行依赖 |
| `game/index.html` | A | 唯一页面入口、场景容器、共享 UI |
| `game/css/base.css` | A | 布局、物品栏、图纸、菜单、通用近景 |
| `game/css/store.css` | A | 营业区和接待/仓库锁样式 |
| `game/js/main.js` | A | 存档采用、场景切换、提示计时、结束锁 |
| `game/js/contracts.js` | A，冻结 | JSDoc 类型、场景接口、声音 ID |
| `game/js/hints.js` | A | 纯提示档位计算 |
| `game/js/store-logic.js` | A | 商品、扫码、小票密码、咖啡和仓库锁 |
| `game/js/store-scene.js` | A | 营业区渲染和交互 |
| `game/js/handoff.js` | A | 遗物检测、成功/失败交接、结束语文案 |
| `game/shared/save-protocol.js` | A | 从官方交付包原样复制，禁止修改 |
| `game/assets/store/**` | A | 营业区、客人、商品素材 |
| `game/assets/shared/**` | A | 图纸、硬币等跨场景素材 |
| `game/css/warehouse.css` | B | 仓库、装配、调频、传送门样式 |
| `game/js/warehouse-logic.js` | B | 组件、导管、调频和启动状态 |
| `game/js/warehouse-scene.js` | B | 仓库渲染和交互 |
| `game/js/audio.js` | B | 音频解锁、环境音和音效管理 |
| `game/assets/warehouse/**` | B | 仓库、组件、导管、传送门素材 |
| `game/assets/audio/**` | B | 原创或合规音频 |
| `tests/hints.test.mjs`、`tests/store-*.test.mjs`、`tests/handoff.test.mjs` | A | A 的纯逻辑测试 |
| `tests/browser_harness.py`、`tests/store_browser.py`、`tests/fixtures/store.html`、`tests/e2e.py` | A | 浏览器基座、营业区和全流程测试 |
| `tests/warehouse-*.test.mjs`、`tests/warehouse_browser.py`、`tests/fixtures/warehouse.html` | B | B 的逻辑和场景测试 |
| `global-items.json`、最终 `NOTICE.md`、`docs/完整流程自测记录.md` | A | 空声明、素材归属汇总、完整自测 |
| `tools/check-game.mjs` | A | 扫描自有 HTML/JS 的禁用 API 和待替换 ID，不修改官方协议库 |

B 不直接编辑 `NOTICE.md`，在自己的 PR 描述中列出素材来源、许可证或 AIGC 工具，由 A 汇总。

## 2. 冻结接口

### 2.1 通用场景接口

`game/js/contracts.js` 定义 JSDoc：

```text
SceneApi {
  getHintLevel(): 0 | 1 | 2 | 3
  registerInteraction(): void
  playSound(id: SoundId): void
}
```

声音 ID 固定为：

```text
ui.click
store.scan, store.coffee, store.receipt, store.lock, store.unlock
warehouse.place, warehouse.cable, warehouse.dial, warehouse.portal
```

新增或改名必须由 A 先修改 `contracts.js` 并合并，B 不得在自己的功能分支顺带修改。

### 2.2 营业区挂载接口

```text
mountStoreScene(container: HTMLElement, api: SceneApi & {
  exitHook: string,
  enterWarehouse(): void
}): {
  destroy(): void,
  updateContext(context: { exitHook: string }): void
}
```

`enterWarehouse()` 只有在 `tryWarehouseCode()` 成功后由 A 主控调用；仓库模块不读取营业区内部状态。`updateContext` 只更新承接文案，不重建场景或清除接待进度。

### 2.3 仓库挂载接口

```text
mountWarehouseScene(container: HTMLElement, api: SceneApi & {
  hasSanityRelic: boolean,
  completeLevel(): void
}): {
  destroy(): void,
  updateContext(context: { hasSanityRelic: boolean }): void
}
```

仓库只接收布尔值，不读取背包，不调用官方交接 API；`completeLevel()` 由 A 主控防重复并交档。`updateContext` 调用仓库逻辑的 `setSanityRelic`，保留组件、导管和已有调频进度，不重新挂载场景。

### 2.4 音频接口

```text
createAudioManager(): {
  unlock(): Promise<void>,
  play(id: SoundId): void,
  startAmbience(): void,
  stopAmbience(): void,
  destroy(): void
}
```

首次指针操作后由 `main.js` 调用 `unlock()`。解锁前 `play()` 必须安全无异常；任何谜题不得依赖声音是否播放成功。

### 2.5 提示接口

```text
getHintLevel(elapsedMs: number): 0 | 1 | 2 | 3
```

阈值为 `0–19999 / 20000–44999 / 45000–74999 / ≥75000`。每次有效交互由场景调用 `registerInteraction()`，A 主控重置本阶段计时。

## 3. GitHub 双人协作流程

### 3.1 两台电脑初始化

两人各自执行，GitHub 仓库地址替换为实际地址：

```powershell
git clone <GITHUB_REPO_URL>
git pull --ff-only origin master
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$env:PLAYWRIGHT_BROWSERS_PATH="$PWD\.playwright-browsers"
.\.venv\Scripts\python.exe -m playwright install chromium
node --version
```

Node 必须为 22 或更新版本。Python 包装进 `.venv`，浏览器装进 `.playwright-browsers`，均不得改到用户级目录。

### 3.2 分支和合并顺序

1. A：`chore/game-skeleton`，只完成 Task 1，B 审查后通过 GitHub PR 合并。
2. 两人执行 `git pull --ff-only origin master`，取得相同基线。
3. A：`feat/store-and-handoff`，完成 Tasks 2、4、6。
4. B：`feat/warehouse-and-audio`，完成 Tasks 3、5。
5. B 的 PR 由 A 审查并先合并；A 再同步 `master`，运行接口检查，A 的功能 PR 由 B 审查后合并。
6. A 从最新 `master` 建 `test/full-flow` 完成 Task 7；B 做独立通关复核和 PR 审查。

功能文件没有交集，不应出现代码冲突。若确需修改对方文件，先在 PR/Issue 写明原因，由文件所有者提交；不得通过强推或整文件覆盖解决。

### 3.3 提交纪律

- 每个 Task 至少一个独立提交，提交前只 `git add` 本任务明确列出的文件。
- 提交信息沿用中文祈使式，例如 `feat: 实现小票动态仓库密码`。
- 推送前先运行本 Task 测试，再 `git pull --ff-only origin master`；分支需要同步时使用普通 merge，不强推、不 reset hard。
- PR 必须包含：变更文件、测试结果、素材来源、是否影响接口、对方需要复测的内容。
- 双方都不得在 `master` 直接开发，不得把 `.venv`、`.playwright-browsers`、`dist` 或截图缓存提交到仓库。

---

### Task 1: A 建立可运行基线与冻结契约（必须先单独合并）

**Files:**
- Create: `package.json`、`game/index.html`、`game/css/base.css`
- Create: `game/js/main.js`、`game/js/contracts.js`、`game/js/hints.js`
- Create placeholder: `game/js/store-scene.js`、`game/js/warehouse-scene.js`、`game/js/audio.js`
- Copy unchanged: `participant-delivery-kit-v3.3.2/shared/save-protocol.js` → `game/shared/save-protocol.js`
- Test: `tests/hints.test.mjs`
- Create shared test base: `tests/browser_harness.py`

**Interfaces:**
- Produces: 第 2 节全部接口；B 后续只依赖这些接口，不读取 A 的内部变量。

- [ ] **Step 1: 写提示阈值失败测试**

断言 `getHintLevel(19999) === 0`、`20000 === 1`、`45000 === 2`、`75000 === 3`，并拒绝负数和非法输入。

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/hints.test.mjs`  
Expected: FAIL，提示模块尚不存在。

- [ ] **Step 3: 实现基线和提示函数**

建立场景容器、物品栏、图纸入口和菜单容器；主控能够在营业区/仓库占位模块之间切换。`browser_harness.py` 只提供本地 HTTP 服务与 Chromium 启停，供 Tasks 4、5、7 共同使用，保证 B 的分支可独立测试。`package.json` 声明 Node `>=22`、`type: module`，脚本 `test` 为 `node --test tests/*.test.mjs`，不添加 npm 依赖。

- [ ] **Step 4: 验证基线**

Run: `npm test`  
Expected: 提示测试 PASS。

Run: `py -m http.server 8080 --directory game`，访问 `http://localhost:8080/`。  
Expected: 页面无 404，两个占位场景可切换，无原生弹窗。

- [ ] **Step 5: 提交基线 PR**

Commit: `chore: 建立游戏壳层与双人模块契约`。  
Gate: B 审查接口，GitHub 合并后双方再开始并行任务。

### Task 2: A 实现营业区纯逻辑（与 B 的 Task 3 并行）

**Files:**
- Create: `game/js/store-logic.js`
- Test: `tests/store-logic.test.mjs`

**Interfaces:**
- Produces: `PRODUCTS`、`createStoreState()`、`scanProduct(state, id)`、`prepareCoffee(state)`、`serveCoffee(state)`、`getWarehouseCode(state)`、`tryWarehouseCode(state, code)`。
- 除 `getWarehouseCode` 外，操作函数返回 `boolean` 表示是否接受；状态只由本模块修改。

- [ ] **Step 1: 写动态密码和防误操作失败测试**

至少固定以下断言：

```javascript
scanProduct(state, "battery");
scanProduct(state, "onigiri");
scanProduct(state, "coffee_capsule");
assert.equal(getWarehouseCode(state), "864");
assert.equal(scanProduct(state, "battery"), false);
assert.equal(tryWarehouseCode(state, "123"), false);
assert.equal(tryWarehouseCode(state, "864"), true);
```

另测：胶囊未扫码时 `prepareCoffee` 为 false；咖啡未准备好或商品未扫完时 `serveCoffee` 为 false；成功服务后 `blueprintReceived === true`。

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/store-logic.test.mjs`  
Expected: FAIL，模块尚不存在。

- [ ] **Step 3: 实现最小营业区逻辑**

固定商品价格 6/4/8，按扫码顺序生成三位密码；重复和未知商品返回 false，错误密码只返回 false，不修改已服务内容。

- [ ] **Step 4: 运行全部逻辑测试**

Run: `npm test`  
Expected: 全部 PASS。

- [ ] **Step 5: 提交**

Commit: `feat: 实现接待流程与小票动态密码`。

### Task 3: B 实现仓库纯逻辑（与 A 的 Task 2 并行）

**Files:**
- Create: `game/js/warehouse-logic.js`
- Test: `tests/warehouse-logic.test.mjs`

**Interfaces:**
- Produces: `createWarehouseState({hasSanityRelic})`、`setSanityRelic(state, value)`、`placePart(state, partId, slotId)`、`connectCable(state, from, to)`、`adjustDial(state, dialId, value)`、`resetWiring(state)`、`resetDials(state)`、`canStartPortal(state)`、`startPortal(state)`。
- 操作函数返回 `boolean`；`setSanityRelic` 返回 void 且保留装配进度；`startPortal` 只在 `canStartPortal` 为 true 时成功。

- [ ] **Step 1: 写装配、导管和遗物分支失败测试**

固定目标档位：`amplitude=2`、`frequency=3`、`phase=1`，每档允许整数 `0–4`。固定正确导管：`energy→stabilizer`、`stabilizer→focus`、`focus→frame`。

断言：无遗物且未完成调频不能启动；有遗物时完成组件和导管即可启动；错误组件/导管返回 false 且不清除正确进度；调对单项后锁定；局部重置只影响对应系统；挂载后切换 `setSanityRelic` 不丢失组件、导管和已锁定旋钮。

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/warehouse-logic.test.mjs`  
Expected: FAIL，模块尚不存在。

- [ ] **Step 3: 实现最小仓库逻辑**

组件允许任意安装顺序但槽位必须匹配；导管只接受三条有向连接。遗物只参与 `canStartPortal` 的校准判断，不写入物品或官方存档。`setSanityRelic` 只更新校准资格，已完成的组件、导管和旋钮状态保持不变。

- [ ] **Step 4: 运行全部逻辑测试**

Run: `npm test`  
Expected: A 与 B 已存在的测试全部 PASS；不得修改 A 的测试来适配自己。

- [ ] **Step 5: 提交**

Commit: `feat: 实现传送门装配与双路线校准`。

### Task 4: A 实现营业区场景与素材（与 B 的 Task 5 并行）

**Files:**
- Modify: `game/js/store-scene.js`、`game/css/store.css`、`game/index.html`
- Create: `game/assets/store/**`、`game/assets/shared/**`
- Test: `tests/fixtures/store.html`、`tests/store_browser.py`
- Consumes shared test base: `tests/browser_harness.py`（Task 1 已提供，本任务不修改）

**Interfaces:**
- Consumes: Task 2 的营业区逻辑和第 2 节场景接口。
- Produces: 页面中稳定使用的 `data-action` / `data-testid` 属性，供 Task 7 全流程测试复用。

- [ ] **Step 1: 写营业区浏览器失败测试**

用 Playwright 挂载独立营业区 fixture：依次扫码、制作并交付咖啡、查看小票和图纸、按动态小票推导密码并解锁；断言 `enterWarehouse` 只调用一次。另测点击替代拖放、重复扫码和错误密码。

- [ ] **Step 2: 运行浏览器测试确认失败**

Run: `$env:PLAYWRIGHT_BROWSERS_PATH="$PWD\.playwright-browsers"; .\.venv\Scripts\python.exe tests\store_browser.py`  
Expected: FAIL，场景尚未实现。

- [ ] **Step 3: 实现营业区交互和视觉**

完成柜台、货架、咖啡机、仓库门、小票/价签/图纸近景；所有关键物品提供 `data-action`，拖放和点击路径调用同一逻辑函数。按 16:9 固定构图，保证价签和三位密码在大屏可读。

- [ ] **Step 4: 验证场景和回归测试**

Run: 上一步浏览器测试及 `npm test`。  
Expected: 全部 PASS；无 404、控制台错误、原生弹窗和键盘依赖。

- [ ] **Step 5: 提交**

Commit: `feat: 完成天台便利店接待与仓库解锁场景`。

### Task 5: B 实现仓库场景、传送门表现与音频（与 A 的 Task 4 并行）

**Files:**
- Modify: `game/js/warehouse-scene.js`、`game/css/warehouse.css`、`game/js/audio.js`
- Create: `game/assets/warehouse/**`、`game/assets/audio/**`
- Test: `tests/fixtures/warehouse.html`、`tests/warehouse_browser.py`

**Interfaces:**
- Consumes: Task 3 仓库逻辑、冻结的 `SceneApi` 和音频 ID。
- Produces: 装配/调频/启动控件的稳定 `data-action` / `data-testid`，供 Task 7 使用。

- [ ] **Step 1: 写仓库浏览器失败测试**

分别用 `hasSanityRelic=false/true` 挂载。无遗物路线完成组件、导管和三个旋钮后启动；有遗物路线不出现手动旋钮且不能插入/消耗遗物。测试错误连接、局部重置、点击替代拖放、挂载后 `updateContext` 不丢进度，以及音频未解锁时不抛异常。

- [ ] **Step 2: 运行浏览器测试确认失败**

Run: `$env:PLAYWRIGHT_BROWSERS_PATH="$PWD\.playwright-browsers"; .\.venv\Scripts\python.exe tests\warehouse_browser.py`  
Expected: FAIL，仓库场景尚未实现。

- [ ] **Step 3: 实现仓库与音频**

使用 DOM/SVG 绘制组件轮廓、导管、目标/当前波形和传送门；音频管理器实现冻结接口，首次交互解锁，环境音可随时停止。所有声音线索同步提供视觉反馈。

- [ ] **Step 4: 验证场景和回归测试**

Run: 上一步浏览器测试及 `npm test`。  
Expected: 全部 PASS；无 404、控制台错误、自动播放异常或必须听力才能完成的步骤。

- [ ] **Step 5: 提交并先合并 B 的 PR**

Commit: `feat: 完成仓库造门、调频与视听表现`。  
PR 描述列出全部素材来源；A 审查接口未变后合并。

### Task 6: A 完成存档、交接、提示主控与空声明

**Files:**
- Create: `game/js/handoff.js`、`tests/handoff.test.mjs`
- Modify: `game/js/main.js`、`game/index.html`
- Modify: `global-items.json`

**Interfaces:**
- Produces: `SANITY_RELIC_ID`、`EXIT_HOOK`、`hasSanityRelic(save, relicId)`、`completeWithHandoff(save, wl, config)`、`failWithHandoff(save, wl, config)`。
- `main.js` 提供第 2 节场景 API，维护 `ended` 结束锁；iframe 首份有效存档到达后才挂载，后续存档事件调用 `updateContext`，不重挂载场景。

- [ ] **Step 1: 写交接失败测试**

使用显式测试 ID `test_sanity_relic`，断言：空背包 false、不同 ID false、真实匹配 true；成功调用只含 `acquiredItemIds: []` 和指定 `exitHook`，传入配置也携带同一结束语；失败原因固定；主控结束锁使重复成功/失败只提交一次。

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/handoff.test.mjs`  
Expected: FAIL，交接模块尚未实现。

- [ ] **Step 3: 实现存档采用与交接**

监听 `iw-save-ready` 和 `iw-admin`，以事件中的新存档更新实际引用。iframe 中在首份 `iw-save-ready` 前只显示接档状态；独立打开时使用同步 `WL.readSave()`。场景挂载后的事件通过 `updateContext` 同步，保留当前进度。设置 `SANITY_RELIC_ID = "PENDING_UPSTREAM_SANITY_RELIC_ID"`；该值保持待替换或为空时 `hasSanityRelic` 必须返回 false，游戏按无遗物路线正常运行并可直接发布，取得真实 ID 后替换一次即可启用捷径。大厅和模拟器的 `CONFIG.exitHook` 均填写 `EXIT_HOOK` 的同一文案，因为正式 iframe 会优先采用 CONFIG。`global-items.json` 改为 `{"schema":"iw-global-items-v1","items":[]}`。

- [ ] **Step 4: 验证声明与回归测试**

Run: `npm test`  
Expected: 全部 PASS。

Run: `node participant-delivery-kit-v3.3.2/tools/check-manifest.mjs global-items.json`  
Expected: 空声明校验通过，不再含示例关东煮。

- [ ] **Step 5: 提交并由 B 审查合并**

Commit: `feat: 接入真实存档、提示主控与空道具交接`。

### Task 7: A 整合全流程，B 独立复核，完成发布验收

**Files:**
- Create: `tests/e2e.py`、`docs/完整流程自测记录.md`、`tools/check-game.mjs`
- Modify only if integration defects require it: 对应缺陷仍由原文件所有者修改，A 不直接改 B 的仓库模块。
- Modify: `NOTICE.md`（A 汇总素材来源）、`game/js/handoff.js`（取得真实遗物 ID 后替换一次）、`package.json`（增加本地检查脚本）

**Interfaces:**
- Consumes: 双方全部公开接口，不新增隐式跨模块读取。

- [ ] **Step 1: 写完整浏览器流程测试**

Playwright 拦截 `shared/save-protocol.js` 注入可控 WL 测试桥，分别验证：残血空背包、携带其他理智道具、携带真实目标遗物、首次 `iw-save-ready` 到达前未挂载、挂载后的 `iw-save-ready` / `iw-admin` 通过 `updateContext` 更新且不丢进度、成功只交档一次、放弃只交档一次。两种装备路线都按正常 UI 操作，不调用跳关函数。另用未修改的官方协议库和相同 `CONFIG.exitHook` 跑一次，确认最终存档结束语未被配置差异覆盖。

- [ ] **Step 2: 运行全流程测试**

Run: `$env:PLAYWRIGHT_BROWSERS_PATH="$PWD\.playwright-browsers"; .\.venv\Scripts\python.exe tests\e2e.py`  
Expected: 全部 PASS；密码按各局扫码顺序计算，无默认满血覆盖，无重复交接。

- [ ] **Step 3: 遗物 ID 可选接入（不阻塞发布）**

理智遗物捷径为可选增益：取得上一关真实声明后替换一次 `SANITY_RELIC_ID` 并重跑有/无遗物全流程；未取得时保持待替换常量，游戏按无遗物路线完成验收与投稿。任何情况下不得猜 ID 或冒用示例“启程火炬”ID。

- [ ] **Step 4: 双人各自实跑正常路线**

两人分别记录从点击开始至结局的实际秒数、操作路线和入场状态；B 必须独立复核，不以 A 的录屏代替。最佳正常路线 ≤270 秒，前 5 秒安全，并填写 `docs/完整流程自测记录.md`。

- [ ] **Step 5: 验证官方模拟器和最终 ZIP**

在 `mock-runner.html` 测试残血/带遗物、成功与失败交接；随后执行：

```powershell
node tools/check-game.mjs
powershell -ExecutionPolicy Bypass -File participant-delivery-kit-v3.3.2/tools/pack.ps1 -GameDir .\game -Out .\dist\tiantai-night-shift.zip
node participant-delivery-kit-v3.3.2/tools/check.mjs .\dist\tiantai-night-shift.zip .\global-items.json
```

`check-game.mjs` 递归扫描 `game/index.html`、`game/js/**` 和 `game/css/**` 的禁用 API、站内绝对资源及待替换 ID；不修改或误报官方 `game/shared/save-protocol.js`。浏览器测试监听 `dialog` 事件，出现任何原生弹窗即失败。

Expected: 自有源码扫描无禁用 API；待替换 ID 仅作提醒、不阻断发布（未配置遗物即按无遗物路线验收）。官方 ZIP 检查确认包体、文件数、扩展名、入口、相对资源和空声明通过。不得把 ZIP 检查单独当作 JS 禁用 API 的证明。最后在真实大厅验证接档、结束语与成功/失败交档。

- [ ] **Step 6: 提交整合 PR 并完成交叉审查**

Commit: `test: 验证完整接力流程与最终投稿包`。  
Gate: B 审查并确认实测记录，双方确认无越权改文件、无未申报素材、无待替换 ID 后才提交作品。

## 4. 完成定义

- [ ] 两位开发者各自的 PR 均由对方审查，所有运行文件归属符合本计划。
- [ ] 营业区、仓库、提示、存档和音频测试全部通过，无控制台错误和资源 404。
- [ ] 任意扫码顺序都能得到与小票一致的三位密码，重复操作不会卡死。
- [ ] 拖放和点击替代路径均可通关，全程不使用键盘。
- [ ] 无目标遗物、携带其他理智道具、携带真实目标遗物三种情况均验证。
- [ ] 不预设生命/理智，延迟存档能更新，成功和失败均只交接一次。
- [ ] 本关零新增跨关道具，门后世界未制作，客人身份未被直接说明。
- [ ] 双人实测最佳完整路线 ≤270 秒，官方模拟器、最终 ZIP 自检和真实大厅验收通过。
