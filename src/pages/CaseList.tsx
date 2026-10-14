import { gameStore, useGameState } from '../store/gameStore';
import { cases } from '../data';
import { getInvestigationProgress } from '../logic/reasoning';
import { ProgressBar } from '../components/ui/ProgressBar';

export function CaseList() {
  const state = useGameState();

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div style={{ marginBottom: 32 }}>
        <div className="typewriter" style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: '0.3em', marginBottom: 8 }}>
          CASE ARCHIVES
        </div>
        <h1 className="serif" style={{ fontSize: 36, color: 'var(--paper-light)' }}>案件档案</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 8 }}>
          选择一桩悬案，开启你的调查。每个案件都有独立的证据链与嫌疑人。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
        {cases.map((c) => {
          const p = state.progress[c.id];
          const progress = getInvestigationProgress(c, p);
          const status = p?.status ?? 'unstarted';

          return (
            <div
              key={c.id}
              className="paper-card"
              style={{ padding: 24, cursor: 'pointer', transition: 'all 0.25s var(--ease)' }}
              onClick={() => gameStore.startCase(c.id)}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="tag tag-gold">
                  {c.difficulty === 'easy' ? '入门' : c.difficulty === 'normal' ? '标准' : '疑难'}
                </span>
                {status === 'completed' && <span className="tag tag-blood">已结案</span>}
                {status !== 'unstarted' && status !== 'completed' && (
                  <span className="tag tag-dim">调查中</span>
                )}
              </div>
              <h2 className="serif" style={{ fontSize: 22, color: 'var(--ink)', marginBottom: 4 }}>{c.title}</h2>
              <div style={{ fontSize: 13, color: '#7a6a4a', fontStyle: 'italic', marginBottom: 12 }}>{c.subtitle}</div>
              <p style={{ fontSize: 14, color: '#3a3326', lineHeight: 1.8, marginBottom: 16 }}>{c.synopsis}</p>
              <ProgressBar value={progress} label="调查进度" />
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#7a6a4a' }}>
                  {c.suspects.length} 名嫌疑人 · {c.evidence.length} 件证据
                </span>
                <span style={{ fontSize: 13, color: 'var(--blood-dark)', fontFamily: 'var(--font-typewriter)' }}>
                  {status === 'unstarted' ? '开始调查 →' : status === 'completed' ? '查看结案 →' : '继续调查 →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
