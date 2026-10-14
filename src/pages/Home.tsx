import { gameStore, useGameState } from '../store/gameStore';
import { cases } from '../data';
import { getInvestigationProgress } from '../logic/reasoning';
import { ProgressBar } from '../components/ui/ProgressBar';

export function Home() {
  const state = useGameState();
  const inProgress = cases.filter((c) => {
    const p = state.progress[c.id];
    return p && p.status !== 'unstarted' && p.status !== 'completed';
  });
  const completed = cases.filter((c) => {
    const p = state.progress[c.id];
    return p?.status === 'completed';
  });

  const startFirstCase = () => {
    if (cases.length > 0) {
      gameStore.startCase(cases[0].id);
    }
  };

  const goCaseList = () => {
    gameStore.setActiveCase(null);
    gameStore.navigate('caseList');
  };

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', marginBottom: 64 }} className="fade-in">
        <div
          className="typewriter"
          style={{ color: 'var(--blood-light)', fontSize: 13, letterSpacing: '0.4em', marginBottom: 16 }}
        >
          — A DETECTIVE'S TALE —
        </div>
        <h1
          className="serif"
          style={{
            fontSize: 'clamp(40px, 7vw, 72px)',
            fontWeight: 900,
            color: 'var(--paper-light)',
            lineHeight: 1.1,
            marginBottom: 16,
            textShadow: '0 4px 30px rgba(0,0,0,0.6)',
          }}
        >
          神探夏洛特
        </h1>
        <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-dim)', maxWidth: 620, margin: '0 auto 32px', lineHeight: 1.8 }}>
          在暴雨与迷雾交织的夜晚，真相往往藏在最细微的裂痕里。
          <br />
          观察、取证、推理——每一个判断，都将改写故事的结局。
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ fontSize: 16, padding: '16px 40px' }} onClick={startFirstCase}>
            ▶ 开始调查
          </button>
          <button className="btn" onClick={goCaseList}>
            查看案件档案
          </button>
        </div>
      </section>

      {/* Detective Profile */}
      <section className="glass-card" style={{ padding: 32, marginBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          <div>
            <div className="typewriter" style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: '0.2em', marginBottom: 8 }}>
              DETECTIVE PROFILE
            </div>
            <h2 className="serif" style={{ fontSize: 24, color: 'var(--paper-light)', marginBottom: 12 }}>
              侦探档案
            </h2>
            <p style={{ color: 'var(--text-dim)', lineHeight: 1.8, fontSize: 14 }}>
              夏洛特 · 雷恩，业内知名的"细节侦探"。她坚信每一个谎言都有破绽，
              每一处现场都留有真相的指纹。她的探案原则：不靠直觉，只靠证据。
            </p>
            <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
              <Stat label="已侦破" value={`${completed.length}/${cases.length}`} />
              <Stat label="调查中" value={String(inProgress.length)} />
            </div>
          </div>
          <div>
            <div className="typewriter" style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: '0.2em', marginBottom: 8 }}>
              HOW TO PLAY
            </div>
            <h2 className="serif" style={{ fontSize: 24, color: 'var(--paper-light)', marginBottom: 12 }}>
              调查守则
            </h2>
            <ul style={{ listStyle: 'none', color: 'var(--text-dim)', fontSize: 14, lineHeight: 2 }}>
              <li>① 阅读案件简报，了解背景与在场人员</li>
              <li>② 在现场点击可疑之处，发现并检验证据</li>
              <li>③ 比对证词与物证，寻找矛盾与关联</li>
              <li>④ 综合推理，指认真凶并提交判断</li>
              <li>⑤ 查看结案复盘，检验你的推理是否成立</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Case list preview */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 className="serif" style={{ fontSize: 22, color: 'var(--paper-light)' }}>
            案件档案
          </h2>
          <button className="btn btn-sm btn-ghost" onClick={goCaseList}>全部案件 →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {cases.map((c) => {
            const p = state.progress[c.id];
            const progress = getInvestigationProgress(c, p);
            return (
              <div
                key={c.id}
                className="paper-card"
                style={{ padding: 22, cursor: 'pointer', transition: 'transform 0.2s' }}
                onClick={() => gameStore.startCase(c.id)}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span className="tag tag-gold">{c.difficulty === 'easy' ? '入门' : c.difficulty === 'normal' ? '标准' : '疑难'}</span>
                  {p?.status === 'completed' && <span className="tag tag-blood">已结案</span>}
                  {p && p.status !== 'unstarted' && p.status !== 'completed' && (
                    <span className="tag tag-dim">调查中</span>
                  )}
                </div>
                <h3 className="serif" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 8 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: '#5a4a32', lineHeight: 1.7, marginBottom: 16 }}>{c.synopsis}</p>
                <ProgressBar value={progress} label="调查进度" />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 28, fontFamily: 'var(--font-typewriter)', color: 'var(--gold)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{label}</div>
    </div>
  );
}
