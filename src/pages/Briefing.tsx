import { gameStore, useCaseProgress } from '../store/gameStore';
import type { Case } from '../types';

interface BriefingProps {
  caseData: Case;
}

export function Briefing({ caseData }: BriefingProps) {
  const progress = useCaseProgress(caseData.id);
  const canContinue = progress && progress.status !== 'unstarted';

  const enterInvestigation = () => {
    gameStore.enterInvestigation(caseData.id);
  };

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <div className="typewriter" style={{ color: 'var(--blood-light)', fontSize: 12, letterSpacing: '0.3em', marginBottom: 8 }}>
          CASE BRIEFING · {caseData.id.toUpperCase()}
        </div>
        <h1 className="serif" style={{ fontSize: 40, color: 'var(--paper-light)', marginBottom: 4 }}>
          {caseData.title}
        </h1>
        <div style={{ fontSize: 16, color: 'var(--gold)', fontStyle: 'italic' }}>{caseData.subtitle}</div>
      </div>

      <div className="divider" />

      <div className="paper-card" style={{ padding: 36, position: 'relative' }}>
        {/* 档案印章 */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 24,
            border: '3px solid var(--blood)',
            color: 'var(--blood)',
            padding: '4px 14px',
            fontFamily: 'var(--font-typewriter)',
            fontSize: 14,
            letterSpacing: '0.15em',
            transform: 'rotate(12deg)',
            opacity: 0.8,
            borderRadius: 2,
          }}
        >
          机密
        </div>

        <div className="typewriter" style={{ color: 'var(--blood-dark)', fontSize: 12, letterSpacing: '0.2em', marginBottom: 16 }}>
          ◆ 案件背景
        </div>
        <div
          className="serif"
          style={{
            fontSize: 16,
            color: '#2a2418',
            lineHeight: 2,
            whiteSpace: 'pre-line',
          }}
        >
          {caseData.background}
        </div>

        <div className="divider" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <Info label="在场人员" value={`${caseData.suspects.length} 名嫌疑人`} />
          <Info label="现场证据" value={`${caseData.evidence.length} 件`} />
          <Info label="证词记录" value={`${caseData.testimonies.length} 份`} />
          <Info label="案件难度" value={caseData.difficulty === 'easy' ? '入门' : caseData.difficulty === 'normal' ? '标准' : '疑难'} />
        </div>
      </div>

      <div className="annotation" style={{ marginTop: 24, textAlign: 'center' }}>
        "每一个谎言，都始于一个微小的细节。" —— 夏洛特
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
        <button className="btn btn-primary" style={{ fontSize: 16, padding: '16px 48px' }} onClick={enterInvestigation}>
          {canContinue ? '进入现场调查 →' : '开始调查 →'}
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 12, background: 'rgba(0,0,0,0.04)', borderRadius: 4, borderLeft: '3px solid var(--gold-dim)' }}>
      <div style={{ fontSize: 11, color: '#7a6a4a', fontFamily: 'var(--font-typewriter)', letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ fontSize: 16, color: 'var(--ink)', fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  );
}
