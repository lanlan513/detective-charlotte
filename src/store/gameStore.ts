import { useSyncExternalStore } from 'react';
import type {
  AccusationResult,
  CaseProgress,
  GamePage,
  GameState,
} from '../types';
import { SAVE_VERSION } from '../types';
import { cases } from '../data';

// =============================================================================
// 神探夏洛特 - 全局游戏状态管理
// 采用 module-level store + useSyncExternalStore，无需额外依赖。
// 所有页面共享单一数据源，避免各自维护冲突状态。
// =============================================================================

const STORAGE_KEY = 'shelock_save_v2';

/** 创建全新的空进度。 */
function createEmptyProgress(caseId: string): CaseProgress {
  return {
    caseId,
    status: 'unstarted',
    discoveredEvidence: [],
    examinedEvidence: [],
    readTestimonies: [],
    startedAt: new Date().toISOString(),
    version: SAVE_VERSION,
  };
}

/** 创建全新的全局状态。 */
function createInitialState(): GameState {
  const progress: Record<string, CaseProgress> = {};
  for (const c of cases) {
    progress[c.id] = createEmptyProgress(c.id);
  }
  return {
    version: SAVE_VERSION,
    activeCaseId: null,
    currentPage: 'home',
    progress,
  };
}

/** 从 localStorage 读取存档。失败或版本不兼容时返回 null。 */
function loadFromStorage(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (typeof parsed !== 'object' || parsed === null) return null;
    return migrate(parsed);
  } catch {
    return null;
  }
}

/**
 * 存档版本迁移。当 SAVE_VERSION 升级时，在此处理旧存档到新结构的转换。
 * 不兼容时返回 null，触发重置。
 * 导出以供测试。
 */
export function migrate(state: GameState): GameState | null {
  // 缺少必要字段直接丢弃
  if (typeof state.version !== 'number' || !state.progress) return null;

  // 版本 1 -> 2：增加 readTestimonies 字段
  if (state.version < 2) {
    for (const caseId of Object.keys(state.progress)) {
      const p = state.progress[caseId];
      if (p && !Array.isArray(p.readTestimonies)) {
        p.readTestimonies = [];
      }
    }
    state.version = 2;
  }

  // 未来更高版本不兼容，重置
  if (state.version > SAVE_VERSION) return null;

  // 确保所有已注册案件都有进度条目
  for (const c of cases) {
    if (!state.progress[c.id]) {
      state.progress[c.id] = createEmptyProgress(c.id);
    }
  }

  return state;
}

/** 写入 localStorage。 */
function saveToStorage(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 存储失败（如隐私模式/配额满）不阻断游戏，仅静默
  }
}

// -----------------------------------------------------------------------------
// Store 核心
// -----------------------------------------------------------------------------

type Listener = () => void;

class GameStore {
  private state: GameState;
  private listeners = new Set<Listener>();

  constructor() {
    const loaded = loadFromStorage();
    this.state = loaded ?? createInitialState();
    // 确保新注册的案件有进度
    for (const c of cases) {
      if (!this.state.progress[c.id]) {
        this.state.progress[c.id] = createEmptyProgress(c.id);
      }
    }
    saveToStorage(this.state);
  }

  getSnapshot = (): GameState => this.state;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit(): void {
    saveToStorage(this.state);
    for (const l of this.listeners) l();
  }

  private setState(updater: (draft: GameState) => void): void {
    // 浅拷贝 + 进度对象拷贝，保证 useSyncExternalStore 的引用变更检测
    const next: GameState = {
      ...this.state,
      progress: { ...this.state.progress },
    };
    updater(next);
    this.state = next;
    this.emit();
  }

  // ---- 页面/案件导航 ----

  navigate(page: GamePage): void {
    this.setState((s) => {
      s.currentPage = page;
    });
  }

  setActiveCase(caseId: string | null): void {
    if (caseId !== null && !cases.some((c) => c.id === caseId)) return;
    this.setState((s) => {
      s.activeCaseId = caseId;
    });
  }

