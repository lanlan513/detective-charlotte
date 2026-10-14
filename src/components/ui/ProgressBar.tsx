interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  variant?: 'gold' | 'blood';
}

export function ProgressBar({ value, label, variant = 'gold' }: ProgressBarProps) {
  const color = variant === 'blood' ? 'var(--blood)' : 'var(--gold)';
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'var(--text-dim)',
            marginBottom: 6,
            fontFamily: 'var(--font-typewriter)',
          }}
        >
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      )}
      <div
        style={{
          height: 6,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            borderRadius: 3,
            transition: 'width 0.5s var(--ease)',
            boxShadow: `0 0 10px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}
