import { useState } from 'react';
import type { Evidence } from '../../types';
import { gameStore } from '../../store/gameStore';

interface EvidenceCardProps {
  evidence: Evidence;
  caseId: string;
  examined: boolean;
}

const TYPE_LABEL: Record<Evidence['type'], string> = {
  physical: '物证',
  document: '文书',
  testimony: '证词',
  digital: '电子',
  environmental: '环境',
};

const TYPE_ICON: Record<Evidence['type'], string> = {
  physical: '🔍',
  document: '📄',
  testimony: '💬',
  digital: '📹',
  environmental: '🌧️',
};

export function EvidenceCard({ evidence, caseId, examined }: EvidenceCardProps) {
  const [showAnalysis, setShowAnalysis] = useState(examined);

  const handleExamine = () => {
    if (!showAnalysis) {
      gameStore.examineEvidence(caseId, evidence.id);
      setShowAnalysis(true);
    } else {
      setShowAnalysis(false);
    }
  };

  return (
    <div
      className="paper-card fade-in"
      style={{ padding: 18, position: 'relative' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            fontSize: 28,
            lineHeight: 1,
            opacity: 0.8,
          }}
        >
          {TYPE_ICON[evidence.type]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink)', fontWeight: 700 }}>
              {evidence.name}
            </h4>
            <span
              className="tag"
              style={{
                background: 'rgba(139,26,26,0.12)',
                color: 'var(--blood-dark)',
                border: '1px solid rgba(139,26,26,0.25)',
              }}
            >
              {TYPE_LABEL[evidence.type]}
            </span>
          </div>

          <p style={{ fontSize: 14, color: '#3a3326', lineHeight: 1.7 }}>{evidence.description}</p>

          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              color: '#7a6a4a',
              fontFamily: 'var(--font-typewriter)',
              fontStyle: 'italic',
            }}
          >
            来源：{evidence.source}
          </div>

          {showAnalysis && (
            <div
              className="fade-in"
              style={{
                marginTop: 14,
                padding: 12,
                background: 'rgba(139,26,26,0.06)',
                borderLeft: '3px solid var(--blood)',
                borderRadius: 2,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--blood-dark)',
                  fontFamily: 'var(--font-typewriter)',
                  letterSpacing: '0.1em',
                  marginBottom: 6,
                }}
              >
                ◆ 深入分析
              </div>
              <p style={{ fontSize: 14, color: '#2a2418', lineHeight: 1.8 }}>{evidence.analysis}</p>
            </div>
          )}

          <button onClick={handleExamine} className="btn btn-sm" style={{ marginTop: 12 }}>
            {showAnalysis ? '收起分析' : '深入分析'}
          </button>
        </div>
      </div>
    </div>
  );
}
