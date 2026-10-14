import { describe, it, expect } from 'vitest';
import { cases, getCaseById, caseIds } from '../data';
import type { Case } from '../types';

describe('案件数据', () => {
  it('至少包含一个可游玩案件', () => {
    expect(cases.length).toBeGreaterThan(0);
  });

  it('案件 ID 唯一且稳定', () => {
    const ids = cases.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getCaseById 能正确查找', () => {
    const first = cases[0];
    expect(getCaseById(first.id)?.id).toBe(first.id);
    expect(getCaseById('nonexistent')).toBeUndefined();
  });

  it('caseIds 与 cases 一致', () => {
    expect(caseIds).toEqual(cases.map((c) => c.id));
  });

  it.each(cases)('案件 $title 数据结构完整', (caseData: Case) => {
    // 必须字段
    expect(caseData.id).toBeTruthy();
    expect(caseData.title).toBeTruthy();
    expect(caseData.background.length).toBeGreaterThan(50);
    expect(caseData.evidence.length).toBeGreaterThan(0);
    expect(caseData.suspects.length).toBeGreaterThan(0);
    expect(caseData.testimonies.length).toBeGreaterThan(0);

    // 推理结构
    expect(caseData.deduction.culpritStep).toBeDefined();
    expect(caseData.deduction.culpritStep.correct.length).toBe(1);
    expect(caseData.deduction.reasoningSteps.length).toBeGreaterThan(0);

    // 真相结构
    expect(caseData.truth.culpritId).toBeTruthy();
    expect(caseData.truth.sequence.length).toBeGreaterThan(0);
    expect(caseData.truth.keyEvidenceIds.length).toBeGreaterThan(0);
  });

  it.each(cases)('案件 $title 的证据 ID 唯一', (caseData: Case) => {
    const ids = caseData.evidence.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(cases)('案件 $title 的嫌疑人 ID 唯一', (caseData: Case) => {
    const ids = caseData.suspects.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(cases)('案件 $title 恰好有一名真凶', (caseData: Case) => {
    const culprits = caseData.suspects.filter((s) => s.isCulprit);
    expect(culprits.length).toBe(1);
    // 推理步骤中的正确答案必须指向真凶
    expect(caseData.deduction.culpritStep.correct[0]).toBe(culprits[0].id);
    // 真相中的真凶必须与嫌疑人数据一致
    expect(caseData.truth.culpritId).toBe(culprits[0].id);
  });

  it.each(cases)('案件 $title 的证据来源非空', (caseData: Case) => {
    for (const ev of caseData.evidence) {
      expect(ev.source.trim().length).toBeGreaterThan(0);
      expect(ev.analysis.trim().length).toBeGreaterThan(0);
    }
  });

  it.each(cases)('案件 $title 的前置依赖证据都存在', (caseData: Case) => {
    const allIds = new Set(caseData.evidence.map((e) => e.id));
    for (const ev of caseData.evidence) {
      if (ev.requires) {
        for (const req of ev.requires) {
          expect(allIds.has(req)).toBe(true);
        }
      }
    }
  });

  it.each(cases)('案件 $title 的关键证据链中的证据都存在', (caseData: Case) => {
    const allIds = new Set(caseData.evidence.map((e) => e.id));
    for (const eid of caseData.truth.keyEvidenceIds) {
      expect(allIds.has(eid)).toBe(true);
    }
  });
});
