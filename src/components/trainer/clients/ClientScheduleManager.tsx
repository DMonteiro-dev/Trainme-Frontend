import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { trainingPlansApi } from '../../../api/trainingPlansApi';
import { apiClient } from '../../../lib/api';
import { WeeklyCalendar } from '../../calendar/WeeklyCalendar';
import { theme } from '../../../design-system/theme';
import { Button } from '../../../design-system/components/Button';
import { TrainingPlanWorkout } from '../../../types';
import { Dumbbell, Save } from 'lucide-react';

interface ClientScheduleManagerProps {
    planId: string;
    clientId: string;
    onClose: () => void;
}

export const ClientScheduleManager: React.FC<ClientScheduleManagerProps> = ({ planId, clientId, onClose }) => {
    const queryClient = useQueryClient();
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
    const [schedule, setSchedule] = useState<{ workoutId: string; date: Date; time?: string; completed: boolean }[]>([]);

    // Fetch Plan Details
    const { data: plan } = useQuery({
        queryKey: ['plan', planId],
        queryFn: () => trainingPlansApi.getById(planId),
    });

    // Fetch Assignment Details (including schedule)
    const { data: assignment } = useQuery({
        queryKey: ['assignment', planId, clientId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/plans/${planId}/assignments/${clientId}`);
            return data.data;
        },
    });

    useEffect(() => {
        if (assignment?.schedule) {
            setSchedule(assignment.schedule.map((s: any) => ({
                ...s,
                date: new Date(s.date)
            })));
        }
    }, [assignment]);

    const updateScheduleMutation = useMutation({
        mutationFn: (newSchedule: any[]) => apiClient.put(`/plans/${planId}/assignments/${clientId}/schedule`, { schedule: newSchedule }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignment', planId, clientId] });
            alert('Agendamento guardado!');
        },
    });

    const handleDrop = (workoutId: string, date: Date) => {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        if (date < oneHourFromNow) {
            alert('A sessão deve ser agendada para, pelo menos, 1 hora a partir de agora.');
            return;
        }

        setSchedule(prev => [
            ...prev,
            { workoutId, date, completed: false }
        ]);
    };

    const handleSave = () => {
        updateScheduleMutation.mutate(schedule);
    };

    const handleDragStart = (e: React.DragEvent, workout: TrainingPlanWorkout) => {
        e.dataTransfer.setData('workoutId', workout.id);
        e.dataTransfer.effectAllowed = 'copy';
    };

    if (!plan) return <div>A carregar plano...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg, height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Agendar Treinos</h2>
                <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    <Button variant="secondary" onClick={onClose}>Fechar</Button>
                    <Button onClick={handleSave} disabled={updateScheduleMutation.isPending}>
                        <Save size={16} style={{ marginRight: 8 }} />
                        Guardar
                    </Button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: theme.spacing.lg, flex: 1, overflow: 'hidden' }}>
                {/* Workouts List */}
                <div style={{
                    borderRight: `1px solid ${theme.colors.border}`,
                    paddingRight: theme.spacing.md,
                    overflowY: 'auto'
                }}>
                    <h3 style={{ marginTop: 0, fontSize: theme.typography.sizes.md }}>Treinos Disponíveis</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                        {plan.workouts?.map(workout => (
                            <div
                                key={workout.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, workout)}
                                style={{
                                    padding: theme.spacing.md,
                                    backgroundColor: theme.colors.surfaceAlt,
                                    borderRadius: theme.radii.md,
                                    cursor: 'grab',
                                    border: `1px solid ${theme.colors.border}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: theme.spacing.sm
                                }}
                            >
                                <Dumbbell size={16} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>{workout.title}</div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendar */}
                <div style={{ overflowY: 'auto' }}>
                    <WeeklyCalendar
                        weekStartDate={currentWeekStart}
                        workouts={plan.workouts || []}
                        schedule={schedule}
                        onDrop={handleDrop}
                        isTrainer={true}
                    />
                </div>
            </div>
        </div>
    );
};
