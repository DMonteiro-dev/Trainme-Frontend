import axios from 'axios';
import { Link } from 'react-router-dom';
import { useState, type CSSProperties, type FormEvent } from 'react';
import {
  Calendar,
  Clock,
  Dumbbell,
  TrendingUp,
  User,
  ChevronRight,
  Activity,
  List,
  PlusCircle,
  Mail
} from 'lucide-react';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Page } from '../../design-system/components/Page';
import { theme } from '../../design-system/theme';
import { useAuth } from '../../context/AuthContext';
import { useClientProfile, useClientTrainingPlanSummary, useLatestProgressLog, useUpcomingSessions } from '../../hooks/useClientQueries';
import { useAvailableTrainers } from '../../hooks/useTrainerQueries';
import { useClientTrainerChangeRequests, useCreateTrainerChangeRequest } from '../../hooks/useTrainerChangeRequests';
import type { TrainingSession, TrainerProfile } from '../../types';
import { SessionStatsGraph } from '../../components/analytics/SessionStatsGraph';

const dateTimeFormatter = new Intl.DateTimeFormat('pt-PT', {
  dateStyle: 'full',
  timeStyle: 'short',
});

const formatSessionDate = (session?: TrainingSession) => {
  if (!session) return 'Sem sessão agendada';
  if (session.date && session.startTime) {
    const date = new Date(`${session.date}T${session.startTime}`);
    return dateTimeFormatter.format(date);
  }

  return dateTimeFormatter.format(new Date(session.date ?? session.startTime ?? Date.now()));
};

const requestStatusLabels = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
} as const;

const requestStatusTone = {
  pending: 'default',
  approved: 'success',
  rejected: 'danger',
} as const;

// Styles moved inside component to access currentColors

const resolveTrainerOption = (trainer: TrainerProfile) => {
  if (typeof trainer.userId === 'string') {
    return {
      id: trainer.userId,
      label: `Treinador ${trainer.userId.slice(-4)}`,
    };
  }
  const user = trainer.userId;
  return {
    id: user.id ?? user._id ?? trainer.id,
    label: user.name ?? 'Treinador sem nome',
  };
};

import { useTheme } from '../../context/ThemeContext';

