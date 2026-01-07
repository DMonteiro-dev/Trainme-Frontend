import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
} from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { TextField } from '../../design-system/components/TextField';
import { Select } from '../../design-system/components/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';
import { sessionsApi, Session } from '../../api/sessionsApi';
import { fetchTrainerClients } from '../../api/trainerApi';
import { SessionDetailsModal } from '../../components/sessions/SessionDetailsModal';

export const TrainerSessionsPage = () => {
    const { currentColors } = useTheme();
    const { showToast } = useNotification();
    const queryClient = useQueryClient();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [selectedClientId, setSelectedClientId] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [notes, setNotes] = useState('');

    // Fetch Sessions for the current month view
    const { data: sessions, isLoading } = useQuery<Session[]>({
        queryKey: ['sessions', format(currentDate, 'yyyy-MM')],
        queryFn: () => sessionsApi.list({
            startDate: startOfMonth(currentDate).toISOString(),
            endDate: endOfMonth(currentDate).toISOString()
        })
    });

    const { data: clients } = useQuery<any[]>({ // fallback to any for now until we see types
        queryKey: ['my-clients'],
        queryFn: fetchTrainerClients,
        enabled: showAddModal
    });

    const createMutation = useMutation({
        mutationFn: sessionsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            setShowAddModal(false);
            resetForm();
            showToast('Sessão agendada com sucesso!');
        },
        onError: (error: any) => {
            showToast(error.response?.data?.message || 'Erro ao agendar sessão');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: sessionsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        }
    });

    const resetForm = () => {
        setSelectedClientId('');
        setStartTime('09:00');
        setEndTime('10:00');
        setNotes('');
    };

    const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleSubmit = () => {
        if (!selectedClientId || !startTime || !endTime) {
            showToast('Preencha os campos obrigatórios');
            return;
        }

        const startDateTime = new Date(selectedDate);
        const [startHour, startMinute] = startTime.split(':').map(Number);
        startDateTime.setHours(startHour, startMinute);

        // Validation: 1 hour in future
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        if (startDateTime < oneHourFromNow) {
            showToast('A sessão deve ser agendada para, pelo menos, 1 hora a partir de agora.');
            return;
        }

        const endDateTime = new Date(selectedDate);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        endDateTime.setHours(endHour, endMinute);

        if (endDateTime <= startDateTime) {
            showToast('A hora de fim deve ser depois da hora de início');
            return;
        }

        createMutation.mutate({
            clientId: selectedClientId,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            notes
        });
    };

    // Calendar Generation
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const selectedDaySessions = sessions?.filter((s: Session) => isSameDay(parseISO(s.startTime), selectedDate)) || [];

    // Filter for Pending and History
    // We need to fetch ALL sessions for these lists, not just the month view. 
    // Ideally we would have separate queries, but for now we might need to rely on the month view or fetch more.
    // However, the user specifically asked for "all uncompleted sessions". 
    // Let's add specific queries for specific tabs if the user switches to them, or just use a broader query.
    // For MVP efficiency in this refactor, I'll add dedicated queries for Pending/History enabled only when tab is active.

    const [activeTab, setActiveTab] = useState<'calendar' | 'pending' | 'history'>('calendar');

    // Pending Sessions Query (Upcoming + Overdue)
    const { data: pendingSessions } = useQuery<Session[]>({
        queryKey: ['sessions', 'pending'],
        queryFn: async () => {
            // Fetch wide range to catch overdue and upcoming
            const data = await sessionsApi.list({
                startDate: subMonths(new Date(), 1).toISOString(), // Look back 1 month for overdue
                endDate: addMonths(new Date(), 6).toISOString()   // Look ahead 6 months
            });
            return data
                .filter(s => s.status === 'scheduled')
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        },
        enabled: activeTab === 'pending'
    });

    // History Query (Completed, Missed, Cancelled - PAST)
    const { data: historySessions } = useQuery<Session[]>({
        queryKey: ['sessions', 'history'],
        queryFn: async () => {
            const data = await sessionsApi.list({
                endDate: addMonths(new Date(), 6).toISOString(), // Allow seeing future completed/cancelled sessions
                startDate: subMonths(new Date(), 6).toISOString()
            });
            // Ensure we show all non-scheduled types, or scheduled ones that are in the past
            return data
                .filter(s => s.status !== 'scheduled' || new Date(s.startTime) < new Date())
                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        },
        enabled: activeTab === 'history'
    });

    // Detail Modal State
    const [viewSession, setViewSession] = useState<Session | null>(null);

    if (isLoading) return <LoadingSpinner />;

    return (
        <Page
            title="Gestão de Sessões"
            actions={
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus size={20} style={{ marginRight: 8 }} />
                    Agendar Sessão
                </Button>
            }
        >
            <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
                <Button
                    variant={activeTab === 'calendar' ? 'primary' : 'outline'}
                    onClick={() => setActiveTab('calendar')}
                    size="sm"
                >
                    Calendário
                </Button>
                <Button
                    variant={activeTab === 'pending' ? 'primary' : 'outline'}
                    onClick={() => setActiveTab('pending')}
                    size="sm"
                >
                    Pendentes ({pendingSessions?.length || 0})
                </Button>
                <Button
                    variant={activeTab === 'history' ? 'primary' : 'outline'}
                    onClick={() => setActiveTab('history')}
                    size="sm"
                >
                    Histórico
                </Button>
            </div>

            {activeTab === 'calendar' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: theme.spacing.lg, marginBottom: 100 }}>
                    {/* Compact Calendar View */}
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
                                        {hasSessions && (
                                            <div style={{
                                                width: 4,
                                                height: 4,
                                                borderRadius: '50%',
                                                background: isSelected ? '#fff' : theme.colors.primary
                                            }} />
                                        )}
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
                                Sem sessões agendadas para este dia.
                            </Card>
                        ) : (
                            selectedDaySessions.map((session: Session) => (
                                <SessionCard
                                    key={session._id}
                                    session={session}
                                    onDelete={() => {
                                        if (confirm('Tem a certeza que deseja cancelar esta sessão?')) {
                                            deleteMutation.mutate(session._id);
                                        }
                                    }}
                                    onClick={() => setViewSession(session)}
                                    currentColors={currentColors}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    {pendingSessions?.length === 0 ? (
                        <p style={{ color: theme.colors.textMuted }}>Não há sessões pendentes.</p>
                    ) : (
                        pendingSessions?.map(session => (
                            <SessionCard
                                key={session._id}
                                session={session}
                                onDelete={() => deleteMutation.mutate(session._id)}
                                onClick={() => setViewSession(session)}
                                currentColors={currentColors}
                            />
                        ))
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    {historySessions?.map(session => (
                        <SessionCard
                            key={session._id}
                            session={session}
                            isHistory
                            onDelete={() => deleteMutation.mutate(session._id)}
                            onClick={() => setViewSession(session)}
                            currentColors={currentColors}
                        />
                    ))}
                </div>
            )}

            {/* Add Session Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: theme.spacing.md,
                    background: 'rgba(0,0,0,0.8)'
                }}>
                    <Card style={{ width: '100%', maxWidth: 500, gap: theme.spacing.md, display: 'grid' }}>
                        <h3 style={{ margin: 0, fontSize: theme.typography.sizes.xl, color: currentColors.text }}>Nova Sessão</h3>

                        <div>
                            <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: currentColors.text, fontSize: theme.typography.sizes.sm }}>Cliente</label>
                            <Select
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                            >
                                <option value="">Selecione um cliente</option>
                                <option value="create_new">+ Novo Cliente (placeholder)</option>
                                {clients?.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                            <TextField
                                label="Início"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                            <TextField
                                label="Fim"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>

                        <TextField
                            label="Notas"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="O que vamos treinar?"
                        />

                        <div style={{ display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.sm }}>
                            <Button variant="ghost" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                                Cancelar
                            </Button>
                            <Button style={{ flex: 1 }} onClick={handleSubmit} disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'A guardar...' : 'Agendar'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Detail Modal */}
            {viewSession && (
                <SessionDetailsModal
                    session={viewSession}
                    isOpen={!!viewSession}
                    onClose={() => setViewSession(null)}
                    userRole="trainer"
                />
            )}
        </Page>
    );
};

// Helper Component for Session Card
const SessionCard = ({ session, onDelete, onClick, currentColors, isHistory = false }: { session: Session, onDelete: () => void, onClick?: () => void, currentColors: any, isHistory?: boolean }) => {

    const getStatusColor = () => {
        const date = parseISO(session.startTime);
        const now = new Date();

        // Completed/Missed/Cancelled logic (Prioritize explicit status)
        if (session.status === 'completed') return theme.colors.success;
        if (session.status === 'missed') return theme.colors.danger;
        if (session.status === 'cancelled') return theme.colors.textMuted;

        // Scheduled logic
        if (isSameDay(date, now)) return theme.colors.warning; // Today (Yellow)
        if (date > now) return theme.colors.primary; // Future (Blue)
        return theme.colors.danger; // Overdue (Red)
    };

    const statusColor = getStatusColor();

    return (
        <Card
            onClick={onClick}
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderLeft: statusColor ? `4px solid ${statusColor}` : undefined,
                cursor: onClick ? 'pointer' : 'default'
            }}
        >
            <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: theme.spacing.sm,
                    background: currentColors.surfaceAlt,
                    borderRadius: theme.radii.md,
                    minWidth: 60
                }}>
                    <span style={{ fontSize: 10, marginBottom: 2, color: theme.colors.textMuted }}>
                        {format(parseISO(session.startTime), 'dd/MM')}
                    </span>
                    <span style={{ fontWeight: 'bold', color: currentColors.text }}>
                        {format(parseISO(session.startTime), 'HH:mm')}
                    </span>
                    <span style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted }}>
                        {format(parseISO(session.endTime), 'HH:mm')}
                    </span>
                </div>
                <div>
                    <h4 style={{ margin: 0, fontWeight: 'bold', color: currentColors.text }}>
                        {session.client.name}
                    </h4>
                    {session.notes && (
                        <p style={{ margin: 0, fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>
                            {session.notes}
                        </p>
                    )}

                    {/* Status Badges */}
                    {session.status === 'completed' && (
                        <span style={{ color: theme.colors.success, fontSize: 12, fontWeight: 600 }}>Concluída</span>
                    )}
                    {session.status === 'missed' && (
                        <span style={{ color: theme.colors.danger, fontSize: 12, fontWeight: 600 }}>Faltou</span>
                    )}
                    {session.status === 'cancelled' && (
                        <span style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: 600 }}>Cancelada</span>
                    )}
                    {session.status === 'scheduled' && new Date(session.startTime) < new Date() && (
                        <span style={{ color: theme.colors.warning, fontSize: 12, fontWeight: 600 }}>Pendente de conclusão</span>
                    )}
                </div>
            </div>
            <Button
                variant="ghost"
                style={{ color: theme.colors.danger }}
                onClick={onDelete}
            >
                <Trash2 size={18} />
            </Button>
        </Card>
    );
};
