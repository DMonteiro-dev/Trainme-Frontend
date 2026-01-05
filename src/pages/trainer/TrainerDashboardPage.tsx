import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { theme } from '../../design-system/theme';
import { useTrainerClients, useTrainerProfile } from '../../hooks/useTrainerQueries';
import { CheckCircle, Clock } from 'lucide-react';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

import { sessionsApi, Session } from '../../api/sessionsApi';
import { startOfToday, addMonths } from 'date-fns';

const TrainerDashboardPage = () => {
  const { data: profile } = useTrainerProfile();
  const { data: clients } = useTrainerClients();

  // Fetch sessions starting from today for the next month
  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['dashboard-sessions'],
    queryFn: () => sessionsApi.list({
      startDate: startOfToday().toISOString(),
      endDate: addMonths(startOfToday(), 1).toISOString()
    }),
  });

  const uniqueClientIds = new Set(
    (clients?.map((client) => client.id) ?? [])
  );

  const todaySessions = sessions?.filter(s => isToday(parseISO(s.startTime))) || [];
  const upcomingSessions = sessions?.filter(s => isFuture(parseISO(s.startTime)) && !isToday(parseISO(s.startTime))).slice(0, 5) || [];


  return (
    <Page title="Visão geral" description="Resumo rápido do teu rendimento como treinador.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: theme.spacing.lg }}>
        <Card>
          <p style={{ margin: 0, color: theme.colors.textMuted }}>Clientes ativos</p>
          <h2 style={{ margin: `${theme.spacing.xs} 0 0` }}>{uniqueClientIds.size}</h2>
        </Card>
        <Card>
          <p style={{ margin: 0, color: theme.colors.textMuted }}>Sessões hoje</p>
          <h2 style={{ margin: `${theme.spacing.xs} 0 0` }}>{todaySessions.length}</h2>
        </Card>
        <Card>
          <p style={{ margin: 0, color: theme.colors.textMuted }}>Classificação média</p>
          <h2 style={{ margin: `${theme.spacing.xs} 0 0` }}>{profile?.rating ?? '—'}</h2>
          {profile?.totalReviews && (
            <p style={{ margin: 0, color: theme.colors.textMuted }}>{profile.totalReviews} avaliações</p>
          )}
        </Card>
      </div>

      <Card style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        <Link to="/app/plans" style={{ flex: '1 1 180px' }}>
          <Button fullWidth>Gerir Planos</Button>
        </Link>
        <Link to="/app/trainer/clients" style={{ flex: '1 1 180px' }}>
          <Button fullWidth variant="secondary">
            Meus Clientes
          </Button>
        </Link>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: theme.spacing.lg }}>
        <Card>
          <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md }}>Sessões de Hoje</h3>
          {isLoadingSessions ? (
            <p>A carregar agenda...</p>
          ) : todaySessions.length ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              {todaySessions.map((session) => (
                <li key={session._id} style={{
                  padding: theme.spacing.sm,
                  backgroundColor: theme.colors.surfaceAlt,
                  borderRadius: theme.radii.md,
                  border: `1px solid ${theme.colors.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: theme.typography.weights.bold }}>
                      {session.client.name}
                    </p>
                    <p style={{ margin: 0, fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>
                      {format(parseISO(session.startTime), 'HH:mm')} - {format(parseISO(session.endTime), 'HH:mm')}
                    </p>
                  </div>

                  {session.status === 'completed' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, color: theme.colors.success }}>
                      <CheckCircle size={18} />
                      <span style={{ fontSize: theme.typography.sizes.sm, fontWeight: 600 }}>Concluído</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, color: theme.colors.primary }}>
                      <Clock size={16} />
                      <span style={{ fontSize: theme.typography.sizes.sm }}>Agendado</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, color: theme.colors.textMuted }}>Sem sessões agendadas para hoje.</p>
          )}
        </Card>

        <Card>
          <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md }}>Próximas Sessões</h3>
          {isLoadingSessions ? (
            <p>A carregar agenda...</p>
          ) : upcomingSessions.length ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              {upcomingSessions.map((session) => (
                <li key={session._id} style={{
                  padding: theme.spacing.sm,
                  borderBottom: `1px solid ${theme.colors.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: theme.typography.weights.medium }}>
                      {session.client.name}
                    </p>
                    <p style={{ margin: 0, fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>
                      {format(parseISO(session.startTime), 'HH:mm')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: theme.typography.sizes.sm, fontWeight: 600 }}>
                      {format(parseISO(session.startTime), 'EEE, d MMM', { locale: pt })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, color: theme.colors.textMuted }}>Sem sessões futuras agendadas.</p>
          )}
        </Card>
      </div>

    </Page>
  );
};

export default TrainerDashboardPage;