const ClientDashboardPage = () => {
  const { user } = useAuth();
  const { currentColors } = useTheme();
  const { data: profile, isLoading: loadingProfile } = useClientProfile();
  // Use summary hook for faster load
  const { data: trainingPlan, isLoading: loadingPlan } = useClientTrainingPlanSummary();
  const { data: upcomingSessions, isLoading: loadingSessions } = useUpcomingSessions();
  const { data: latestProgress, isLoading: loadingProgress } = useLatestProgressLog();
  const { data: trainerRequests, isLoading: loadingRequests } = useClientTrainerChangeRequests();
  const { mutateAsync: submitChangeRequest, isPending: submittingRequest } = useCreateTrainerChangeRequest();

  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [preferredTrainerId, setPreferredTrainerId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const modalOverlayStyles: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  };

  const modalStyles: CSSProperties = {
    background: currentColors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.md,
    width: '100%',
    maxWidth: '560px',
    boxShadow: '0 16px 36px rgba(15, 23, 42, 0.45)',
  };

  // Defer fetching available trainers until modal is open
  const { data: availableTrainers, isLoading: loadingAvailableTrainers } = useAvailableTrainers(isRequestModalOpen);

  const hasPendingRequest = (trainerRequests ?? []).some((request) => request.status === 'pending');

  const isLoading = loadingProfile || loadingPlan || loadingSessions || loadingProgress;

  // Skeleton Loading Component
  if (isLoading) {
    return (
      <Page title={`Olá, ${user?.name ?? 'atleta'}`} description="A carregar o teu painel...">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: theme.spacing.lg }}>
          {[1, 2, 3].map(i => (
            <Card key={i} style={{ height: 150, background: currentColors.surfaceAlt }}>
              <div style={{ height: 20, width: '60%', background: currentColors.border, marginBottom: 10, borderRadius: 4 }}></div>
              <div style={{ height: 15, width: '40%', background: currentColors.border, borderRadius: 4 }}></div>
            </Card>
          ))}
        </div>
      </Page>
    );
  }

  const nextSession = upcomingSessions?.[0];
  const activePlan = trainingPlan;
  // Only map trainers if they are loaded
  const trainerOptions = availableTrainers?.map(resolveTrainerOption) ?? [];

  const openRequestModal = () => {
    if (hasPendingRequest) return;
    setRequestReason('');
    setPreferredTrainerId('');
    setFormError(null);
    setRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setRequestModalOpen(false);
    setFormError(null);
  };

  const handleRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requestReason.trim()) {
      setFormError('Explica brevemente o motivo do pedido.');
      return;
    }
    if (hasPendingRequest) {
      setFormError('Já tens um pedido pendente. Aguarda a decisão do admin.');
      return;
    }

    try {
      await submitChangeRequest({
        reason: requestReason,
        requestedTrainerId: preferredTrainerId || null,
      });
      closeRequestModal();
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        const message = (error.response?.data as { message?: string })?.message;
        setFormError(message ?? 'Não foi possível enviar o pedido. Tenta novamente.');
        return;
      }
      setFormError('Não foi possível enviar o pedido. Tenta novamente.');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <Page
      title={`${getGreeting()}, ${user?.name?.split(' ')[0] ?? 'Atleta'}!`}
      description="Vamos treinar? Aqui tens o resumo da tua atividade."
    >
      {/* Key Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
        }}
      >
        {/* Next Session Card */}
        <Card style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md }}>
            <div>
              <h3 style={{ margin: 0, fontSize: theme.typography.sizes.md, color: currentColors.textMuted }}>Próxima Sessão</h3>
              {nextSession ? (
                <>
                  <p style={{ margin: `${theme.spacing.xs} 0 0`, fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold }}>
                    {new Date(nextSession.date).toLocaleDateString('pt-PT', { weekday: 'long' })}
                  </p>
                  <p style={{ margin: 0, fontSize: theme.typography.sizes.xl, color: theme.colors.primary }}>
                    {nextSession.startTime?.slice(0, 5) ?? 'Horário a definir'}
                  </p>
                </>
              ) : (
                <p style={{ margin: `${theme.spacing.sm} 0 0`, color: currentColors.text }}>Sem sessões agendadas</p>
              )}
            </div>
            <div style={{ padding: theme.spacing.sm, background: currentColors.surfaceAlt, borderRadius: '50%' }}>
              <Calendar size={24} color={theme.colors.primary} />
            </div>
          </div>

          {nextSession && (
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, color: currentColors.textMuted, fontSize: theme.typography.sizes.sm }}>
              <User size={14} />
              <span>{nextSession.trainer?.name ?? 'Treinador'}</span>
              <span style={{ margin: '0 4px' }}>•</span>
              <span>{nextSession.type}</span>
            </div>
          )}
        </Card>

        {/* Active Plan Card */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md }}>
            <div>
              <h3 style={{ margin: 0, fontSize: theme.typography.sizes.md, color: currentColors.textMuted }}>Plano Ativo</h3>
              {activePlan ? (
                <>
                  <p style={{ margin: `${theme.spacing.xs} 0 0`, fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold }}>
                    {activePlan.name}
                  </p>
                  <p style={{ margin: 0, color: currentColors.textMuted, fontSize: theme.typography.sizes.sm }}>
                    {activePlan.difficulty ?? 'Nível não definido'}
                  </p>
                </>
              ) : (
                <p style={{ margin: `${theme.spacing.sm} 0 0`, color: currentColors.text }}>Nenhum plano ativo</p>
              )}
            </div>
            <div style={{ padding: theme.spacing.sm, background: currentColors.surfaceAlt, borderRadius: '50%' }}>
              <Activity size={24} color={currentColors.success} />
            </div>
          </div>

          {activePlan && activePlan.myProgress && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: theme.typography.sizes.sm }}>
                <span>Progresso</span>
                <span>{activePlan.myProgress.completionRate ?? 0}%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: currentColors.surfaceAlt, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${activePlan.myProgress.completionRate ?? 0}%`, height: '100%', background: currentColors.success, borderRadius: 3 }} />
              </div>
            </div>
          )}
        </Card>

        {/* Latest Progress Card */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md }}>
            <div>
              <h3 style={{ margin: 0, fontSize: theme.typography.sizes.md, color: currentColors.textMuted }}>Último Registo</h3>
              {latestProgress ? (
                <>
                  <p style={{ margin: `${theme.spacing.xs} 0 0`, fontSize: '2.5rem', fontWeight: theme.typography.weights.bold }}>
                    {latestProgress.weight} <span style={{ fontSize: theme.typography.sizes.md, color: currentColors.textMuted }}>kg</span>
                  </p>
                  {latestProgress.bodyFatPercent && (
                    <p style={{ margin: 0, color: currentColors.textMuted, fontSize: theme.typography.sizes.sm }}>
                      {latestProgress.bodyFatPercent}% Gordura Corporal
                    </p>
                  )}
                </>
              ) : (
                <p style={{ margin: `${theme.spacing.sm} 0 0`, color: currentColors.text }}>Sem registos</p>
              )}
            </div>
            <div style={{ padding: theme.spacing.sm, background: currentColors.surfaceAlt, borderRadius: '50%' }}>
              <TrendingUp size={24} color={currentColors.warning} />
            </div>
          </div>
          {latestProgress && (
            <p style={{ margin: 0, fontSize: theme.typography.sizes.xs, color: currentColors.textMuted }}>
              Atualizado a {new Date(latestProgress.date).toLocaleDateString('pt-PT')}
            </p>
          )}
        </Card>
      </div>

      <div style={{ marginBottom: theme.spacing.xl }}>
        <SessionStatsGraph />
      </div>

      {/* Quick Actions */}
      <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md }}>Ações Rápidas</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
        <Link to="/app/progress" style={{ textDecoration: 'none' }}>
          <Card
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.md,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              border: `1px solid ${theme.colors.primary}`,
              background: `linear-gradient(to right, ${currentColors.surface}, ${currentColors.surfaceAlt})`
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ padding: theme.spacing.sm, background: theme.colors.primary, borderRadius: theme.radii.md, color: 'white' }}>
              <PlusCircle size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: theme.typography.weights.bold, color: currentColors.text }}>Registar Progresso</p>
              <p style={{ margin: 0, fontSize: theme.typography.sizes.xs, color: currentColors.textMuted }}>Atualiza o teu peso</p>
            </div>
          </Card>
        </Link>

        <Link to="/app/plans" style={{ textDecoration: 'none' }}>
          <Card
            style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ padding: theme.spacing.sm, background: currentColors.surfaceAlt, borderRadius: theme.radii.md }}>
              <List size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: theme.typography.weights.bold, color: currentColors.text }}>Ver Planos</p>
              <p style={{ margin: 0, fontSize: theme.typography.sizes.xs, color: currentColors.textMuted }}>Consulta os teus treinos</p>
            </div>
          </Card>
        </Link>

        <Link to="/app/sessions" style={{ textDecoration: 'none' }}>
          <Card
            style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ padding: theme.spacing.sm, background: currentColors.surfaceAlt, borderRadius: theme.radii.md }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: theme.typography.weights.bold, color: currentColors.text }}>Ver Sessões</p>
              <p style={{ margin: 0, fontSize: theme.typography.sizes.xs, color: currentColors.textMuted }}>Próximos agendamentos</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Trainer Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: theme.spacing.lg }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <h3 style={{ margin: 0 }}>O teu Treinador</h3>
            {profile?.trainer && (
              <Badge tone="success">Ativo</Badge>
            )}
          </div>

          {profile?.trainer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: currentColors.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: theme.typography.sizes.xl, fontWeight: 'bold' }}>
                {profile.trainer.name.charAt(0)}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold }}>{profile.trainer.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, color: currentColors.textMuted, marginTop: 4 }}>
                  <Mail size={14} />
                  <span style={{ fontSize: theme.typography.sizes.sm }}>{profile.trainer.email}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: theme.spacing.lg, background: currentColors.surfaceAlt, borderRadius: theme.radii.md, marginBottom: theme.spacing.lg }}>
              <User size={48} color={currentColors.textMuted} style={{ marginBottom: theme.spacing.sm }} />
              <p style={{ margin: 0, color: currentColors.textMuted }}>Ainda não tens treinador atribuído.</p>
            </div>
          )}

          <div style={{ borderTop: `1px solid ${currentColors.border}`, paddingTop: theme.spacing.md }}>
            <Button
              variant="secondary"
              fullWidth
              onClick={openRequestModal}
              disabled={hasPendingRequest || loadingRequests}
              style={{ justifyContent: 'space-between' }}
            >
              <span>{hasPendingRequest ? 'Pedido pendente...' : 'Pedir troca de treinador'}</span>
              <ChevronRight size={16} />
            </Button>

            {hasPendingRequest && (
              <p style={{ margin: `${theme.spacing.xs} 0 0`, color: currentColors.warning, fontSize: theme.typography.sizes.sm, textAlign: 'center' }}>
                Já tens um pedido em análise.
              </p>
            )}
          </div>
        </Card>

        {/* Change Requests History */}
        <Card>
          <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md }}>Histórico de Pedidos</h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            {loadingRequests ? (
              <li style={{ color: currentColors.textMuted }}>A carregar pedidos...</li>
            ) : trainerRequests?.length ? (
              trainerRequests.map((request) => {
                const requestedTrainerName = request.requestedTrainer?.name ?? 'Ficar sem treinador';
                return (
                  <li
                    key={request.id}
                    style={{
                      border: `1px solid ${currentColors.border}`,
                      borderRadius: theme.radii.md,
                      padding: theme.spacing.sm,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: theme.typography.weights.medium }}>{requestedTrainerName}</p>
                      <p style={{ margin: 0, fontSize: theme.typography.sizes.xs, color: currentColors.textMuted }}>
                        {new Date(request.createdAt).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <Badge tone={requestStatusTone[request.status]}>{requestStatusLabels[request.status]}</Badge>
                  </li>
                );
              })
            ) : (
              <li style={{ textAlign: 'center', padding: theme.spacing.lg, color: currentColors.textMuted }}>
                Nenhum pedido recente.
              </li>
            )}
          </ul>
        </Card>
      </div>

      {isRequestModalOpen && (
        <div style={modalOverlayStyles} role="dialog" aria-modal="true">
          <div style={modalStyles}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <div>
                <h3 style={{ margin: 0 }}>Pedir troca de treinador</h3>
                <p style={{ margin: 0, color: currentColors.textMuted }}>O teu pedido será analisado pelo admin.</p>
              </div>
              <Button variant="secondary" onClick={closeRequestModal}>
                Fechar
              </Button>
            </div>
            {hasPendingRequest && (
              <p style={{ margin: `0 0 ${theme.spacing.sm}`, color: currentColors.textMuted }}>
                Já existe um pedido pendente. Podes rever o histórico abaixo, mas aguarda pela decisão antes de enviar outro.
              </p>
            )}
            <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              <div>
                <label htmlFor="preferredTrainer" style={{ display: 'inline-block', marginBottom: theme.spacing.xs }}>
                  Treinador preferido (opcional)
                </label>
                <select
                  id="preferredTrainer"
                  value={preferredTrainerId}
                  onChange={(event) => setPreferredTrainerId(event.target.value)}
                  disabled={loadingAvailableTrainers}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    border: `1px solid ${currentColors.border}`,
                    borderRadius: theme.radii.md,
                    background: currentColors.surfaceAlt,
                  }}
                >
                  <option value="">Quero ficar sem treinador</option>
                  {trainerOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {loadingAvailableTrainers && (
                  <p
                    style={{
                      margin: `${theme.spacing.xs} 0 0`,
                      color: currentColors.textMuted,
                      fontSize: theme.typography.sizes.sm,
                    }}
                  >
                    A carregar treinadores disponíveis...
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="requestReason" style={{ display: 'inline-block', marginBottom: theme.spacing.xs }}>
                  Motivo do pedido
                </label>
                <textarea
                  id="requestReason"
                  value={requestReason}
                  onChange={(event) => setRequestReason(event.target.value)}
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: theme.radii.md,
                    border: `1px solid ${currentColors.border}`,
                    background: currentColors.surfaceAlt,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                  placeholder="Explica o que motivou esta mudança..."
                />
              </div>

              {formError && (
                <p style={{ margin: 0, color: currentColors.danger, fontSize: theme.typography.sizes.sm }}>{formError}</p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.sm }}>
                <Button type="button" variant="secondary" onClick={closeRequestModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submittingRequest || hasPendingRequest}>
                  {submittingRequest ? 'A enviar...' : hasPendingRequest ? 'Aguarda aprovação' : 'Submeter pedido'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Page>
  );
};

export default ClientDashboardPage;
