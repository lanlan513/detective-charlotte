import { useState } from 'react';
import type { Case } from '../types';
import { gameStore, useCaseProgress } from '../store/gameStore';
import { getInvestigationProgress } from '../logic/reasoning';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EvidenceCard } from '../components/ui/EvidenceCard';
import { SuspectCard } from '../components/ui/SuspectCard';

type Tab = 'scene' | 'evidence' | 'suspects' | 'testimonies';

interface InvestigationProps {
  caseData: Case;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'scene', label: '案发现场', icon: '🏚️' },
  { id: 'evidence', label: '证据库', icon: '🔍' },
  { id: 'suspects', label: '嫌疑人', icon: '👤' },
  { id: 'testimonies', label: '证词', icon: '💬' },
];

export function Investigation({ caseData }: InvestigationProps) {
  const [tab, setTab] = useState<Tab>('scene');
  const progress = useCaseProgress(caseData.id);
  const discovered = progress?.discoveredEvidence ?? [];
  const examined = progress?.examinedEvidence ?? [];
  const readTestimonies = progress?.readTestimonies ?? [];

  const investigationProgress = getInvestigationProgress(caseData, progress);

  const goAccusation = () => {
    gameStore.enterAccusation(caseData.id);
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
      {/* 顶部案件信息 + 进度 */}
      <div style={{ marginBottom: 20 }}>
        <div className="typewriter" style={{ color: 'var(--blood-light)', fontSize: 11, letterSpacing: '0.25em', marginBottom: 4 }}>
          INVESTIGATION
        </div>
        <h1 className="serif" style={{ fontSize: 28, color: 'var(--paper-light)' }}>{caseData.title}</h1>
      </div>

      <div className="glass-card" style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <ProgressBar value={investigationProgress} label={`调查进度（已发现 ${discovered.length}/${caseData.evidence.length} 件证据）`} />
          </div>
          <button className="btn btn-primary" onClick={goAccusation} disabled={discovered.length < 3}>
            提交最终推理 →
          </button>
        </div>
        {discovered.length < 3 && (
          <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 8, fontStyle: 'italic' }}>
            至少发现 3 件证据后，方可提交推理。
          </div>
        )}
      </div>

      {/* Tab 导航 */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          let badge: string | null = null;
          if (t.id === 'evidence') badge = `${discovered.length}/${caseData.evidence.length}`;
          if (t.id === 'testimonies') badge = `${readTestimonies.length}/${caseData.testimonies.length}`;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '12px 20px',
                fontSize: 14,
                fontFamily: 'var(--font-serif)',
                color: active ? 'var(--gold-light)' : 'var(--text-dim)',
                borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
                background: 'transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{t.icon}</span>
              {t.label}
              {badge && (
                <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-typewriter)' }}>
                  ({badge})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 内容 */}
      {tab === 'scene' && <SceneTab caseData={caseData} />}
      {tab === 'evidence' && (
        <EvidenceTab caseData={caseData} discovered={discovered} examined={examined} />
      )}
      {tab === 'suspects' && <SuspectsTab caseData={caseData} />}
      {tab === 'testimonies' && <TestimoniesTab caseData={caseData} readTestimonies={readTestimonies} />}
    </div>
  );
}

// ---- 现场调查 ----

