import type { Suspect } from '../../types';

interface SuspectCardProps {
  suspect: Suspect;
  selected?: boolean;
  onClick?: () => void;
  selectable?: boolean;
}

const AVATAR_COLORS: Record<string, string> = {
  sus_liwei: '#1a2744',
  sus_yuqing: '#3a1a2a',
  sus_wang: '#1a3a2a',
  sus_zhangfu: '#2a2a1a',
};

export function SuspectCard({ suspect, selected, onClick, selectable }: SuspectCardProps) {
  const bg = AVATAR_COLORS[suspect.id] ?? '#1a2744';

  return (
    <div
      onClick={selectable ? onClick : undefined}
      className="glass-card"
      style={{
        padding: 18,
        cursor: selectable ? 'pointer' : 'default',
        borderColor: selected ? 'var(--blood-light)' : 'var(--border)',
        boxShadow: selected ? 'var(--shadow-blood)' : 'var(--shadow-deep)',
        transition: 'all 0.25s var(--ease)',
        transform: selected ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${bg}, #000)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-serif)',
            fontSize: 22,
            color: 'var(--gold)',
            border: '2px solid var(--border-strong)',
            flexShrink: 0,
          }}
        >
          {suspect.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--gold-light)' }}>
              {suspect.name}
            </h4>
            <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{suspect.role}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 10 }}>
            {suspect.description}
          </p>

          <div style={{ marginBottom: 6 }}>
            <span className="tag tag-blood" style={{ fontSize: 10 }}>动机</span>
            <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 4, lineHeight: 1.6 }}>
              {suspect.motive}
            </p>
          </div>

          <div>
            <span className="tag tag-dim" style={{ fontSize: 10 }}>不在场证明</span>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.6, fontStyle: 'italic' }}>
              "{suspect.alibi}"
            </p>
          </div>

          {suspect.detail && Object.keys(suspect.detail).length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Object.entries(suspect.detail).map(([k, v]) => (
                <span key={k} style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                  <span style={{ color: 'var(--gold-dim)' }}>{k}：</span>
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
