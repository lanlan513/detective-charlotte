// =============================================================================
// 神探夏洛特 - 核心类型定义
// 所有案件静态数据、玩家进度、推理结果共享此类型契约。
// 设计原则：案件静态资料 (Case) 与玩家进度 (CaseProgress) 严格分离，
// 证据/嫌疑人/证词使用稳定 ID，便于跨模块关联与存档恢复。
// =============================================================================

/** 证据的物理/信息分类，用于 UI 分组与图标。 */
export type EvidenceType =
  | 'physical' // 物证：玻璃屑、纤维等
  | 'document' // 文书：欠条、记录等
  | 'testimony' // 证词（此处仅作类型保留，证词有独立结构）
  | 'digital' // 电子：监控录像等
  | 'environmental'; // 环境：天气、灯光等

/** 证据在现场中的来源分类。 */
export type EvidenceCategory = 'scene' | 'object' | 'document' | 'person' | 'digital';

/** 单条证据。所有证据必须有明确的来源 (source) 与解释 (analysis)。 */
export interface Evidence {
  /** 稳定 ID，格式建议：ev_<案件缩写>_<语义>，如 ev_rain_broken_glass */
  id: string;
  caseId: string;
  name: string;
  type: EvidenceType;
  category: EvidenceCategory;
  /** 玩家发现时看到的简短描述 */
  description: string;
  /** 证据来源：谁提供 / 在何处发现 */
  source: string;
  /** 是否为案件初始即公开的证据（无需在现场调查发现） */
  isInitial: boolean;
  /** 进一步检验/分析后的深度说明，玩家点击"检验"后解锁 */
  analysis: string;
  /** 解锁该证据所需的前置证据 ID（可选，用于链式发现） */
  requires?: string[];
}

/** 嫌疑人。注意：是否为真凶 (isCulprit) 仅存在于静态数据中，UI 不直接渲染。 */
export interface Suspect {
  /** 稳定 ID，如 sus_rain_liwei */
  id: string;
  caseId: string;
  name: string;
  /** 身份 / 与案件的关系 */
  role: string;
  /** 年龄等背景描述 */
  description: string;
  /** 公开的动机线索（玩家可见） */
  motive: string;
  /** 公开的不在场证明（玩家可见，可能为假） */
  alibi: string;
  /** 鞋码等可用于比对的细节（可选） */
  detail?: Record<string, string>;
  /** 内部字段：是否为真凶。推理逻辑读取此字段判定，UI 绝不展示。 */
  isCulprit: boolean;
}

/** 证词（嫌疑人或证人的陈述）。 */
export interface Testimony {
  id: string;
  caseId: string;
  /** 陈述者 ID：可能是嫌疑人或证人 */
  speakerId: string;
  speakerName: string;
  speakerRole: string;
  /** 陈述内容 */
  content: string;
  /** 与哪些证据/证词存在矛盾（ID 列表） */
  contradicts?: string[];
  /** 得到哪些证据支持（ID 列表） */
  supports?: string[];
  /** 陈述时间 */
  time?: string;
}

/** 现场中的可交互热点，调查时点击可发现证据。 */
export interface SceneHotspot {
  id: string;
  /** 热点名称，如 "破碎的展柜" */
  name: string;
  /** 初始观察到的描述 */
  description: string;
  /** 相对位置百分比 (0-100)，用于在场景图上放置热点 */
  position: { x: number; y: number };
  /** 点击后发现的证据 ID */
  revealsEvidenceId: string;
  /** 发现此热点需要先拥有的证据 ID（可选，限制调查顺序） */
  requires?: string[];
}

/** 案发现场描述区块。 */
export interface SceneSection {
  title: string;
  intro: string;
  hotspots: SceneHotspot[];
}

/** 推理步骤：玩家需回答的一个问题。 */
export interface DeductionStep {
  id: string;
  /** 问题文本 */
  question: string;
  /** 选项 ID 列表（嫌疑人 ID 或证据 ID） */
  options: string[];
  /** 正确选项 ID 列表 */
  correct: string[];
  /** 是否允许多选 */
  multi: boolean;
  /** 提示文本（可选，玩家可请求提示） */
  hint?: string;
  /** 作答后展示的解释 */
  explanation: string;
}

/** 案件的推理判定结构。 */
export interface CaseDeduction {
  /** 核心步骤：指认真凶（单选） */
  culpritStep: DeductionStep;
  /** 辅助推理步骤（用于计算推理完整度） */
  reasoningSteps: DeductionStep[];
}

/** 结案复盘展示的真相。 */
export interface TruthSection {
  /** 真凶 ID */
  culpritId: string;
  /** 真凶动机详述 */
  culpritMotive: string;
  /** 作案手法详述 */
  method: string;
  /** 关键证据链（按时间顺序排列的证据 ID） */
  keyEvidenceIds: string[];
  /** 真实事件经过（分点叙述） */
  sequence: string[];
}

/** 完整案件静态数据。新增案件只需实现此接口并加入 cases 注册表。 */
export interface Case {
  /** 稳定案件 ID，如 case_rainy_night_theft */
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'easy' | 'normal' | 'hard';
  /** 案件一句话摘要（案件列表展示） */
  synopsis: string;
  /** 案件背景详述（简报页展示） */
  background: string;
  scene: SceneSection;
  evidence: Evidence[];
  suspects: Suspect[];
  testimonies: Testimony[];
  deduction: CaseDeduction;
  truth: TruthSection;
}

// =============================================================================
// 玩家进度与存档
// =============================================================================

/** 单个案件的玩家调查进度。 */
export interface CaseProgress {
  caseId: string;
  status: 'unstarted' | 'briefing' | 'investigating' | 'accusing' | 'completed';
  /** 已发现的证据 ID 列表 */
  discoveredEvidence: string[];
  /** 已深入检验的证据 ID 列表 */
  examinedEvidence: string[];
  /** 已阅读的证词 ID 列表（可选追踪） */
  readTestimonies: string[];
  /** 最终提交的推理结果 */
  accusation?: AccusationResult;
  startedAt: string;
  completedAt?: string;
  /** 存档数据版本，用于迁移 */
  version: number;
}

/** 玩家提交的推理结果。 */
export interface AccusationResult {
  /** 玩家指认的真凶 ID */
  culpritId: string;
  /** 各推理步骤的作答：stepId -> 选中的选项 ID 列表 */
  reasoningAnswers: Record<string, string[]>;
  /** 总得分 (0-100) */
  score: number;
  /** 判定等级 */
  verdict: 'perfect' | 'correct' | 'partial' | 'failed';
}

/** 判定等级的可读标签。 */
export const VERDICT_LABEL: Record<AccusationResult['verdict'], string> = {
  perfect: '完美推理',
  correct: '推理正确',
  partial: '部分正确',
  failed: '推理失败',
};

/** 全局游戏状态。 */
export interface GameState {
  /** 存档版本号，结构变更时递增，触发迁移逻辑 */
  version: number;
  /** 当前激活的案件 ID */
  activeCaseId: string | null;
  /** 当前页面（用于刷新后恢复） */
  currentPage: GamePage;
  /** 各案件进度，按 caseId 隔离 */
  progress: Record<string, CaseProgress>;
}

export type GamePage =
  | 'home'
  | 'caseList'
  | 'briefing'
  | 'investigation'
  | 'accusation'
  | 'review';

/** 当前存档版本。升级时同步 gameStore 中的迁移逻辑。 */
export const SAVE_VERSION = 2;