function SceneTab({ caseData }: { caseData: Case }) {
  const progress = useCaseProgress(caseData.id);
  const discovered = progress?.discoveredEvidence ?? [];
  const [message, setMessage] = useState<string | null>(null);

  const handleHotspot = (evidenceId: string, requires?: string[]) => {
    // 检查依赖
    if (requires && requires.length > 0) {
      const allMet = requires.every((r) => discovered.includes(r));
      if (!allMet) {
        setMessage('此处似乎还需要先了解其他线索……');
        setTimeout(() => setMessage(null), 2500);
        return;
      }
    }
    const ok = gameStore.discoverEvidence(caseData.id, evidenceId);
    if (ok && !discovered.includes(evidenceId)) {
      const ev = caseData.evidence.find((e) => e.id === evidenceId);
      setMessage(`发现新证据：${ev?.name ?? ''}`);
      setTimeout(() => setMessage(null), 3000);
    } else if (ok) {
      setMessage('你已经仔细检查过此处了。');
      setTimeout(() => setMessage(null), 2000);
    }
  };

  return (
    <div>
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 className="serif" style={{ fontSize: 20, color: 'var(--gold-light)', marginBottom: 12 }}>
          {caseData.scene.title}
        </h3>
        <p style={{ color: 'var(--text-dim)', lineHeight: 1.9 }}>{caseData.scene.intro}</p>
      </div>

      {/* 场景图（用渐变 + 热点模拟） */}
      <div
        className="spotlight"
        style={{
          position: 'relative',
          height: 420,
          borderRadius: 8,
          background: `
            radial-gradient(ellipse at 50% 40%, rgba(201,169,110,0.12) 0%, transparent 60%),
            linear-gradient(180deg, #0f1f3a 0%, #060d1a 100%)
          `,
          border: '1px solid var(--border)',
          marginBottom: 20,
          overflow: 'hidden',
        }}
      >
        {/* 房间示意元素 */}
        <div style={{ position: 'absolute', left: '8%', top: '20%', width: 80, height: 100, background: 'rgba(139,26,26,0.15)', border: '1px solid rgba(139,26,26,0.4)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: '40%', top: '35%', width: 120, height: 100, background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: '65%', top: '5%', width: 60, height: 40, background: 'rgba(100,100,100,0.2)', border: '1px solid rgba(100,100,100,0.4)', borderRadius: 2 }} />

        {/* 热点 */}
        {caseData.scene.hotspots.map((hs) => {
          const isFound = discovered.includes(hs.revealsEvidenceId);
          const canDiscover = !hs.requires || hs.requires.every((r) => discovered.includes(r));
          return (
            <button
              key={hs.id}
              onClick={() => handleHotspot(hs.revealsEvidenceId, hs.requires)}
              title={hs.name}
              style={{
                position: 'absolute',
                left: `${hs.position.x}%`,
                top: `${hs.position.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: isFound
                  ? 'rgba(201,169,110,0.2)'
                  : canDiscover
                    ? 'rgba(139,26,26,0.3)'
                    : 'rgba(80,80,80,0.2)',
                border: `2px solid ${isFound ? 'var(--gold)' : canDiscover ? 'var(--blood-light)' : 'rgba(80,80,80,0.5)'}`,
                cursor: canDiscover ? 'pointer' : 'not-allowed',
                animation: canDiscover && !isFound ? 'pulseGlow 2s infinite' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isFound ? 'var(--gold)' : canDiscover ? 'var(--blood-light)' : 'var(--text-faint)',
                fontSize: 16,
                fontWeight: 'bold',
              }}
            >
              {isFound ? '✓' : '?'}
            </button>
          );
        })}

        {message && (
          <div
            className="fade-in"
            style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(13,13,13,0.9)',
              border: '1px solid var(--gold)',
              padding: '10px 20px',
              borderRadius: 4,
              color: 'var(--gold-light)',
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              whiteSpace: 'nowrap',
            }}
          >
            {message}
          </div>
        )}
      </div>

      {/* 热点列表 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {caseData.scene.hotspots.map((hs) => {
          const ev = caseData.evidence.find((e) => e.id === hs.revealsEvidenceId);
          const isFound = discovered.includes(hs.revealsEvidenceId);
          const canDisc = !hs.requires || hs.requires.every((r) => discovered.includes(r));
          return (
            <div
              key={hs.id}
              className="glass-card"
              style={{
                padding: 16,
                opacity: canDisc ? 1 : 0.5,
                borderColor: isFound ? 'var(--gold-dim)' : 'var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span className="serif" style={{ color: 'var(--gold-light)', fontSize: 15 }}>{hs.name}</span>
                {isFound && <span className="tag tag-gold" style={{ fontSize: 10 }}>已发现</span>}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>{hs.description}</p>
              {ev && isFound && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gold)', fontStyle: 'italic' }}>
                  → 证据：{ev.name}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- 证据库 ----

function EvidenceTab({
  caseData,
  discovered,
  examined,
}: {
  caseData: Case;
  discovered: string[];
  examined: string[];
}) {
  if (discovered.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <p className="serif" style={{ color: 'var(--text-dim)', fontSize: 16 }}>
          尚未发现任何证据。前往"案发现场"点击可疑之处开始调查。
        </p>
      </div>
    );
  }

  const discoveredEvidence = caseData.evidence.filter((e) => discovered.includes(e.id));

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="text-dim" style={{ fontSize: 14 }}>
          已发现 {discoveredEvidence.length} 件证据。点击"深入分析"可获取更多细节。
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {discoveredEvidence.map((ev) => (
          <EvidenceCard
            key={ev.id}
            evidence={ev}
            caseId={caseData.id}
            examined={examined.includes(ev.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ---- 嫌疑人 ----

function SuspectsTab({ caseData }: { caseData: Case }) {
  return (
    <div>
      <p className="text-dim" style={{ fontSize: 14, marginBottom: 20 }}>
        以下是案发时在场的所有人。仔细比对他们的动机、不在场证明与物证之间的关联。
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 18 }}>
        {caseData.suspects.map((s) => (
          <SuspectCard key={s.id} suspect={s} />
        ))}
      </div>
    </div>
  );
}

// ---- 证词 ----

function TestimoniesTab({
  caseData,
  readTestimonies,
}: {
  caseData: Case;
  readTestimonies: string[];
}) {
  return (
    <div>
      <p className="text-dim" style={{ fontSize: 14, marginBottom: 20 }}>
        每个人都在陈述自己的版本。注意证词之间、证词与物证之间的矛盾。
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {caseData.testimonies.map((t) => {
          const isRead = readTestimonies.includes(t.id);
          return (
            <div
              key={t.id}
              className="paper-card"
              style={{ padding: 20, opacity: isRead ? 1 : 0.92 }}
              onClick={() => gameStore.readTestimony(caseData.id, t.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div>
                  <span className="serif" style={{ fontSize: 16, color: 'var(--ink)', fontWeight: 700 }}>{t.speakerName}</span>
                  <span style={{ fontSize: 13, color: '#7a6a4a', marginLeft: 8 }}>{t.speakerRole}</span>
                </div>
                {t.time && <span style={{ fontSize: 11, color: '#7a6a4a', fontFamily: 'var(--font-typewriter)' }}>{t.time}</span>}
              </div>
              <p style={{ fontSize: 14, color: '#3a3326', lineHeight: 1.8, fontStyle: 'italic' }}>"{t.content}"</p>

              {(t.contradicts?.length || t.supports?.length) ? (
                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {t.contradicts?.map((cid) => (
                    <span key={cid} className="tag tag-blood" style={{ fontSize: 10 }}>矛盾</span>
                  ))}
                  {t.supports?.map((sid) => (
                    <span key={sid} className="tag tag-gold" style={{ fontSize: 10 }}>佐证</span>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
