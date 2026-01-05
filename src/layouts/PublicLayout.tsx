import type { CSSProperties } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Container } from '../design-system/components/Container';
import { Button } from '../design-system/components/Button';
import { theme } from '../design-system/theme';
import { useTheme } from '../context/ThemeContext';

const PublicLayout = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const { currentColors } = useTheme();

  if (isLandingPage) {
    return <Outlet />;
  }

  return (
    <div style={{ minHeight: '100vh', background: currentColors.background }}>
      <header
        style={{
          borderBottom: `1px solid ${currentColors.border}`,
          position: 'sticky',
          top: 0,
          backdropFilter: 'blur(8px)',
          background: currentColors.surface, // Simplified to solid surface color for now
          zIndex: 10,
        }}
      >
        <Container
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px',
          }}
        >
          <Link
            to="/"
            style={{
              fontWeight: theme.typography.weights.bold,
              fontSize: theme.typography.sizes.lg,
              color: currentColors.text,
            }}
          >
            TrainMe
          </Link>

          <nav>
            <Link to="/login">
              <Button size="sm" variant="secondary">
                Login
              </Button>
            </Link>
          </nav>
        </Container>
      </header>

      <main style={{ padding: `${theme.spacing.xl} 0` }}>
        <Container>
          <Outlet />
        </Container>
      </main>

      <footer
        style={{
          borderTop: `1px solid ${currentColors.border}`,
          padding: `${theme.spacing.md} 0`,
          color: currentColors.textMuted,
        }}
      >
        <Container style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>© {new Date().getFullYear()} TrainMe</span>
          <span>A tua jornada fitness começa aqui</span>
        </Container>
      </footer>
    </div>
  );
};

export default PublicLayout;
