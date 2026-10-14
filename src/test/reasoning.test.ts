import { describe, it, expect } from 'vitest';
import { cases } from '../data';
import { evaluateAccusation, getInvestigationProgress, canDiscoverEvidence } from '../logic/reasoning';
import type { CaseProgress } from '../types';

const caseData = cases[0];

describe('推理判定逻辑', () => {
  it('正确指认真凶得满分基础分', () => {
    const culpritId = caseData.deduction.culpritStep.correct[0];
    const result = evaluateAccusation(caseData.deduction, {
      culpritId,
      reasoningAnswers: {},
    });
    expect(result.verdict).toBe('correct');
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.culpritId).toBe(culpritId);
  });

  it('错误指认真凶判定为 failed', () => {
    const wrongId = caseData.suspects.find((s) => !s.isCulprit)!.id;
    const result = evaluateAccusation(caseData.deduction, {
      culpritId: wrongId,
      reasoningAnswers: {},
    });
    expect(result.verdict).toBe('failed');
    expect(result.score).toBeLessThan(60);
  });

  it('全对推理步骤得 perfect', () => {
    const culpritId = caseData.deduction.culpritStep.correct[0];
    const reasoningAnswers: Record<string, string[]> = {};
    for (const step of caseData.deduction.reasoningSteps) {
      reasoningAnswers[step.id] = [...step.correct];
    }
    const result = evaluateAccusation(caseData.deduction, {
      culpritId,
      reasoningAnswers,
    });
    expect(result.verdict).toBe('perfect');
    expect(result.score).toBe(100);
  });

  it('推理步骤部分正确不影响真凶判定', () => {
    const culpritId = caseData.deduction.culpritStep.correct[0];
    // 只答对第一个推理步骤
    const firstStep = caseData.deduction.reasoningSteps[0];
    const reasoningAnswers: Record<string, string[]> = {
      [firstStep.id]: [...firstStep.correct],
    };
    const result = evaluateAccusation(caseData.deduction, {
      culpritId,
      reasoningAnswers,
    });
    expect(result.verdict === 'correct' || result.verdict === 'partial').toBe(true);
    expect(result.score).toBeGreaterThan(60);
    expect(result.score).toBeLessThan(100);
  });

  it('多选步骤部分选对按比例计分', () => {
    const multiStep = caseData.deduction.reasoningSteps.find((s) => s.multi);
    if (multiStep) {
      // 只选对一半
      const half = multiStep.correct.slice(0, Math.ceil(multiStep.correct.length / 2));
      const culpritId = caseData.deduction.culpritStep.correct[0];
      const result = evaluateAccusation(caseData.deduction, {
        culpritId,
        reasoningAnswers: { [multiStep.id]: half },
      });
      expect(result.score).toBeGreaterThan(60);
      expect(result.score).toBeLessThan(100);
    }
  });
});

describe('调查进度计算', () => {
  it('无进度时为 0', () => {
    const progress: CaseProgress = {
      caseId: caseData.id,
      status: 'unstarted',
      discoveredEvidence: [],
      examinedEvidence: [],
      readTestimonies: [],
      startedAt: '2024-01-01',
      version: 1,
    };
    expect(getInvestigationProgress(caseData, progress)).toBe(0);
  });

  it('全部发现时为 100', () => {
    const allIds = caseData.evidence.map((e) => e.id);
    const progress: CaseProgress = {
      caseId: caseData.id,
      status: 'investigating',
      discoveredEvidence: allIds,
      examinedEvidence: [],
      readTestimonies: [],
      startedAt: '2024-01-01',
      version: 1,
    };
    expect(getInvestigationProgress(caseData, progress)).toBe(100);
  });

  it('发现一半时约为 50', () => {
    const half = caseData.evidence.slice(0, Math.ceil(caseData.evidence.length / 2)).map((e) => e.id);
    const progress: CaseProgress = {
      caseId: caseData.id,
      status: 'investigating',
      discoveredEvidence: half,
      examinedEvidence: [],
      readTestimonies: [],
      startedAt: '2024-01-01',
      version: 1,
    };
    expect(getInvestigationProgress(caseData, progress)).toBeGreaterThanOrEqual(40);
    expect(getInvestigationProgress(caseData, progress)).toBeLessThanOrEqual(60);
  });
});

describe('证据发现前置依赖', () => {
  it('无前置依赖的证据可随时发现', () => {
    const ev = caseData.evidence.find((e) => !e.requires || e.requires.length === 0)!;
    const progress: CaseProgress = {
      caseId: caseData.id,
      status: 'investigating',
      discoveredEvidence: [],
      examinedEvidence: [],
      readTestimonies: [],
      startedAt: '2024-01-01',
      version: 1,
    };
    expect(canDiscoverEvidence(caseData, progress, ev.id)).toBe(true);
  });

  it('有前置依赖且未满足时不能发现', () => {
    const ev = caseData.evidence.find((e) => e.requires && e.requires.length > 0)!;
    const progress: CaseProgress = {
      caseId: caseData.id,
      status: 'investigating',
      discoveredEvidence: [],
      examinedEvidence: [],
      readTestimonies: [],
      startedAt: '2024-01-01',
      version: 1,
    };
    expect(canDiscoverEvidence(caseData, progress, ev.id)).toBe(false);
  });

  it('前置依赖满足后可以发现', () => {
    const ev = caseData.evidence.find((e) => e.requires && e.requires.length > 0)!;
    const progress: CaseProgress = {
      caseId: caseData.id,
      status: 'investigating',
      discoveredEvidence: [...ev.requires!],
      examinedEvidence: [],
      readTestimonies: [],
      startedAt: '2024-01-01',
      version: 1,
    };
    expect(canDiscoverEvidence(caseData, progress, ev.id)).toBe(true);
  });
});
