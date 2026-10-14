import { gameStore, useGameState } from '../../store/gameStore';
import type { GamePage } from '../../types';

interface HeaderProps {
  title?: string;
}

const NAV_ITEMS: { page: GamePage; label: string }[] = [
  { page: 'home', label: '首页' },
  { page: 'caseList', label: '案件档案' },
];

export function Header({ title }: HeaderProps) {
  const state = useGameState();
  const active = state.activeCaseId;

  const go = (page: GamePage) => {
    if (page === 'caseList') {
      gameStore.setActiveCase(null);
    }
    gameStore.navigate(page);
  };

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(6, 13, 26, 0.85)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
          onClick={() => go('home')}
        >
          <MagnifierIcon />
          <div>
            <div className="typewriter" style={{ fontSize: 18, color: 'var(--gold)', lineHeight: 1.1 }}>
              DETECTIVE CHARLOTTE
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.2em' }}>
              神 探 夏 洛 特
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.page}
              onClick={() => go(item.page)}
              className={`btn btn-sm ${state.currentPage === item.page ? '' : 'btn-ghost'}`}
              style={state.currentPage === item.page ? { background: 'var(--midnight-600)' } : {}}
            >
              {item.label}
            </button>
          ))}
          {active && (
            <span className="tag tag-gold" style={{ marginLeft: 8 }}>
              调查中
            </span>
          )}
        </nav>
      </div>
      {title && (
        <div
          className="container"
          style={{
            paddingBottom: 16,
            fontSize: 12,
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-typewriter)',
            letterSpacing: '0.1em',
          }}
        >
          {title}
        </div>
      )}
    </header>
  );
}

function MagnifierIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="13" cy="13" r="8" stroke="var(--gold)" strokeWidth="2" />
      <line x1="19" y1="19" x2="26" y2="26" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="13" x2="16" y2="13" stroke="var(--blood-light)" strokeWidth="1.5" />
    </svg>
  );
}
