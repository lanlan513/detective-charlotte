# 神探夏洛特 · Detective Charlotte

> 一款具有电影叙事感的 Web 推理解谜游戏。扮演侦探夏洛特，在暴雨与迷雾交织的夜晚，观察现场、分析证据、揭穿谎言，推导真相。

---

## 目录

- [项目定位](#项目定位)
- [玩法流程](#玩法流程)
- [技术栈](#技术栈)
- [安装与启动](#安装与启动)
- [目录结构](#目录结构)
- [核心模块职责](#核心模块职责)
- [案件数据结构](#案件数据结构)
- [线索关联规则](#线索关联规则)
- [存档机制](#存档机制)
- [测试命令](#测试命令)
- [开发约定](#开发约定)

---

## 项目定位

《神探夏洛特》是一款**单案件可完整通关**的推理解谜原型游戏。玩家通过调查现场、收集物证、阅读证词、比对矛盾，最终指认真凶并查看结案复盘。

### 设计目标

- **可真实游玩**：首版包含一个内容完整、逻辑自洽的原创案件（暴雨夜失窃案），可从头到尾完成。
- **鲜明悬疑美学**：午夜蓝、墨黑、旧纸米黄、暗红为主色，复古档案、手写批注、证据标签、局部聚光效果。
- **推理可验证**：所有结论基于证据 ID 比对得出，不存在"猜作者想法"的谜题。
- **便于扩展**：案件数据、推理逻辑、状态管理、UI 组件分离，新增案件无需改动框架代码。

### 非目标（首版不做）

- 实时战斗、联网对战、账号系统、剧情编辑器。
- 多结局分支（首版为单真相 + 评分等级）。

---

## 玩法流程

```
首页 → 案件档案 → 案件简报 → 现场调查 → 最终指认 → 结案复盘
```

1. **首页**：醒目的"开始调查"入口，展示案件档案、调查进度、侦探档案与游戏规则。
2. **案件档案**：从案件列表选择一个可游玩案件。
3. **案件简报**：阅读案件背景、在场人员、证据数量。
4. **现场调查**：四个标签页——
   - **案发现场**：点击场景中的可疑热点发现证据（部分热点有前置依赖）。
   - **证据库**：查看已发现证据，点击"深入分析"获取深度解读。
   - **嫌疑人**：查看四名嫌疑人的动机与不在场证明。
   - **证词**：阅读各人陈述，标注矛盾与佐证关系。
5. **最终指认**：选择真凶 + 回答推理依据问题（选答，影响评分）。
6. **结案复盘**：展示判定等级、真凶揭秘、真实事件经过、关键证据链、玩家推理复盘。

### 评分规则

| 维度 | 权重 |
|------|------|
| 真凶指认正确 | 60 分 |
| 推理步骤（各步平分） | 40 分 |

| 等级 | 条件 |
|------|------|
| 完美推理 (perfect) | 真凶正确 且 总分 ≥ 90 |
| 推理正确 (correct) | 真凶正确 且 60 ≤ 总分 < 90 |
| 部分正确 (partial) | 真凶正确 且 总分 < 60 |
| 推理失败 (failed) | 真凶错误 |

---

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | React 19 |
| 语言 | TypeScript 6 |
| 构建 | Vite 8 |
| 状态管理 | 自定义 store（`useSyncExternalStore`，无第三方依赖） |
| 持久化 | localStorage |
| 测试 | Vitest + @testing-library/react + jsdom |
| 代码检查 | oxlint |

---

## 安装与启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建（含类型检查）
npm run build

# 本地预览构建产物
npm run preview

# 类型检查
npm run typecheck

# 运行测试
npm test

# 监听模式测试
npm run test:watch
```

---

## 目录结构

```
shelock/
├── index.html                  # 入口 HTML（含字体引入）
├── package.json
├── tsconfig.json               # 根 tsconfig（引用 app + node）
├── tsconfig.app.json           # 应用代码 TS 配置
├── tsconfig.node.json          # vite.config.ts 的 TS 配置
├── vite.config.ts              # Vite + Vitest 配置
├── public/                     # 静态资源
└── src/
    ├── main.tsx                # React 入口
    ├── App.tsx                 # 根组件（状态驱动的页面路由）
    ├── index.css               # 设计系统（CSS 变量 + 通用组件样式）
    │
    ├── types/
    │   └── index.ts            # 全部类型定义（Case, Evidence, Suspect, Progress 等）
    │
    ├── data/
    │   ├── index.ts            # 案件注册表（cases 数组 + getCaseById）
    │   └── cases/
    │       └── rainyNightTheft.ts  # 首案：暴雨夜失窃案
    │
    ├── store/
    │   └── gameStore.ts        # 全局状态管理 + localStorage 持久化 + 迁移
    │
    ├── logic/
    │   └── reasoning.ts        # 推理判定、进度计算、证据依赖检查
    │
    ├── components/
    │   ├── layout/
    │   │   └── Header.tsx      # 顶部导航
    │   └── ui/
    │       ├── ProgressBar.tsx
    │       ├── EvidenceCard.tsx
    │       └── SuspectCard.tsx
    │
    ├── pages/
    │   ├── Home.tsx            # 首页
    │   ├── CaseList.tsx        # 案件档案列表
    │   ├── Briefing.tsx        # 案件简报
    │   ├── Investigation.tsx   # 现场调查（四标签页）
    │   ├── Accusation.tsx      # 最终指认
    │   └── Review.tsx          # 结案复盘
    │
    └── test/
        ├── setup.ts            # Vitest 测试环境设置
        ├── cases.test.ts       # 案件数据完整性测试
        ├── reasoning.test.ts   # 推理判定逻辑测试
        └── store.test.ts       # 状态管理与存档测试
```

---

## 核心模块职责

### `src/types/index.ts` — 类型契约

定义所有静态数据与运行时状态的 TypeScript 接口。**所有模块共享此契约**，确保案件数据、进度、推理结果类型安全。

关键类型：
- `Case`：完整案件静态数据
- `Evidence`：单条证据（含 `source`、`analysis`、`requires`）
- `Suspect`：嫌疑人（`isCulprit` 为内部字段，UI 不渲染）
- `Testimony`：证词（含 `contradicts`、`supports` 关联）
- `CaseProgress`：单案件玩家进度
- `GameState`：全局状态（含 `version`、`activeCaseId`、`currentPage`、`progress`）

### `src/data/` — 案件静态数据

- `index.ts` 导出 `cases` 数组与 `getCaseById`。
- 每个案件是一个独立 `.ts` 文件，实现 `Case` 接口。
- **新增案件只需：新建文件 → 加入 `cases` 数组**，其余模块无需改动。

### `src/store/gameStore.ts` — 状态管理

- 基于 `useSyncExternalStore` 的单例 store，无第三方依赖。
- 所有页面共享单一数据源，避免各自维护冲突状态。
- 每次状态变更自动写入 localStorage。
- 提供 `migrate()` 处理存档版本迁移。

核心动作：`startCase`、`enterInvestigation`、`enterAccusation`、`discoverEvidence`、`examineEvidence`、`submitAccusation`、`resetCase`、`resetAll`。

### `src/logic/reasoning.ts` — 推理判定

- `evaluateAccusation()`：根据 `deduction` 数据与玩家作答计算得分与等级。
- `canDiscoverEvidence()`：检查证据前置依赖是否满足。
- `getInvestigationProgress()`：计算调查进度百分比。
- 判定完全基于证据 ID 比对，不硬编码答案。

### `src/pages/` & `src/components/` — 视图层

- 页面由 `App.tsx` 根据 `gameStore.currentPage` 渲染。
- UI 组件（ProgressBar、EvidenceCard、SuspectCard）可复用。
- 样式通过 `index.css` 的 CSS 变量统一管理。

---

## 案件数据结构

一个完整的 `Case` 对象包含以下字段：

```typescript
interface Case {
  id: string;                    // 稳定 ID，如 'case_rainy_night_theft'
  title: string;
  subtitle: string;
  difficulty: 'easy' | 'normal' | 'hard';
  synopsis: string;              // 案件列表摘要
  background: string;            // 简报页完整背景
  scene: SceneSection;           // 现场描述 + 热点
  evidence: Evidence[];          // 全部证据
  suspects: Suspect[];           // 嫌疑人（含 isCulprit 内部字段）
  testimonies: Testimony[];      // 证词
  deduction: CaseDeduction;      // 推理判定结构
  truth: TruthSection;           // 结案复盘真相
}
```

### 证据 (`Evidence`) 关键字段

| 字段 | 说明 |
|------|------|
| `id` | 稳定 ID，如 `ev_broken_glass` |
| `isInitial` | 是否初始即可见（无需现场发现） |
| `requires` | 前置证据 ID 列表（链式发现） |
| `source` | 证据来源（谁提供/在何处发现） |
| `analysis` | 深入分析文本 |

### 推理判定 (`CaseDeduction`)

```typescript
interface CaseDeduction {
  culpritStep: DeductionStep;    // 真凶指认（单选）
  reasoningSteps: DeductionStep[]; // 推理依据（选答）
}

interface DeductionStep {
  id: string;
  question: string;
  options: string[];             // 嫌疑人 ID 或证据 ID
  correct: string[];             // 正确答案
  multi: boolean;                // 是否多选
  hint?: string;
  explanation: string;           // 作答后解释
}
```

---

## 线索关联规则

### 证据发现链

证据通过 `requires` 字段形成发现链。玩家必须先发现前置证据，才能发现后续证据。

以暴雨夜失窃案为例：

```
ev_broken_glass (无依赖)
  ├── ev_wet_footprints (requires: broken_glass)
  └── ev_silk_fiber (requires: broken_glass)
        └── ev_gambling_debt (requires: silk_fiber)
              └── ev_cook_testimony (requires: gambling_debt)
                    └── ev_glass_dust_on_sleeve (requires: silk_fiber, cook_testimony)
```

### 证词关联

- `contradicts`: 该证词与哪些证据/证词矛盾。
- `supports`: 该证词得到哪些证据支持。

### 推理链

结案复盘的 `truth.keyEvidenceIds` 按时间顺序列出关键证据链，玩家可对照查看自己是否发现了全部关键证据。

---

## 存档机制

### 存储格式

localStorage key: `shelock_save_v2`

```json
{
  "version": 2,
  "activeCaseId": "case_rainy_night_theft",
  "currentPage": "investigation",
  "progress": {
    "case_rainy_night_theft": {
      "caseId": "case_rainy_night_theft",
      "status": "investigating",
      "discoveredEvidence": ["ev_broken_glass", "..."],
      "examinedEvidence": ["ev_broken_glass"],
      "readTestimonies": ["tes_liwei_kitchen"],
      "accusation": null,
      "startedAt": "2024-...",
      "completedAt": null,
      "version": 2
    }
  }
}
```

### 关键特性

1. **刷新恢复**：`activeCaseId` 与 `currentPage` 持久化，刷新后回到正确页面与案件。
2. **进度隔离**：各案件进度独立存储在 `progress[caseId]`，切换案件互不影响。
3. **版本迁移**：`SAVE_VERSION` 常量控制版本。升级时在 `migrate()` 中处理旧结构。版本过高（未来存档）返回 `null` 触发重置。
4. **幂等操作**：`discoverEvidence` 对已发现证据幂等，不会重复添加。
5. **非法状态防护**：
   - 发现不存在的证据返回 `false`。
   - 前置依赖未满足时拒绝发现。
   - `setActiveCase` 忽略不存在的案件 ID。

---

## 测试命令

```bash
# 运行全部测试（39 个用例）
npm test

# 监听模式
npm run test:watch

# 带 UI
npm run test:ui
```

### 测试覆盖

| 测试文件 | 覆盖内容 |
|----------|----------|
| `cases.test.ts` | 案件数据完整性：ID 唯一、恰好一名真凶、证据来源非空、依赖存在、关键证据链有效 |
| `reasoning.test.ts` | 推理判定：正确/错误指认、perfect 评分、部分正确计分、多选比例计分、进度计算、依赖检查 |
| `store.test.ts` | 状态管理：导航、证据发现（幂等/依赖/不存在）、推理提交、进度隔离、localStorage 持久化、重置、存档迁移 |

---

## 开发约定

### 新增案件

1. 在 `src/data/cases/` 下新建 `xxx.ts`，导出一个实现 `Case` 接口的对象。
2. 在 `src/data/index.ts` 中 import 并加入 `cases` 数组。
3. 确保：
   - `id` 全局唯一且语义化。
   - 恰好一名嫌疑人 `isCulprit: true`。
   - `deduction.culpritStep.correct[0]` 等于真凶 ID。
   - `truth.culpritId` 等于真凶 ID。
   - 所有 `requires` 引用的证据 ID 都存在。
   - `truth.keyEvidenceIds` 中的 ID 都存在。
4. 运行 `npm test` 验证数据完整性测试通过。

### 新增 UI 组件

- 放在 `src/components/ui/` 下，使用 `index.css` 中的 CSS 变量。
- 颜色统一使用 `var(--midnight-*)`、`var(--paper-*)`、`var(--blood-*)`、`var(--gold-*)`。
- 字体：标题用 `var(--font-serif)`，标签/打字机效果用 `var(--font-typewriter)`，正文用 `var(--font-sans)`。

### 新增游戏机制

- 状态变更逻辑放入 `src/store/gameStore.ts`。
- 判定/计算逻辑放入 `src/logic/`。
- 纯数据放入 `src/data/`。
- 不在组件中直接操作 localStorage，统一通过 store。

### 存档版本升级

1. 递增 `SAVE_VERSION`（`src/types/index.ts`）。
2. 在 `migrate()`（`src/store/gameStore.ts`）中添加旧版本到新版本的转换逻辑。
3. 添加对应的迁移测试。

---

## 首案：暴雨夜失窃案

富豪陈志远在暴雨夜举办私人鉴赏会，展示新购的"碧玉蟠龙佩"。深夜展室警报响起，玉佩不翼而飞。四名在场者各执一词——

| 嫌疑人 | 身份 | 公开动机 | 不在场证明 |
|--------|------|----------|------------|
| 李伟 | 私人秘书 | （隐藏）赌债 | 声称在厨房 |
| 陈雨晴 | 女儿 | 遗产纠纷 | 声称服安眠药熟睡 |
| 王德明 | 鉴定专家 | 学术觊觎 | 声称在客厅 |
| 张福 | 管家 | 借钱被拒 | 声称在花园 |

**真凶**：李伟。推理链：玻璃由内向外碎裂（内应）→ 丝质纤维仅匹配李伟西装 → 李伟掌握保险柜密码（备用钥匙）→ 赌债动机 → 厨师证词推翻厨房不在场证明 → 袖口玻璃屑为直接物证。

---

*真相，藏在细节之中。*
