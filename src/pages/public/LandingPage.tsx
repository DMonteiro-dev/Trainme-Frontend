import { Link } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';
import { ArrowRight, CheckCircle, Activity, Users, Calendar } from 'lucide-react';

const LandingPage = () => {
  const { currentColors, mode } = useTheme();

  const isDark = mode === 'dark';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: currentColors.background }}>
      {/* Navbar */}
      <nav style={{
        padding: `${theme.spacing.md} ${theme.spacing.xl}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${currentColors.border}`,
        background: currentColors.surface
      }}>
        <div style={{ fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.lg, color: currentColors.text }}>
          TrainMe
        </div>
        <div style={{ display: 'flex', gap: theme.spacing.md }}>
          <Link to="/login">
            <Button variant="secondary" style={{ background: 'transparent', border: `1px solid ${currentColors.border}`, color: currentColors.text }}>Entrar</Button>
          </Link>
          <Link to="/register">
            <Button>Começar Agora</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem',
        textAlign: 'center',
        background: isDark
          ? `radial-gradient(circle at 50% 50%, ${theme.colors.surfaceAlt} 0%, ${theme.colors.background} 100%)`
          : `radial-gradient(circle at 50% 50%, #eef2ff 0%, #fff 100%)`
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{
            color: theme.colors.primary,
            fontWeight: theme.typography.weights.semibold,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontSize: theme.typography.sizes.sm,
            display: 'block',
            marginBottom: theme.spacing.md
          }}>
            A plataforma de treino do futuro
          </span>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.1,
            margin: `0 0 ${theme.spacing.lg}`,
            color: currentColors.text,
            fontWeight: 800
          }}>
            Eleva o teu treino <br />
            <span style={{
              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>ao próximo nível</span>
          </h1>
          <p style={{
            fontSize: theme.typography.sizes.lg,
            color: currentColors.textMuted,
            marginBottom: theme.spacing.xl,
            lineHeight: 1.6
          }}>
            Gestão de clientes, planos de treino personalizados e acompanhamento de progresso.
            Tudo numa única plataforma intuitiva e poderosa.
          </p>
          <div style={{ display: 'flex', gap: theme.spacing.md, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register?role=client">
              <Button style={{ padding: '1rem 2rem', fontSize: theme.typography.sizes.md }}>
                Sou Cliente
              </Button>
            </Link>
            <Link to="/register?role=trainer">
              <Button variant="secondary" style={{
                padding: '1rem 2rem',
                fontSize: theme.typography.sizes.md,
                background: currentColors.surface,
                border: `1px solid ${currentColors.border}`,
                color: currentColors.text
              }}>
                Sou Treinador
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '4rem 2rem', background: currentColors.surface }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: theme.spacing.xl }}>
            {[
              { icon: Activity, title: 'Planos Personalizados', desc: 'Cria e recebe planos de treino adaptados aos teus objetivos específicos.' },
              { icon: Calendar, title: 'Gestão de Sessões', desc: 'Agenda e gere as tuas sessões de treino com facilidade e sem conflitos.' },
              { icon: Users, title: 'Conexão Direta', desc: 'Comunicação fluida entre treinadores e clientes para melhores resultados.' }
            ].map((feature, i) => (
              <div key={i} style={{
                padding: theme.spacing.xl,
                borderRadius: theme.radii.md,
                background: currentColors.surfaceAlt,
                border: `1px solid ${currentColors.border}`,
                transition: 'transform 0.2s',
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: theme.radii.md,
                  background: `rgba(122, 90, 248, 0.1)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.spacing.md,
                  color: theme.colors.primary
                }}>
                  <feature.icon size={24} />
                </div>
                <h3 style={{ margin: `0 0 ${theme.spacing.sm}`, color: currentColors.text, fontSize: theme.typography.sizes.lg }}>{feature.title}</h3>
                <p style={{ margin: 0, color: currentColors.textMuted, lineHeight: 1.5 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section style={{ padding: '6rem 2rem', background: currentColors.background }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: theme.spacing.xl, color: currentColors.text }}>Como funciona</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
            {['Cria a tua conta gratuita', 'Define os teus objetivos', 'Começa a treinar e evoluir'].map((step, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.md,
                padding: theme.spacing.lg,
                background: currentColors.surface,
                borderRadius: theme.radii.md,
                border: `1px solid ${currentColors.border}`
              }}>
                <CheckCircle color={theme.colors.success} size={24} />
                <span style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.medium, color: currentColors.text }}>{step}</span>
                <ArrowRight style={{ marginLeft: 'auto', color: currentColors.textMuted }} size={20} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: `1px solid ${currentColors.border}`,
        color: currentColors.textMuted,
        background: currentColors.surface
      }}>
        <p>© 2024 TrainMe. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
