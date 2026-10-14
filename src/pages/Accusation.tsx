import { useState } from 'react';
import type { Case } from '../types';
import { gameStore, useCaseProgress } from '../store/gameStore';
import { evaluateAccusation, isEvidenceDiscovered } from '../logic/reasoning';

interface AccusationProps {
  caseData: Case;
}

export function Accusation({ caseData }: AccusationProps) {
  const progress = useCaseProgress(caseData.id);

  const [culpritId, setCulpritId] = useState<string>('');
  const [reasoning, setReasoning] = useState<Record<string, string[]>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const toggleOption = (stepId: string, optionId: string, multi: boolean) => {
    setReasoning((prev) => {
      const current = prev[stepId] ?? [];
      if (multi) {
        return {
          ...prev,
          [stepId]: current.includes(optionId)
            ? current.filter((o) => o !== optionId)
            : [...current, optionId],
        };
      }
      return { ...prev, [stepId]: [optionId] };
    });
  };

  const getOptionLabel = (optionId: string): string => {
    const suspect = caseData.suspects.find((s) => s.id === optionId);
    if (suspect) return suspect.name;
    const evidence = caseData.evidence.find((e) => e.id === optionId);
    if (evidence) return evidence.name;
    return optionId;
  };

  const handleSubmit = () => {
    if (!culpritId) {
      setError('请先指认你认为的真凶。');
      return;
    }
    setError(null);

    const result = evaluateAccusation(caseData.deduction, {
      culpritId,
      reasoningAnswers: reasoning,
    });

    gameStore.submitAccusation(caseData.id, result);
  };

  const backToInvestigation = () => {
    gameStore.enterInvestigation(caseData.id);
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 80, maxWidth: 880 }}>
      <div style={{ marginBottom: 28 }}>
        <div className="typewriter" style={{ color: 'var(--blood-light)', fontSize: 12, letterSpacing: '0.3em', marginBottom: 8 }}>
          FINAL ACCUSATION
        </div>
        <h1 className="serif" style={{ fontSize: 32, color: 'var(--paper-light)' }}>最终指认</h1>
        <p className="text-dim" style={{ marginTop: 8 }}>
          综合所有线索，作出你的判断。指认真凶，并选择支撑你推理的关键证据。
        </p>
      </div>

      {/* 指认真凶 */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 className="serif" style={{ fontSize: 20, color: 'var(--gold-light)', marginBottom: 16 }}>
          ⚖ {caseData.deduction.culpritStep.question}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {caseData.deduction.culpritStep.options.map((optId) => {
            const suspect = caseData.suspects.find((s) => s.id === optId);
            const selected = culpritId === optId;
            return (
              <button
                key={optId}
                onClick={() => setCulpritId(optId)}
                style={{
                  padding: 16,
                  background: selected ? 'rgba(139,26,26,0.25)' : 'var(--midnight-700)',
                  border: `2px solid ${selected ? 'var(--blood-light)' : 'var(--border)'}`,
                  borderRadius: 6,
                  color: selected ? 'var(--paper-light)' : 'var(--text)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: selected ? 'var(--shadow-blood)' : 'none',
                }}
              >
                {suspect?.name ?? optId}
              </button>
            );
          })}
        </div>
      </div>

      {/* 推理步骤 */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 className="serif" style={{ fontSize: 20, color: 'var(--gold-light)', marginBottom: 6 }}>
          🧩 推理依据（选答，影响最终评分）
        </h3>
        <p className="text-faint" style={{ fontSize: 13, marginBottom: 20 }}>
          回答以下问题可提升推理完整度。仅列出的证据中只有你已发现的才可选择。
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {caseData.deduction.reasoningSteps.map((step, idx) => (
            <div key={step.id} style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <p className="serif" style={{ fontSize: 15, color: 'var(--paper-light)' }}>
                  <span className="text-gold">{idx + 1}.</span> {step.question}
                </p>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setShowHints((p) => ({ ...p, [step.id]: !p[step.id] }))}
                >
                  {showHints[step.id] ? '隐藏提示' : '提示'}
                </button>
              </div>
              {showHints[step.id] && step.hint && (
                <div className="annotation" style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(139,26,26,0.1)', borderRadius: 4 }}>
                  💡 {step.hint}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {step.options.map((optId) => {
                  const evFound = isEvidenceDiscovered(progress, optId);
                  const isEv = !!caseData.evidence.find((e) => e.id === optId);
                  const disabled = isEv && !evFound;
                  const selected = (reasoning[step.id] ?? []).includes(optId);
                  return (
                    <button
                      key={optId}
                      disabled={disabled}
                      onClick={() => toggleOption(step.id, optId, step.multi)}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        background: selected ? 'rgba(201,169,110,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
                        borderRadius: 4,
                        color: disabled ? 'var(--text-faint)' : selected ? 'var(--gold-light)' : 'var(--text-dim)',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        fontSize: 14,
                        opacity: disabled ? 0.5 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      {selected ? '◉ ' : step.multi ? '☐ ' : '○ '}
                      {getOptionLabel(optId)}
                      {disabled && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-faint)' }}>（未发现）</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div
          className="shake"
          style={{
            padding: 12,
            background: 'rgba(139,26,26,0.2)',
            border: '1px solid var(--blood)',
            borderRadius: 4,
            color: 'var(--blood-light)',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <button className="btn btn-ghost" onClick={backToInvestigation}>← 返回调查</button>
        <button className="btn btn-primary" style={{ padding: '14px 40px' }} onClick={handleSubmit}>
          提交推理
        </button>
      </div>
    </div>
  );
}
