import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { TextField } from '../../design-system/components/TextField';
import { Badge } from '../../design-system/components/Badge';
import { Avatar } from '../../design-system/components/Avatar';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAdminUsers, useAdminUserStatusMutation, useCreateAdminUser } from '../../hooks/useAdminData';
import { Search, UserPlus, Filter, MoreHorizontal } from 'lucide-react';

const tabs = [
  { label: 'Treinadores', value: 'trainer' },
  { label: 'Clientes', value: 'client' },
  { label: 'Admins', value: 'admin' },
] as const;

type TabValue = (typeof tabs)[number]['value'];

const AdminUsersPage = () => {
  const { currentColors } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>('trainer');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'trainer' as 'trainer' | 'admin' });

  const params = useMemo(() => ({ role: activeTab, search: search || undefined, limit: 50 }), [activeTab, search]);
  const { data: users, isLoading } = useAdminUsers(params);
  const { mutateAsync: updateStatus } = useAdminUserStatusMutation();
  const { mutateAsync: createUser, isPending: creating } = useCreateAdminUser();

  const handleStatusToggle = async (id: string, current: 'active' | 'blocked' | 'pending') => {
    const next = current === 'blocked' ? 'active' : 'blocked';
    await updateStatus({ id, status: current === 'pending' ? 'active' : next });
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    await createUser(form);
    setForm({ name: '', email: '', password: '', role: 'trainer' });
    setShowCreate(false);
  };

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
    <Page title="Gestão de Utilizadores" description="Consulta e controla papéis e estados dos utilizadores da plataforma.">

      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>

        {/* Actions Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: theme.spacing.md }}>
          <div style={{ display: 'flex', background: currentColors.surface, padding: '4px', borderRadius: theme.radii.md, border: `1px solid ${currentColors.border}` }}>
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                style={{
                  background: tab.value === activeTab ? currentColors.primary : 'transparent',
                  color: tab.value === activeTab ? '#fff' : currentColors.textMuted,
                  border: 'none',
                  padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                  borderRadius: theme.radii.sm,
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <Button onClick={() => setShowCreate((prev) => !prev)}>
              <UserPlus size={18} style={{ marginRight: theme.spacing.xs }} />
              {showCreate ? 'Cancelar Criação' : 'Novo Utilizador'}
            </Button>
          </div>
        </div>

        {/* Create User Form */}
        {showCreate && (
          <Card style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md }}>Criar Novo Utilizador</h3>
            <form
              onSubmit={handleCreate}
              style={{ display: 'grid', gap: theme.spacing.md, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', alignItems: 'end' }}
            >
              <TextField label="Nome" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <div>
                <label htmlFor="role" style={{ display: 'block', marginBottom: theme.spacing.xs, fontWeight: 500 }}>
                  Role
                </label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as 'trainer' | 'admin' }))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    background: currentColors.surfaceAlt,
                    border: `1px solid ${currentColors.border}`,
                    color: currentColors.text,
                    borderRadius: theme.radii.md,
                    fontSize: '1rem'
                  }}
                >
                  <option value="trainer">Treinador</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button type="submit" disabled={creating} style={{ height: '42px' }}>
                {creating ? 'A criar...' : 'Criar Utilizador'}
              </Button>
            </form>
          </Card>
        )}

        {/* Users List */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: theme.spacing.md, borderBottom: `1px solid ${currentColors.border}`, display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
            <Search size={18} color={currentColors.textMuted} />
            <input
              type="text"
              placeholder={`Pesquisar ${activeTab}s...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                color: currentColors.text,
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: currentColors.textMuted, background: currentColors.surfaceAlt, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: `${theme.spacing.md} ${theme.spacing.lg}` }}>Utilizador</th>
                  <th style={{ padding: theme.spacing.md }}>Role</th>
                  <th style={{ padding: theme.spacing.md }}>Estado</th>
                  <th style={{ padding: theme.spacing.md }}>Data de Registo</th>
                  <th style={{ padding: theme.spacing.md, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: theme.spacing.xl, textAlign: 'center' }}>A carregar utilizadores...</td>
                  </tr>
                ) : users?.length ? (
                  users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: `1px solid ${currentColors.border}`, transition: 'background 0.2s' }}>
                      <td style={{ padding: `${theme.spacing.md} ${theme.spacing.lg}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                          <Avatar src={user.avatarUrl} alt={user.name} size={40} />
                          <div>
                            <div style={{ fontWeight: 600, color: currentColors.text }}>{user.name}</div>
                            <div style={{ fontSize: '0.85rem', color: currentColors.textMuted }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: theme.spacing.md }}>
                        <Badge tone={getRoleTone(user.role)}>{user.role}</Badge>
                      </td>
                      <td style={{ padding: theme.spacing.md }}>
                        <Badge tone={getStatusTone(user.status)}>{user.status}</Badge>
                      </td>
                      <td style={{ padding: theme.spacing.md, color: currentColors.textMuted, fontSize: '0.9rem' }}>
                        {new Date(user.createdAt).toLocaleDateString('pt-PT')}
                      </td>
                      <td style={{ padding: theme.spacing.md, textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.sm }}>
                          <Button size="sm" variant="secondary" onClick={() => navigate(`/app/admin/users/${user.id}`)}>
                            Detalhes
                          </Button>
                          <Button
                            size="sm"
                            variant={user.status === 'active' ? 'secondary' : 'primary'} // Visual cue for unblocking
                            onClick={() => handleStatusToggle(user.id, user.status)}
                            style={{ minWidth: '80px' }}
                          >
                            {user.status === 'active' ? 'Bloquear' : 'Ativar'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: theme.spacing.xl, textAlign: 'center', color: currentColors.textMuted }}>
                      Não foram encontrados utilizadores.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Page>
  );
};

export default AdminUsersPage;
