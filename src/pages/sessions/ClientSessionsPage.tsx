import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isFuture,
  differenceInHours
} from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';
import { sessionsApi, Session } from '../../api/sessionsApi';
import { SessionCompletionModal } from '../../components/sessions/SessionCompletionModal';

import { SessionDetailsModal } from '../../components/sessions/SessionDetailsModal';

export const ClientSessionsPage = () => {
  const { currentColors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modals
  const [sessionToComplete, setSessionToComplete] = useState<Session | null>(null);
  const [sessionToView, setSessionToView] = useState<Session | null>(null);

  // Fetch Sessions for the current month view
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ['sessions', format(currentDate, 'yyyy-MM')],
    queryFn: () => sessionsApi.list({
      startDate: startOfMonth(currentDate).toISOString(),
      endDate: endOfMonth(currentDate).toISOString()
    })
  });

  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Calendar Generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const selectedDaySessions = sessions?.filter((s: Session) => isSameDay(parseISO(s.startTime), selectedDate)) || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <Page title="As minhas Sessões" description="Agenda de treinos com o treinador">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: theme.spacing.lg, marginBottom: 100 }}>
        {/* Calendar View */}
        <Card style={{ padding: theme.spacing.md }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <h2 style={{ margin: 0, fontSize: theme.typography.sizes.lg, color: currentColors.text }}>
              {format(currentDate, 'MMMM yyyy', { locale: pt })}
            </h2>
            <div style={{ display: 'flex', gap: theme.spacing.xs }}>
              <Button variant="ghost" size="sm" onClick={handlePreviousMonth} style={{ padding: 4 }}>
                <ChevronLeft size={18} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleNextMonth} style={{ padding: 4 }}>
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>

          {/* Compact Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => (
              <div key={i} style={{
                textAlign: 'center',
                fontSize: '10px',
                textTransform: 'uppercase',
                color: theme.colors.textMuted,
                paddingBottom: 4
              }}>
                {day}
              </div>
            ))}
            {calendarDays.map(day => {
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const daySessions = sessions?.filter((s: Session) => isSameDay(parseISO(s.startTime), day));
              const hasSessions = daySessions && daySessions.length > 0;
              const completedCount = daySessions?.filter(s => s.status === 'completed').length ?? 0;
              const missedCount = daySessions?.filter(s => s.status === 'missed').length ?? 0;

              // Determine dot color
              let dotColor = null;
              if (completedCount > 0) dotColor = theme.colors.success;
              else if (missedCount > 0) dotColor = theme.colors.danger;
              else if (hasSessions) dotColor = theme.colors.primary;

              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    height: 36, // Fixed small height
                    borderRadius: theme.radii.sm,
                    position: 'relative',
                    opacity: isCurrentMonth ? 1 : 0.3
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: isSelected ? theme.colors.primary : 'transparent',
                    color: isSelected ? '#fff' : currentColors.text,
                    fontSize: theme.typography.sizes.sm,
                    fontWeight: isSelected ? 'bold' : 'normal',
                    marginBottom: 2
                  }}>
                    {format(day, 'd')}
                  </div>

                  <div style={{ height: 4, display: 'flex', gap: 2 }}>
                    {dotColor && (
                      <div style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: isSelected ? '#fff' : dotColor
                      }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Selected Day Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <h3 style={{ margin: 0, color: currentColors.text, fontSize: theme.typography.sizes.lg }}>
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: pt })}
          </h3>

          {selectedDaySessions.length === 0 ? (
            <Card style={{ padding: theme.spacing.lg, textAlign: 'center', color: theme.colors.textMuted, borderStyle: 'dashed' }}>
              Sem sessões para este dia.
            </Card>
          ) : (
            selectedDaySessions.map((session: Session) => {
              const sessionDate = parseISO(session.startTime);
              const isExpired = differenceInHours(new Date(), sessionDate) > 24;

              // Determine interaction mode
              const isCompeteable = !isFuture(sessionDate) && !isExpired && session.status === 'scheduled';
              const isViewable = session.status === 'completed' || session.status === 'missed' || session.status === 'cancelled';
              const isClickable = isCompeteable || isViewable;

              return (
                <Card
                  key={session._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'transform 0.2s',
                    borderLeft: `4px solid ${session.status === 'completed' ? theme.colors.success :
                      session.status === 'missed' ? theme.colors.danger :
                        theme.colors.primary
                      }`,
                    padding: theme.spacing.md,
                    opacity: isExpired && session.status === 'scheduled' ? 0.6 : 1
                  }}
                  onClick={() => {
                    if (isCompeteable) {
                      setSessionToComplete(session);
                    } else if (isViewable) {
                      setSessionToView(session);
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: 50
                  }}>
                    <span style={{ fontWeight: 'bold', color: currentColors.text, fontSize: theme.typography.sizes.md }}>
                      {format(parseISO(session.startTime), 'HH:mm')}
                    </span>
                    <span style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted }}>
                      {format(parseISO(session.endTime), 'HH:mm')}
                    </span>
                  </div>

                  <div style={{ flex: 1, paddingLeft: theme.spacing.sm, borderLeft: `1px solid ${currentColors.border}` }}>
                    <h4 style={{ margin: 0, fontWeight: 'bold', color: currentColors.text, fontSize: theme.typography.sizes.md }}>
                      {session.trainer.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, marginTop: 4 }}>
                      {session.status === 'completed' && (
                        <span style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.success, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle size={12} /> Concluído
                        </span>
                      )}
                      {session.status === 'missed' && (
                        <span style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.danger, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <XCircle size={12} /> Não Realizado
                        </span>
                      )}
                      {session.status === 'scheduled' && (
                        <span style={{ fontSize: theme.typography.sizes.xs, color: isExpired ? theme.colors.textMuted : theme.colors.primary, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {isExpired ? <XCircle size={12} /> : <Clock size={12} />}
                          {isExpired ? 'Expirado (24h)' : 'Toque para registar'}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {sessionToComplete && (
        <SessionCompletionModal
          session={sessionToComplete}
          isOpen={!!sessionToComplete}
          onClose={() => setSessionToComplete(null)}
        />
      )}

      {sessionToView && (
        <SessionDetailsModal
          session={sessionToView}
          isOpen={!!sessionToView}
          onClose={() => setSessionToView(null)}
          userRole="client"
          onEdit={() => {
            setSessionToView(null);
            setSessionToComplete(sessionToView);
          }}
        />
      )}
    </Page>
  );
};

