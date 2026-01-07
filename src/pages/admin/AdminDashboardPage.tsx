import { useState, useMemo } from 'react';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { theme } from '../../design-system/theme';
import { useAdminClients, useAdminTrainers } from '../../hooks/useAdminRelations';
import { useAdminTrainerChangeRequests } from '../../hooks/useTrainerChangeRequests';
import { Users, Dumbbell, UserCheck, UserX, AlertCircle, ArrowRight, Shield, Activity, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ReviewRequestModal } from './components/ReviewRequestModal';
import { TrainerChangeRequest } from '../../types';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { currentColors } = useTheme();
  const { data: trainers } = useAdminTrainers();
  const { data: clients } = useAdminClients();
  const { data: pendingRequests } = useAdminTrainerChangeRequests({ status: 'pending' });

  const [selectedRequest, setSelectedRequest] = useState<TrainerChangeRequest | null>(null);

  const totalTrainers = trainers?.length ?? 0;
  const totalClients = clients?.length ?? 0;
  const assignedClients = clients?.filter((client) => Boolean(client.trainerId)).length ?? 0;
  const unassignedClients = (clients?.length ?? 0) - assignedClients;
  const pendingCount = pendingRequests?.length ?? 0;

  const stats = [
    {
      label: 'Total de Treinadores',
      value: totalTrainers,
      icon: Dumbbell,
      color: currentColors.primary,
      bg: `${currentColors.primary}15`,
    },
    {
      label: 'Total de Clientes',
      value: totalClients,
      icon: Users,
      color: currentColors.secondary,
      bg: `${currentColors.secondary}15`,
    },
    {
      label: 'Clientes Atribuídos',
      value: assignedClients,
      icon: UserCheck,
      color: currentColors.success,
      bg: `${currentColors.success}15`,
    },
    {
      label: 'Sem Treinador',
      value: unassignedClients,
      icon: UserX,
      color: unassignedClients > 0 ? currentColors.warning : currentColors.textMuted,
      bg: unassignedClients > 0 ? `${currentColors.warning}15` : currentColors.surfaceAlt,
    },
    {
      label: 'Pedidos Pendentes',
      value: pendingCount,
      icon: AlertCircle,
      color: pendingCount > 0 ? currentColors.danger : currentColors.textMuted,
      bg: pendingCount > 0 ? `${currentColors.danger}15` : currentColors.surfaceAlt,
    },
  ];

  return (
    <Page title="Painel Administrativo" description="Visão geral do sistema e gestão de recursos.">
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: theme.spacing.lg, marginBottom: theme.spacing.xl }}>
        {stats.map((stat, index) => (
          <Card key={index} style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{
              padding: theme.spacing.md,
              borderRadius: '50%',
              background: stat.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <stat.icon size={24} color={stat.color} />
            </div>
            <div>
              <p style={{ margin: 0, color: currentColors.textMuted, fontSize: '0.85rem', fontWeight: 500 }}>{stat.label}</p>
              <h2 style={{ margin: 0, fontSize: '1.75rem', color: currentColors.text }}>{stat.value}</h2>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) minmax(280px, 1fr)', gap: theme.spacing.xl, alignItems: 'start' }}>

        {/* Pending Requests Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <Activity size={20} color={currentColors.primary} />
              Pedidos de Alteração
            </h3>
            {pendingCount > 5 && (
              <Button variant="secondary" size="sm" onClick={() => navigate('/app/admin/relations')}>
                Ver Todos
              </Button>
            )}
          </div>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: currentColors.surfaceAlt, borderBottom: `1px solid ${currentColors.border}` }}>
                  <th style={{ padding: theme.spacing.md, fontSize: '0.85rem', color: currentColors.textMuted, fontWeight: 600 }}>CLIENTE</th>
                  <th style={{ padding: theme.spacing.md, fontSize: '0.85rem', color: currentColors.textMuted, fontWeight: 600 }}>TREINADOR ATUAL</th>
                  <th style={{ padding: theme.spacing.md, fontSize: '0.85rem', color: currentColors.textMuted, fontWeight: 600 }}>NOVO TREINADOR</th>
                  <th style={{ padding: theme.spacing.md, fontSize: '0.85rem', color: currentColors.textMuted, fontWeight: 600 }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests?.length ? (
                  pendingRequests.slice(0, 5).map((request) => (
                    <tr key={request.id} style={{ borderBottom: `1px solid ${currentColors.border}` }}>
                      <td style={{ padding: theme.spacing.md, fontWeight: 500 }}>{request.client?.name ?? 'N/A'}</td>
                      <td style={{ padding: theme.spacing.md, color: currentColors.textMuted }}>{request.currentTrainer?.name ?? '—'}</td>
                      <td style={{ padding: theme.spacing.md, color: currentColors.primary, fontWeight: 500 }}>{request.requestedTrainer?.name ?? 'Indefinido'}</td>
                      <td style={{ padding: theme.spacing.md }}>
                        <Button size="sm" variant="secondary" onClick={() => setSelectedRequest(request)}>
                          <MessageSquare size={14} style={{ marginRight: 6 }} />
                          Responder
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: theme.spacing.xl, textAlign: 'center', color: currentColors.textMuted }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.spacing.sm }}>
                        <UserCheck size={32} color={currentColors.success} style={{ opacity: 0.5 }} />
                        <p style={{ margin: 0 }}>Não existem pedidos pendentes.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <h3 style={{ margin: 0 }}>Acesso Rápido</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <Card
              onClick={() => navigate('/app/admin/users')}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: `1px solid ${theme.colors.border}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                <div style={{ padding: theme.spacing.sm, background: `${currentColors.primary}15`, borderRadius: theme.radii.md }}>
                  <Shield size={20} color={currentColors.primary} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Gerir Utilizadores</div>
                  <div style={{ fontSize: '0.85rem', color: currentColors.textMuted }}>Criar, editar e bloquear contas</div>
                </div>
              </div>
              <ArrowRight size={16} color={currentColors.textMuted} />
            </Card>

            <Card
              onClick={() => navigate('/app/admin/relations')}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: `1px solid ${currentColors.border}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                <div style={{ padding: theme.spacing.sm, background: `${currentColors.secondary}15`, borderRadius: theme.radii.md }}>
                  <Users size={20} color={currentColors.secondary} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Relações e Pedidos</div>
                  <div style={{ fontSize: '0.85rem', color: currentColors.textMuted }}>Atribuir treinadores e aprovar pedidos</div>
                </div>
              </div>
              <ArrowRight size={16} color={currentColors.textMuted} />
            </Card>
          </div>
        </div>

      </div>

      {selectedRequest && (
        <ReviewRequestModal
          request={selectedRequest}
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </Page>
  );
};

export default AdminDashboardPage;
