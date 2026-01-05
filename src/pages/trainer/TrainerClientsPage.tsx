import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { theme } from '../../design-system/theme';
import { useTrainerClients, useTrainerPlans, useCreateClient, useUnassignedClients, useAssignClient } from '../../hooks/useTrainerQueries';

import { useState } from 'react';
import { Button } from '../../design-system/components/Button';
import { Modal } from '../../design-system/components/Modal';
import { ClientScheduleManager } from '../../components/trainer/clients/ClientScheduleManager';
import { Calendar, UserPlus, Plus, BarChart2 } from 'lucide-react';
import { TextField } from '../../design-system/components/TextField';
import { SessionStatsGraph } from '../../components/analytics/SessionStatsGraph';

const TrainerClientsPage = () => {
  const [activeTab, setActiveTab] = useState<'my-clients' | 'available'>('my-clients');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClientForStats, setSelectedClientForStats] = useState<string | null>(null);

  // Queries & Mutations
  const { data: clients, isLoading: isLoadingClients } = useTrainerClients();
  const { data: plans } = useTrainerPlans();
  const { data: unassignedClients, isLoading: isLoadingUnassigned } = useUnassignedClients();

  const createClientMutation = useCreateClient();
  const assignClientMutation = useAssignClient();

  const [selectedClientForSchedule, setSelectedClientForSchedule] = useState<{ clientId: string; planId: string } | null>(null);

  // Form State for new client
  const [newClientData, setNewClientData] = useState({ name: '', email: '', password: '' });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClientMutation.mutateAsync(newClientData);
      setIsCreateModalOpen(false);
      setNewClientData({ name: '', email: '', password: '' });
      setActiveTab('my-clients'); // Switch to my clients to see the new one
    } catch (error) {
      console.error('Failed to create client', error);
      // Ideally show toast error
    }
  };

  const handleAssignClient = async (clientId: string) => {
    try {
      await assignClientMutation.mutateAsync(clientId);
      // Ideally show toast success
    } catch (error) {
      console.error('Failed to assign client', error);
    }
  };

  const derivedClients =
    clients && clients.length
      ? clients
      : plans
        ?.map((plan) => {
          if (typeof plan.clientId === 'string') return null;
          return {
            ...plan.clientId,
            id: plan.clientId._id // Normalize _id to id
          };
        })
        .filter((client): client is NonNullable<typeof client> => Boolean(client)) ?? [];

  if (isLoadingClients) {
    return <div style={{ padding: '2rem' }}>A reunir informação dos clientes...</div>;
  }

  return (
    <Page
      title="Gestão de Clientes"
      description="Gere os teus clientes e encontra novos alunos."
      actions={
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} style={{ marginRight: 8 }} />
          Novo Cliente
        </Button>
      }
    >
      <div style={{ marginBottom: theme.spacing.lg, borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', gap: theme.spacing.lg }}>
        <button
          onClick={() => setActiveTab('my-clients')}
          style={{
            background: 'none',
            border: 'none',
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            borderBottom: activeTab === 'my-clients' ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
            color: activeTab === 'my-clients' ? theme.colors.primary : theme.colors.textMuted,
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Meus Clientes
        </button>
        <button
          onClick={() => setActiveTab('available')}
          style={{
            background: 'none',
            border: 'none',
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            borderBottom: activeTab === 'available' ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
            color: activeTab === 'available' ? theme.colors.primary : theme.colors.textMuted,
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Clientes Disponíveis
        </button>
      </div>

      {activeTab === 'my-clients' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: theme.spacing.lg }}>
          {derivedClients.length ? (
            derivedClients.map((client) => {
              const assignedPlan = plans?.find((plan) => {
                const planClientId = typeof plan.clientId === 'string' ? plan.clientId : plan.clientId._id;
                return planClientId === client.id;
              });

              return (
                <Card key={client.id} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{client.name}</h3>
                    {client.email && (
                      <p style={{ margin: 0, color: theme.colors.textMuted }}>{client.email}</p>
                    )}
                  </div>

                  <div>
                    <p style={{ margin: 0, fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>
                      Último plano:
                    </p>
                    <p style={{ margin: 0, fontWeight: 500 }}>
                      {assignedPlan?.name ?? 'Sem planos associados'}
                    </p>
                  </div>

                  {assignedPlan && (
                    <div style={{ display: 'flex', gap: theme.spacing.sm, marginTop: 'auto' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedClientForSchedule({ clientId: client.id, planId: assignedPlan._id })}
                        style={{ flex: 1 }}
                      >
                        <Calendar size={16} style={{ marginRight: 8 }} />
                        Agendar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedClientForStats(client.id)}
                        title="Ver Estatísticas"
                      >
                        <BarChart2 size={16} />
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })
          ) : (
            <Card>Ainda não tens clientes atribuídos.</Card>
          )}
        </div>
      )}

      {activeTab === 'available' && (
        <>
          {isLoadingUnassigned ? (
            <div>A carregar clientes disponíveis...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: theme.spacing.lg }}>
              {unassignedClients && unassignedClients.length > 0 ? (
                unassignedClients.map((client) => (
                  <Card key={client._id} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{client.name}</h3>
                      <p style={{ margin: 0, color: theme.colors.textMuted }}>{client.email}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: theme.colors.textMuted }}>Registado em: {new Date(client.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssignClient(client._id)}
                      disabled={assignClientMutation.isPending}
                      style={{ marginTop: 'auto' }}
                    >
                      <UserPlus size={16} style={{ marginRight: 8 }} />
                      Associar
                    </Button>
                  </Card>
                ))
              ) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: theme.colors.textMuted }}>Não há clientes disponíveis no momento.</div>
              )}
            </div>
          )}
        </>
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={!!selectedClientForSchedule}
        onClose={() => setSelectedClientForSchedule(null)}
        title=""
        maxWidth="1200px"
      >
        {selectedClientForSchedule && (
          <div style={{ height: '80vh' }}>
            <ClientScheduleManager
              clientId={selectedClientForSchedule.clientId}
              planId={selectedClientForSchedule.planId}
              onClose={() => setSelectedClientForSchedule(null)}
            />
          </div>
        )}
      </Modal>

      {/* Stats Modal */}
      <Modal
        isOpen={!!selectedClientForStats}
        onClose={() => setSelectedClientForStats(null)}
        title="Estatísticas do Cliente"
        maxWidth="800px"
      >
        {selectedClientForStats && (
          <SessionStatsGraph clientId={selectedClientForStats} />
        )}
      </Modal>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registar Novo Cliente"
        maxWidth="500px"
      >
        <form onSubmit={handleCreateClient} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <TextField
            label="Nome"
            value={newClientData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClientData({ ...newClientData, name: e.target.value })}
            required
          />
          <TextField
            label="Email"
            type="email"
            value={newClientData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClientData({ ...newClientData, email: e.target.value })}
            required
          />
          <TextField
            label="Password"
            type="password"
            value={newClientData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClientData({ ...newClientData, password: e.target.value })}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createClientMutation.isPending}>
              {createClientMutation.isPending ? 'A criar...' : 'Criar Cliente'}
            </Button>
          </div>
        </form>
      </Modal>
    </Page>
  );
};

export default TrainerClientsPage;
