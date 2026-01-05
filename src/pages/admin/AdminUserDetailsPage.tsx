import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { Avatar } from '../../design-system/components/Avatar';
import { theme } from '../../design-system/theme';
import { useAdminUser, useAdminUserRoleMutation } from '../../hooks/useAdminData';
import { useAdminClients } from '../../hooks/useAdminRelations';
import { EditUserModal } from './components/EditUserModal';
import { Edit2 } from 'lucide-react';

const AdminUserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading } = useAdminUser(id);
  const { mutateAsync: updateRole, isPending: updatingRole } = useAdminUserRoleMutation();
  const { data: clients } = useAdminClients();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handlePromoteToTrainer = async () => {
    if (!user || !confirm('Tem a certeza que deseja promover este utilizador a treinador?')) return;
    await updateRole({ id: user.id, role: 'trainer' });
  };

  const trainerClients = useMemo(() => clients?.filter((client) => client.trainerId === id) ?? [], [clients, id]);
  const clientAssignment = useMemo(() => clients?.find((client) => client.id === id), [clients, id]);

  if (isLoading || !user) {
    return <div style={{ padding: '2rem' }}>A carregar utilizador...</div>;
  }

  const getRoleTone = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'trainer': return 'warning';
      default: return 'success';
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
    <Page title="Detalhes do Utilizador" description="Gerir informações e permissões.">
      <div style={{ display: 'grid', gap: theme.spacing.lg, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

        {/* Profile Card */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
              <Avatar src={user.avatarUrl} alt={user.name} size={80} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{user.name}</h2>
                <p style={{ margin: 0, color: theme.colors.textMuted }}>{user.email}</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setIsEditModalOpen(true)}>
              <Edit2 size={16} style={{ marginRight: theme.spacing.xs }} />
              Editar
            </Button>
          </div>

          <div style={{ display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.xs }}>
            <Badge tone={getRoleTone(user.role)}>{user.role}</Badge>
            <Badge tone={getStatusTone(user.status)}>{user.status}</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm, marginTop: theme.spacing.md, paddingTop: theme.spacing.md, borderTop: `1px solid ${theme.colors.border}` }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: theme.colors.textMuted }}>Registado em</p>
              <p style={{ margin: 0 }}>{new Date(user.createdAt).toLocaleDateString('pt-PT')}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: theme.colors.textMuted }}>Última atualização</p>
              <p style={{ margin: 0 }}>{new Date(user.updatedAt).toLocaleDateString('pt-PT')}</p>
            </div>
          </div>
        </Card>

        {/* Actions / Relations Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>

          {user.role === 'client' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md }}>
                <div>
                  <h3 style={{ margin: 0 }}>Treinador</h3>
                  <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: '0.9rem' }}>Responsável pelo acompanhamento.</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/app/admin/relations?clientId=${user.id}`)}>
                  Gerir
                </Button>
              </div>

              {clientAssignment?.trainer ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.sm, background: theme.colors.surfaceAlt, borderRadius: theme.radii.md }}>
                  <Avatar src={clientAssignment.trainer.avatarUrl} alt={clientAssignment.trainer.name} size={40} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>{clientAssignment.trainer.name}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: theme.colors.textMuted }}>{clientAssignment.trainer.email}</p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: theme.spacing.md, textAlign: 'center', background: theme.colors.surfaceAlt, borderRadius: theme.radii.md, color: theme.colors.textMuted }}>
                  Sem treinador atribuído.
                </div>
              )}

              <div style={{ marginTop: theme.spacing.lg, paddingTop: theme.spacing.md, borderTop: `1px solid ${theme.colors.border}` }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: theme.colors.textMuted }}>Ações avançadas</h4>
                <Button
                  onClick={handlePromoteToTrainer}
                  disabled={updatingRole}
                  style={{ width: '100%' }}
                  variant="primary" // Or a specific 'warning' variant if available, but primary is fine
                >
                  {updatingRole ? 'A promover...' : 'Promover a Treinador'}
                </Button>
              </div>
            </Card>
          )}

          {user.role === 'trainer' && (
            <Card style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
                <div>
                  <h3 style={{ margin: 0 }}>Clientes ({trainerClients.length})</h3>
                </div>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/app/admin/relations?trainerId=${user.id}`)}>
                  Gerir
                </Button>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {trainerClients.length ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {trainerClients.map((clientItem) => (
                        <tr key={clientItem.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                          <td style={{ padding: theme.spacing.sm }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                              <Avatar src={undefined} alt={clientItem.name} size={32} />
                              <div>
                                <div style={{ fontWeight: 500 }}>{clientItem.name}</div>
                                <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{clientItem.email}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', color: theme.colors.textMuted, padding: theme.spacing.md }}>
                    Sem clientes associados.
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
      />
    </Page>
  );
};

export default AdminUserDetailsPage;
