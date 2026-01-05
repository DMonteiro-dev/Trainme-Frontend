import { useMemo, useState } from 'react';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { theme } from '../../design-system/theme';
import {
  useAdminTrainerChangeRequests,
  useApproveTrainerChangeRequest,
  useRejectTrainerChangeRequest,
} from '../../hooks/useTrainerChangeRequests';
import { useTheme } from '../../context/ThemeContext';
import type { TrainerChangeRequestStatus } from '../../types';

const statusLabels: Record<TrainerChangeRequestStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

const statusTone: Record<TrainerChangeRequestStatus, 'default' | 'success' | 'danger'> = {
  pending: 'default',
  approved: 'success',
  rejected: 'danger',
};

const filters = [
  { label: 'Pendentes', value: 'pending' },
  { label: 'Aprovados', value: 'approved' },
  { label: 'Rejeitados', value: 'rejected' },
  { label: 'Todos', value: 'all' },
] as const;

type FilterValue = (typeof filters)[number]['value'];

const AdminTrainerChangeRequestsPage = () => {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('pending');
  const params = useMemo(
    () => ({
      status: activeFilter === 'all' ? undefined : (activeFilter as TrainerChangeRequestStatus),
    }),
    [activeFilter],
  );

  const { data: requests, isLoading } = useAdminTrainerChangeRequests(params);
  const { mutateAsync: approve, isPending: approving } = useApproveTrainerChangeRequest();
  const { mutateAsync: reject, isPending: rejecting } = useRejectTrainerChangeRequest();

  const handleApprove = async (id: string) => {
    await approve(id);
  };

  const handleReject = async (id: string) => {
    await reject(id);
  };

  const { currentColors } = useTheme();

  return (
    <Page title="Pedidos de troca de treinador" description="Revisa e decide os pedidos submetidos pelos clientes.">
      <Card style={{ marginBottom: theme.spacing.lg, display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={filter.value === activeFilter ? 'primary' : 'secondary'}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </Card>

      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '860px' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: currentColors.textMuted }}>
              <th style={{ padding: theme.spacing.sm }}>Cliente</th>
              <th>Treinador atual</th>
              <th>Treinador pedido</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Submetido</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} style={{ padding: theme.spacing.md, textAlign: 'center', color: currentColors.textMuted }}>
                  A carregar pedidos...
                </td>
              </tr>
            ) : requests?.length ? (
              requests.map((request) => (
                <tr key={request.id} style={{ borderTop: `1px solid ${currentColors.border}` }}>
                  <td style={{ padding: theme.spacing.sm }}>
                    <strong>{request.client?.name ?? request.client?.id}</strong>
                    <br />
                    <span style={{ color: currentColors.textMuted, fontSize: theme.typography.sizes.sm }}>
                      {request.client?.email ?? '—'}
                    </span>
                  </td>
                  <td>{request.currentTrainer?.name ?? '—'}</td>
                  <td>{request.requestedTrainer?.name ?? 'Remover treinador'}</td>
                  <td style={{ maxWidth: '260px' }}>{request.reason}</td>
                  <td>
                    <Badge tone={statusTone[request.status]}>{statusLabels[request.status]}</Badge>
                  </td>
                  <td>{new Date(request.createdAt).toLocaleDateString('pt-PT')}</td>
                  <td>
                    {request.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                        <Button size="sm" onClick={() => handleApprove(request.id)} disabled={approving}>
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleReject(request.id)}
                          disabled={rejecting}
                        >
                          Rejeitar
                        </Button>
                      </div>
                    ) : (
                      <span style={{ color: currentColors.textMuted }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: theme.spacing.md, textAlign: 'center', color: currentColors.textMuted }}>
                  Não existem pedidos para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </Page>
  );
};

export default AdminTrainerChangeRequestsPage;
