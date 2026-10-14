import type {
  AccusationResult,
  Case,
  CaseDeduction,
  CaseProgress,
  DeductionStep,
} from '../types';

// =============================================================================
// 推理判定逻辑
// 依据案件静态数据 (deduction) 与玩家作答，计算得分与等级。
// 判定完全基于证据 ID 比对，不依赖硬编码的"随意指定答案"。
// =============================================================================

/** 单个步骤得分：全对得满分，多选时按正确比例给分。 */
function scoreStep(step: DeductionStep, selected: string[] | undefined): number {
  if (!selected || selected.length === 0) return 0;
  if (step.multi) {
    // 多选：正确选项都选中且无多余选项 = 满分；否则按交并比计分
    const correctSet = new Set(step.correct);
    const selectedSet = new Set(selected);
    const intersection = [...correctSet].filter((x) => selectedSet.has(x)).length;
    const union = new Set([...step.correct, ...selected]).size;
    return Math.round((intersection / union) * 100);
  } else {
    // 单选
    return selected[0] === step.correct[0] ? 100 : 0;
  }
}

export interface AccusationInput {
  culpritId: string;
  /** 各推理步骤作答：stepId -> 选中的选项 ID 列表 */
  reasoningAnswers: Record<string, string[]>;
}

/**
 * 判定玩家的推理。返回得分 (0-100) 与等级。
 * 权重：真凶指认 60 分，各推理步骤平分剩余 40 分。
 */
export function evaluateAccusation(
  deduction: CaseDeduction,
  input: AccusationInput,
): AccusationResult {
  const { culpritStep, reasoningSteps } = deduction;

  // 真凶指认（60 分）
  const culpritCorrect =
    input.culpritId === culpritStep.correct[0] ? 1 : 0;
  const culpritScore = culpritCorrect * 60;

  // 推理步骤（共 40 分，各步骤平分）
  const reasoningWeight = reasoningSteps.length > 0 ? 40 / reasoningSteps.length : 0;
  let reasoningScore = 0;
  for (const step of reasoningSteps) {
    const stepScore = scoreStep(step, input.reasoningAnswers[step.id]);
    reasoningScore += (stepScore / 100) * reasoningWeight;
  }

  const total = Math.round(culpritScore + reasoningScore);

  let verdict: AccusationResult['verdict'];
  if (culpritCorrect && total >= 90) verdict = 'perfect';
  else if (culpritCorrect && total >= 60) verdict = 'correct';
  else if (culpritCorrect) verdict = 'partial';
  else verdict = 'failed';

  return {
    culpritId: input.culpritId,
    reasoningAnswers: input.reasoningAnswers,
    score: total,
    verdict,
  };
}

/** 判断某证据是否已被玩家发现（便捷查询）。 */
export function isEvidenceDiscovered(
  progress: CaseProgress | null | undefined,
  evidenceId: string,
): boolean {
  if (!progress) return false;
  return progress.discoveredEvidence.includes(evidenceId);
}

/** 判断某证据的前置依赖是否全部满足。 */
export function canDiscoverEvidence(
  caseData: Case,
  progress: CaseProgress | null | undefined,
  evidenceId: string,
): boolean {
  if (!progress) return false;
  const ev = caseData.evidence.find((e) => e.id === evidenceId);
  if (!ev) return false;
  if (!ev.requires || ev.requires.length === 0) return true;
  return ev.requires.every((r) => progress.discoveredEvidence.includes(r));
}

/** 获取某案件的调查进度百分比（基于已发现证据数）。 */
export function getInvestigationProgress(
  caseData: Case,
  progress: CaseProgress | null | undefined,
): number {
  if (!progress) return 0;
  const total = caseData.evidence.length;
  if (total === 0) return 0;
  return Math.round((progress.discoveredEvidence.length / total) * 100);
}
