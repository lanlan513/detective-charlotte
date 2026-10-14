import { describe, it, expect, beforeEach } from 'vitest';
import { gameStore, migrate } from '../store/gameStore';
import { cases } from '../data';
import { evaluateAccusation } from '../logic/reasoning';
import type { GameState } from '../types';

const caseData = cases[0];

/** 辅助：创建一个干净的 store 状态用于测试 */
function freshStore() {
  gameStore.resetAll();
}

describe('游戏状态管理', () => {
  beforeEach(freshStore);

  describe('案件导航', () => {
    it('初始状态：无激活案件，在首页', () => {
      const state = gameStore.getSnapshot();
      expect(state.activeCaseId).toBeNull();
      expect(state.currentPage).toBe('home');
    });

    it('startCase 设置激活案件并进入简报页', () => {
      gameStore.startCase(caseData.id);
      const state = gameStore.getSnapshot();
      expect(state.activeCaseId).toBe(caseData.id);
      expect(state.currentPage).toBe('briefing');
      expect(state.progress[caseData.id].status).toBe('briefing');
    });

    it('setActiveCase 设置不存在的 ID 被忽略', () => {
      gameStore.setActiveCase('nonexistent');
      expect(gameStore.getSnapshot().activeCaseId).toBeNull();
    });
  });

  describe('证据发现', () => {
    it('发现无依赖证据成功', () => {
      const ev = caseData.evidence.find((e) => !e.requires || e.requires.length === 0)!;
      gameStore.startCase(caseData.id);
      const ok = gameStore.discoverEvidence(caseData.id, ev.id);
      expect(ok).toBe(true);
      const progress = gameStore.getSnapshot().progress[caseData.id];
      expect(progress.discoveredEvidence).toContain(ev.id);
    });

    it('重复发现证据是幂等的', () => {
      const ev = caseData.evidence.find((e) => !e.requires || e.requires.length === 0)!;
      gameStore.startCase(caseData.id);
      gameStore.discoverEvidence(caseData.id, ev.id);
      const ok = gameStore.discoverEvidence(caseData.id, ev.id);
      expect(ok).toBe(true);
      const progress = gameStore.getSnapshot().progress[caseData.id];
      expect(progress.discoveredEvidence.filter((id) => id === ev.id).length).toBe(1);
    });

    it('发现有前置依赖但未满足的证据失败', () => {
      const ev = caseData.evidence.find((e) => e.requires && e.requires.length > 0)!;
      gameStore.startCase(caseData.id);
      const ok = gameStore.discoverEvidence(caseData.id, ev.id);
      expect(ok).toBe(false);
      const progress = gameStore.getSnapshot().progress[caseData.id];
      expect(progress.discoveredEvidence).not.toContain(ev.id);
    });

    it('满足前置依赖后可以发现', () => {
      const ev = caseData.evidence.find((e) => e.requires && e.requires.length > 0)!;
      gameStore.startCase(caseData.id);
      // 先发现所有前置依赖
      for (const req of ev.requires!) {
        gameStore.discoverEvidence(caseData.id, req);
      }
      const ok = gameStore.discoverEvidence(caseData.id, ev.id);
      expect(ok).toBe(true);
    });

    it('发现不存在的证据返回 false', () => {
      gameStore.startCase(caseData.id);
      const ok = gameStore.discoverEvidence(caseData.id, 'ev_nonexistent');
      expect(ok).toBe(false);
    });
  });

  describe('推理提交', () => {
    it('提交正确推理后状态变为 completed', () => {
      gameStore.startCase(caseData.id);
      const culpritId = caseData.deduction.culpritStep.correct[0];
      const result = evaluateAccusation(caseData.deduction, {
        culpritId,
        reasoningAnswers: {},
      });
      gameStore.submitAccusation(caseData.id, result);

      const progress = gameStore.getSnapshot().progress[caseData.id];
      expect(progress.status).toBe('completed');
      expect(progress.accusation).toBeDefined();
      expect(progress.accusation?.culpritId).toBe(culpritId);
      expect(progress.completedAt).toBeDefined();
      expect(gameStore.getSnapshot().currentPage).toBe('review');
    });
  });

  describe('进度隔离', () => {
    it('不同案件的进度互不影响', () => {
      // 首版只有一个案件，但验证隔离机制
      gameStore.startCase(caseData.id);
      const ev = caseData.evidence.find((e) => !e.requires || e.requires.length === 0)!;
      gameStore.discoverEvidence(caseData.id, ev.id);

      const state = gameStore.getSnapshot();
      expect(state.progress[caseData.id].discoveredEvidence).toContain(ev.id);
      // 其他案件（如果存在）不应有此证据
      for (const cid of Object.keys(state.progress)) {
        if (cid !== caseData.id) {
          expect(state.progress[cid].discoveredEvidence).not.toContain(ev.id);
        }
      }
    });
  });

  describe('localStorage 持久化', () => {
    it('状态变更后写入 localStorage', () => {
      gameStore.startCase(caseData.id);
      const raw = localStorage.getItem('shelock_save_v2');
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.activeCaseId).toBe(caseData.id);
    });

    it('刷新后能恢复进度（模拟重新加载 store）', () => {
      gameStore.startCase(caseData.id);
      const ev = caseData.evidence.find((e) => !e.requires || e.requires.length === 0)!;
      gameStore.discoverEvidence(caseData.id, ev.id);

      // 模拟刷新：重新读取 localStorage 并验证
      const raw = localStorage.getItem('shelock_save_v2');
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.progress[caseData.id].discoveredEvidence).toContain(ev.id);
      expect(parsed.currentPage).toBe('briefing');
    });

    it('存档包含版本号', () => {
      gameStore.startCase(caseData.id);
      const raw = localStorage.getItem('shelock_save_v2');
      const parsed = JSON.parse(raw!);
      expect(typeof parsed.version).toBe('number');
      expect(parsed.version).toBeGreaterThan(0);
    });
  });

  describe('重置', () => {
    it('resetCase 清空单个案件进度', () => {
      gameStore.startCase(caseData.id);
      const ev = caseData.evidence.find((e) => !e.requires || e.requires.length === 0)!;
      gameStore.discoverEvidence(caseData.id, ev.id);

      gameStore.resetCase(caseData.id);
      const progress = gameStore.getSnapshot().progress[caseData.id];
      expect(progress.discoveredEvidence).toHaveLength(0);
      expect(progress.status).toBe('unstarted');
    });

    it('resetAll 清空全部进度', () => {
      gameStore.startCase(caseData.id);
      gameStore.resetAll();
      const state = gameStore.getSnapshot();
      expect(state.activeCaseId).toBeNull();
      for (const cid of Object.keys(state.progress)) {
        expect(state.progress[cid].discoveredEvidence).toHaveLength(0);
      }
    });
  });

  describe('存档迁移', () => {
    it('版本过低的存档会被迁移', () => {
      // 模拟一个 v1 存档（缺少 readTestimonies 字段）
      const oldSave = {
        version: 1,
        activeCaseId: caseData.id,
        currentPage: 'home' as const,
        progress: {
          [caseData.id]: {
            caseId: caseData.id,
            status: 'investigating' as const,
            discoveredEvidence: [],
            examinedEvidence: [],
            startedAt: '2024-01-01',
            // 故意缺少 readTestimonies 和 version
          },
        },
      };

      const migrated = migrate(oldSave as unknown as GameState);
      expect(migrated).not.toBeNull();
      expect(migrated!.progress[caseData.id].readTestimonies).toEqual([]);
      expect(migrated!.version).toBe(2);
    });

    it('版本过高的存档返回 null（触发重置）', () => {
      const futureSave = {
        version: 999,
        activeCaseId: null,
        currentPage: 'home' as const,
        progress: {},
      };
      const migrated = migrate(futureSave as unknown as GameState);
      expect(migrated).toBeNull();
    });
  });
});
