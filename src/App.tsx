import { useGameState } from './store/gameStore';
import { getCaseById } from './data';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { CaseList } from './pages/CaseList';
import { Briefing } from './pages/Briefing';
import { Investigation } from './pages/Investigation';
import { Accusation } from './pages/Accusation';
import { Review } from './pages/Review';

/**
 * 应用根组件。
 * 路由完全由 gameStore 中的 currentPage 驱动，确保刷新后能恢复到正确页面。
 */
function App() {
  const state = useGameState();
  const activeCase = state.activeCaseId ? getCaseById(state.activeCaseId) : undefined;

  let pageTitle = '';
  let content: React.ReactNode;

  switch (state.currentPage) {
    case 'home':
      content = <Home />;
      break;
    case 'caseList':
      pageTitle = 'CASE ARCHIVES';
      content = <CaseList />;
      break;
    case 'briefing':
      if (!activeCase) {
        content = <Home />;
      } else {
        pageTitle = `CASE BRIEFING · ${activeCase.id.toUpperCase()}`;
        content = <Briefing caseData={activeCase} />;
      }
      break;
    case 'investigation':
      if (!activeCase) {
        content = <CaseList />;
      } else {
        pageTitle = `INVESTIGATION · ${activeCase.id.toUpperCase()}`;
        content = <Investigation caseData={activeCase} />;
      }
      break;
    case 'accusation':
      if (!activeCase) {
        content = <CaseList />;
      } else {
        pageTitle = `FINAL ACCUSATION · ${activeCase.id.toUpperCase()}`;
        content = <Accusation caseData={activeCase} />;
      }
      break;
    case 'review':
      if (!activeCase) {
        content = <CaseList />;
      } else {
        pageTitle = `CASE REVIEW · ${activeCase.id.toUpperCase()}`;
        content = <Review caseData={activeCase} />;
      }
      break;
    default:
      content = <Home />;
  }

  return (
    <>
      <Header title={pageTitle} />
      <main style={{ flex: 1 }}>{content}</main>
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '20px 0',
          textAlign: 'center',
          color: 'var(--text-faint)',
          fontSize: 12,
          fontFamily: 'var(--font-typewriter)',
          letterSpacing: '0.1em',
        }}
      >
        DETECTIVE CHARLOTTE · 神探夏洛特 — 真相，藏在细节之中。
      </footer>
    </>
  );
}

export default App;
