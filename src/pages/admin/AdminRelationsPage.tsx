import { useMemo, useState, type FormEvent } from 'react';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { TextField } from '../../design-system/components/TextField';
import { Modal } from '../../design-system/components/Modal';
import { Badge } from '../../design-system/components/Badge';
import { Avatar } from '../../design-system/components/Avatar';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAdminClients, useAdminTrainers, useSaveRelation } from '../../hooks/useAdminRelations';
import { Search, UserPlus, Users } from 'lucide-react';

const AdminRelationsPage = () => {
  const { currentColors } = useTheme();
  const { data: clients, isLoading: loadingClients } = useAdminClients();
  const { data: trainers } = useAdminTrainers();
  const { mutateAsync: saveRelation, isPending: saving } = useSaveRelation();
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const selectedClient = clients?.find((client) => client.id === selectedClientId);

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    if (!search.trim()) return clients;
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [clients, search]);

  const openModal = (clientId: string, trainerId: string | null) => {
    setSelectedClientId(clientId);
    setSelectedTrainerId(trainerId);
  };

  const closeModal = () => {
    setSelectedClientId(null);
    setSelectedTrainerId(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedClient) return;

    try {
      await saveRelation({
        clientId: selectedClient.id,
        trainerId: selectedTrainerId ?? null,
        action: selectedClient.trainerId ? 'update' : 'create',
      });
      closeModal();
    } catch (error) {
      console.error(error);
      alert('Não foi possível guardar a relação. Tenta novamente.');
    }
  };

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'blocked': return 'danger';
      default: return 'warning';
    }
  };

  return (
    <Page title="Gestão de Relações" description="Associa clientes a treinadores e acompanha a carga de cada treinador.">

      <div style={{ display: 'grid', gap: theme.spacing.lg, gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', marginBottom: theme.spacing.xl }}>
        <Card style={{ background: `linear-gradient(135deg, ${theme.colors.primary}15, ${currentColors.surface})`, border: `1px solid ${theme.colors.primary}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ padding: theme.spacing.md, background: currentColors.surface, borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Users size={24} color={theme.colors.primary} />
            </div>
            <div>
              <p style={{ margin: 0, color: currentColors.textMuted, fontSize: '0.9rem' }}>Total de Clientes</p>
              <h2 style={{ margin: 0, fontSize: '2rem' }}>{clients?.length ?? 0}</h2>
            </div>
          </div>
        </Card>
        <Card style={{ background: `linear-gradient(135deg, ${theme.colors.secondary}15, ${currentColors.surface})`, border: `1px solid ${theme.colors.secondary}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ padding: theme.spacing.md, background: currentColors.surface, borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <UserPlus size={24} color={theme.colors.secondary} />
            </div>
            <div>
              <p style={{ margin: 0, color: currentColors.textMuted, fontSize: '0.9rem' }}>Total de Treinadores</p>
              <h2 style={{ margin: 0, fontSize: '2rem' }}>{trainers?.length ?? 0}</h2>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gap: theme.spacing.lg, gridTemplateColumns: '1fr' }}>

        {/* Clients Section */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg, flexWrap: 'wrap', gap: theme.spacing.md }}>
            <h3 style={{ margin: 0 }}>Lista de Clientes</h3>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: currentColors.textMuted }} />
              <TextField
                placeholder="Pesquisar cliente..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem', minWidth: '800px' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: currentColors.textMuted, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: theme.spacing.sm }}>Cliente</th>
                  <th>Estado</th>
                  <th>Treinador Atribuído</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loadingClients ? (
                  <tr>
                    <td colSpan={4} style={{ padding: theme.spacing.xl, textAlign: 'center' }}>A carregar clientes...</td>
                  </tr>
                ) : filteredClients.length ? (
                  filteredClients.map((client) => (
                    <tr key={client.id} style={{ background: currentColors.surfaceAlt, transition: 'transform 0.2s', borderRadius: theme.radii.md }}>
                      <td style={{ padding: theme.spacing.md, borderTopLeftRadius: theme.radii.md, borderBottomLeftRadius: theme.radii.md }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                          <Avatar src={client.avatarUrl} alt={client.name} size={40} />
                          <div>
                            <div style={{ fontWeight: 600 }}>{client.name}</div>
                            <div style={{ fontSize: '0.85rem', color: currentColors.textMuted }}>{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: theme.spacing.md }}>
                        <Badge tone={getStatusTone(client.status)}>{client.status}</Badge>
                      </td>
                      <td style={{ padding: theme.spacing.md }}>
                        {client.trainer ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                            <Avatar src={client.trainer.avatarUrl} alt={client.trainer.name} size={24} />
                            <span style={{ fontSize: '0.9rem' }}>{client.trainer.name}</span>
                          </div>
                        ) : (
                          <span style={{ color: currentColors.textMuted, fontStyle: 'italic', fontSize: '0.9rem' }}>Não atribuído</span>
                        )}
                      </td>
                      <td style={{ padding: theme.spacing.md, textAlign: 'right', borderTopRightRadius: theme.radii.md, borderBottomRightRadius: theme.radii.md }}>
                        <Button size="sm" variant="secondary" onClick={() => openModal(client.id, client.trainerId)}>
                          {client.trainerId ? 'Alterar' : 'Atribuir'}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: theme.spacing.xl, textAlign: 'center', color: currentColors.textMuted }}>
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Trainers Section */}
        <Card>
          <h3 style={{ marginTop: 0, marginBottom: theme.spacing.lg }}>Visão Geral dos Treinadores</h3>
          <div style={{ display: 'grid', gap: theme.spacing.md, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {trainers?.map((trainer) => (
              <div key={trainer.id} style={{
                padding: theme.spacing.md,
                border: `1px solid ${currentColors.border}`,
                borderRadius: theme.radii.md,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.md
              }}>
                <Avatar src={undefined} alt={trainer.name} size={48} /> {/* Trainer summary might not have avatarUrl yet, check types */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{trainer.name}</div>
                  <div style={{ fontSize: '0.85rem', color: currentColors.textMuted }}>{trainer.email}</div>
                  <div style={{ marginTop: theme.spacing.xs, display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                    <Badge tone="default">{trainer.clientCount} clientes</Badge>
                    <Badge tone={getStatusTone(trainer.status)}>{trainer.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
            {!trainers?.length && (
              <p style={{ color: currentColors.textMuted }}>Ainda não existem treinadores.</p>
            )}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={!!selectedClient}
        onClose={closeModal}
        title="Gerir Atribuição de Treinador"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving}>{saving ? 'A guardar...' : 'Guardar Alterações'}</Button>
          </>
        }
      >
        {selectedClient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md, background: currentColors.surfaceAlt, borderRadius: theme.radii.md }}>
              <Avatar src={selectedClient.avatarUrl} alt={selectedClient.name} size={56} />
              <div>
                <h4 style={{ margin: 0 }}>{selectedClient.name}</h4>
                <p style={{ margin: 0, color: currentColors.textMuted }}>{selectedClient.email}</p>
              </div>
            </div>

            <div>
              <label htmlFor="trainer-select" style={{ display: 'block', marginBottom: theme.spacing.xs, fontWeight: 500 }}>
                Selecione um Treinador
              </label>
              <select
                id="trainer-select"
                value={selectedTrainerId ?? ''}
                onChange={(e) => setSelectedTrainerId(e.target.value || null)}
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  borderRadius: theme.radii.md,
                  border: `1px solid ${currentColors.border}`,
                  background: currentColors.surface,
                  color: currentColors.text,
                  fontSize: '1rem'
                }}
              >
                <option value="">-- Sem Treinador --</option>
                {trainers?.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name} • {trainer.clientCount} clientes ativos
                  </option>
                ))}
              </select>
              <p style={{ marginTop: theme.spacing.xs, fontSize: '0.85rem', color: currentColors.textMuted }}>
                Escolha um treinador para acompanhar este cliente.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </Page>
  );
};

export default AdminRelationsPage;

