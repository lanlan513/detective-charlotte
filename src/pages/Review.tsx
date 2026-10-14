import type { Case } from '../types';
import { VERDICT_LABEL } from '../types';
import { gameStore, useCaseProgress } from '../store/gameStore';
import { isEvidenceDiscovered } from '../logic/reasoning';

interface ReviewProps {
  caseData: Case;
}

const VERDICT_STYLE: Record<string, { color: string; bg: string; emoji: string }> = {
  perfect: { color: 'var(--gold)', bg: 'rgba(201,169,110,0.12)', emoji: '🏆' },
  correct: { color: '#7fbf7f', bg: 'rgba(127,191,127,0.1)', emoji: '✅' },
  partial: { color: 'var(--gold)', bg: 'rgba(201,169,110,0.1)', emoji: '⚠️' },
  failed: { color: 'var(--blood-light)', bg: 'rgba(139,26,26,0.12)', emoji: '❌' },
};

export function Review({ caseData }: ReviewProps) {
  const progress = useCaseProgress(caseData.id);
  const accusation = progress?.accusation;

  if (!accusation) {
    return (
      <div className="container" style={{ paddingTop: 80, textAlign: 'center' }}>
        <p className="text-dim">尚未提交推理。</p>
        <button className="btn mt-2" onClick={() => gameStore.enterAccusation(caseData.id)}>
          前往指认
        </button>
      </div>
    );
  }

  const truth = caseData.truth;
  const culprit = caseData.suspects.find((s) => s.id === truth.culpritId);
  const playerCulprit = caseData.suspects.find((s) => s.id === accusation.culpritId);
  const verdictStyle = VERDICT_STYLE[accusation.verdict];
  const isCorrectCulprit = accusation.culpritId === truth.culpritId;

  const replay = () => {
    gameStore.resetCase(caseData.id);
    gameStore.startCase(caseData.id);
  };

  const goHome = () => {
    gameStore.setActiveCase(null);
    gameStore.navigate('home');
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 80, maxWidth: 920 }}>
      {/* 判定结果 */}
      <div
        className="fade-in"
        style={{
          textAlign: 'center',
          padding: 40,
          background: verdictStyle.bg,
          border: `2px solid ${verdictStyle.color}`,
          borderRadius: 8,
          marginBottom: 32,
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 12 }}>{verdictStyle.emoji}</div>
        <div className="typewriter" style={{ color: verdictStyle.color, fontSize: 14, letterSpacing: '0.3em', marginBottom: 8 }}>
          CASE CLOSED
        </div>
        <h1 className="serif" style={{ fontSize: 36, color: verdictStyle.color, marginBottom: 8 }}>
          {VERDICT_LABEL[accusation.verdict]}
        </h1>
        <div style={{ fontSize: 48, fontFamily: 'var(--font-typewriter)', color: 'var(--paper-light)', marginBottom: 8 }}>
          {accusation.score}<span style={{ fontSize: 20, color: 'var(--text-faint)' }}>/100</span>
        </div>
        <p style={{ color: 'var(--text-dim)' }}>
          你指认的真凶：<strong style={{ color: isCorrectCulprit ? '#7fbf7f' : 'var(--blood-light)' }}>{playerCulprit?.name}</strong>
          {isCorrectCulprit ? ' ✓' : `（真凶为 ${culprit?.name}）`}
        </p>
      </div>

      {/* 真凶揭秘 */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <div className="typewriter" style={{ color: 'var(--blood-light)', fontSize: 12, letterSpacing: '0.25em', marginBottom: 12 }}>
          ◆ THE CULPRIT
        </div>
        <h2 className="serif" style={{ fontSize: 26, color: 'var(--paper-light)', marginBottom: 16 }}>
          真凶：{culprit?.name}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div>
            <div className="text-gold" style={{ fontSize: 13, fontFamily: 'var(--font-typewriter)', marginBottom: 6 }}>动机</div>
            <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: 14 }}>{truth.culpritMotive}</p>
          </div>
          <div>
            <div className="text-gold" style={{ fontSize: 13, fontFamily: 'var(--font-typewriter)', marginBottom: 6 }}>手法</div>
            <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: 14 }}>{truth.method}</p>
          </div>
        </div>
      </div>

      {/* 真实事件经过 */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <div className="typewriter" style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: '0.25em', marginBottom: 12 }}>
          ◆ THE SEQUENCE OF EVENTS
        </div>
        <h2 className="serif" style={{ fontSize: 22, color: 'var(--paper-light)', marginBottom: 16 }}>真实事件经过</h2>
        <ol style={{ listStyle: 'none', counterReset: 'step', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {truth.sequence.map((step, i) => (
            <li
              key={i}
              className="fade-in"
              style={{
                display: 'flex',
                gap: 14,
                padding: 12,
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 4,
                borderLeft: '3px solid var(--gold-dim)',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--midnight-600)',
                  border: '1px solid var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-typewriter)',
                  color: 'var(--gold)',
                  fontSize: 13,
                }}
              >
                {i + 1}
              </span>
              <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: 14 }}>{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* 关键证据链 */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <div className="typewriter" style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: '0.25em', marginBottom: 12 }}>
          ◆ KEY EVIDENCE CHAIN
        </div>
        <h2 className="serif" style={{ fontSize: 22, color: 'var(--paper-light)', marginBottom: 16 }}>关键证据链</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {truth.keyEvidenceIds.map((eid) => {
            const ev = caseData.evidence.find((e) => e.id === eid);
            const discovered = isEvidenceDiscovered(progress, eid);
            if (!ev) return null;
            return (
              <div
                key={eid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: discovered ? 'rgba(201,169,110,0.06)' : 'rgba(139,26,26,0.06)',
                  borderRadius: 4,
                  border: `1px solid ${discovered ? 'var(--border)' : 'rgba(139,26,26,0.3)'}`,
                }}
              >
                <span style={{ color: discovered ? 'var(--gold)' : 'var(--blood-light)', fontSize: 18 }}>
                  {discovered ? '✓' : '✗'}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ color: 'var(--paper-light)', fontSize: 14, fontFamily: 'var(--font-serif)' }}>{ev.name}</span>
                  <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-faint)' }}>{ev.type}</span>
                </div>
                {!discovered && <span style={{ fontSize: 11, color: 'var(--blood-light)' }}>你未发现此证据</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 玩家推理复盘 */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <div className="typewriter" style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: '0.25em', marginBottom: 12 }}>
          ◆ YOUR REASONING
        </div>
        <h2 className="serif" style={{ fontSize: 22, color: 'var(--paper-light)', marginBottom: 16 }}>你的推理复盘</h2>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>
            <span className="text-gold">真凶指认：</span>
            <strong style={{ color: isCorrectCulprit ? '#7fbf7f' : 'var(--blood-light)' }}>
              {' '}{playerCulprit?.name} {isCorrectCulprit ? '✓ 正确' : '✗ 错误'}
            </strong>
          </p>
          {!isCorrectCulprit && (
            <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 4, fontStyle: 'italic' }}>
              {caseData.deduction.culpritStep.explanation}
            </p>
          )}
        </div>

        {caseData.deduction.reasoningSteps.map((step) => {
          const playerAnswer = accusation.reasoningAnswers[step.id] ?? [];
          const correct = step.correct;
          const isCorrect =
            step.multi
              ? playerAnswer.length === correct.length && correct.every((c) => playerAnswer.includes(c))
              : playerAnswer[0] === correct[0];
          return (
            <div key={step.id} style={{ marginBottom: 14, padding: 12, background: 'rgba(0,0,0,0.15)', borderRadius: 4 }}>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 6 }}>
                {step.question}
              </p>
              <p style={{ fontSize: 13 }}>
                <span style={{ color: isCorrect ? '#7fbf7f' : 'var(--blood-light)' }}>
                  {isCorrect ? '✓' : '✗'} 你的回答：
                </span>
                <span style={{ color: 'var(--text)' }}>
                  {playerAnswer.length > 0
                    ? playerAnswer.map((id) => getLabel(caseData, id)).join('、')
                    : '未作答'}
                </span>
              </p>
              {!isCorrect && (
                <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4, fontStyle: 'italic' }}>
                  {step.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button className="btn" onClick={replay}>🔄 重新调查此案</button>
        <button className="btn btn-ghost" onClick={goHome}>返回首页</button>
      </div>
    </div>
  );
}

function getLabel(caseData: Case, id: string): string {
  const s = caseData.suspects.find((x) => x.id === id);
  if (s) return s.name;
  const e = caseData.evidence.find((x) => x.id === id);
  if (e) return e.name;
  return id;
}