  /** 开始或继续一个案件，进入简报页。 */
  startCase(caseId: string): void {
    if (!cases.some((c) => c.id === caseId)) return;
    this.setState((s) => {
      s.activeCaseId = caseId;
      s.currentPage = 'briefing';
      const p = s.progress[caseId];
      if (p.status === 'unstarted') {
        p.status = 'briefing';
        p.startedAt = new Date().toISOString();
      }
    });
  }

  /** 从简报进入调查。 */
  enterInvestigation(caseId: string): void {
    this.setState((s) => {
      const p = s.progress[caseId];
      if (!p) return;
      p.status = 'investigating';
      s.currentPage = 'investigation';
    });
  }

  /** 进入指认页。 */
  enterAccusation(caseId: string): void {
    this.setState((s) => {
      const p = s.progress[caseId];
      if (!p) return;
      p.status = 'accusing';
      s.currentPage = 'accusation';
    });
  }

  // ---- 证据发现 ----

  /**
   * 发现一条证据。重复发现是安全的（幂等）。
   * 若证据有前置依赖且未全部发现，则拒绝并返回 false。
   */
  discoverEvidence(caseId: string, evidenceId: string): boolean {
    const caseData = cases.find((c) => c.id === caseId);
    if (!caseData) return false;
    const ev = caseData.evidence.find((e) => e.id === evidenceId);
    if (!ev) return false;

    let ok = false;
    this.setState((s) => {
      const p = s.progress[caseId];
      if (!p) return;
      // 前置依赖检查
      if (ev.requires && ev.requires.length > 0) {
        const allMet = ev.requires.every((r) => p.discoveredEvidence.includes(r));
        if (!allMet) return; // 依赖未满足，拒绝
      }
      if (!p.discoveredEvidence.includes(evidenceId)) {
        p.discoveredEvidence = [...p.discoveredEvidence, evidenceId];
        ok = true;
      } else {
        ok = true; // 已发现，幂等返回成功
      }
    });
    return ok;
  }

  /** 标记已深入检验某证据。 */
  examineEvidence(caseId: string, evidenceId: string): void {
    this.setState((s) => {
      const p = s.progress[caseId];
      if (!p) return;
      if (!p.examinedEvidence.includes(evidenceId)) {
        p.examinedEvidence = [...p.examinedEvidence, evidenceId];
      }
    });
  }

  /** 标记已阅读某证词。 */
  readTestimony(caseId: string, testimonyId: string): void {
    this.setState((s) => {
      const p = s.progress[caseId];
      if (!p) return;
      if (!p.readTestimonies.includes(testimonyId)) {
        p.readTestimonies = [...p.readTestimonies, testimonyId];
      }
    });
  }

  // ---- 推理提交 ----

  /** 提交最终推理。仅当案件处于 accusing 状态时允许。 */
  submitAccusation(caseId: string, result: AccusationResult): void {
    this.setState((s) => {
      const p = s.progress[caseId];
      if (!p) return;
      p.accusation = result;
      p.status = 'completed';
      p.completedAt = new Date().toISOString();
      s.currentPage = 'review';
    });
  }

  /** 进入结案复盘页。 */
  enterReview(caseId: string): void {
    this.setState((s) => {
      const p = s.progress[caseId];
      if (!p) return;
      s.currentPage = 'review';
    });
  }

  // ---- 重置 ----

  /** 重置单个案件的进度（保留已完成状态可选）。 */
  resetCase(caseId: string): void {
    this.setState((s) => {
      s.progress[caseId] = createEmptyProgress(caseId);
      if (s.activeCaseId === caseId) {
        s.currentPage = 'briefing';
      }
    });
  }

  /** 清空全部存档。 */
  resetAll(): void {
    this.state = createInitialState();
    this.emit();
  }
}

export const gameStore = new GameStore();

/** React Hook：订阅全局游戏状态。 */
export function useGameState(): GameState {
  return useSyncExternalStore(gameStore.subscribe, gameStore.getSnapshot, gameStore.getSnapshot);
}

/** 获取某个案件的进度（便捷 Hook）。 */
export function useCaseProgress(caseId: string | null): CaseProgress | null {
  const state = useGameState();
  if (!caseId) return null;
  return state.progress[caseId] ?? null;
}
