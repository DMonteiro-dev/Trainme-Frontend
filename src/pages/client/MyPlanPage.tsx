import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Dumbbell, Calendar, Clock, ChevronRight, PlayCircle } from 'lucide-react';
import { trainingPlansApi } from '../../api/trainingPlansApi';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Page } from '../../design-system/components/Page';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';

export const MyPlanPage = () => {
    const navigate = useNavigate();
    const { currentColors } = useTheme();

    const { data: plans, isLoading } = useQuery({
        queryKey: ['my-plans'],
        queryFn: () => trainingPlansApi.list()
    });

    // Get the active plan
    const activePlan = plans?.find(p => p.status === 'active');

    if (isLoading) return <LoadingSpinner />;

    if (!activePlan) {
        return (
            <Page title="O Meu Plano">
                <Card style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: theme.spacing.xl,
                    gap: theme.spacing.md,
                    borderStyle: 'dashed'
                }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: currentColors.surfaceAlt,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Calendar size={32} color={theme.colors.textMuted} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: theme.typography.sizes.lg, marginBottom: theme.spacing.xs }}>
                            Sem plano ativo
                        </h3>
                        <p style={{ margin: 0, color: theme.colors.textMuted }}>
                            Ainda não tens um plano de treino atribuído.
                        </p>
                    </div>
                </Card>
            </Page>
        );
    }

    const daysOfWeekMap: Record<number, string> = {
        1: 'Segunda-feira',
        2: 'Terça-feira',
        3: 'Quarta-feira',
        4: 'Quinta-feira',
        5: 'Sexta-feira',
        6: 'Sábado',
        7: 'Domingo',
    };

    // Sort schedule by day of week
    const sortedSchedule = [...activePlan.schedule].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    return (
        <Page
            title="O Meu Plano"
            description={activePlan.name}
            actions={
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    background: currentColors.surfaceAlt,
                    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                    borderRadius: theme.radii.md,
                    border: `1px solid ${currentColors.border}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, color: theme.colors.textMuted }}>
                        <Calendar size={14} />
                        <span style={{ fontSize: theme.typography.sizes.sm }}>{activePlan.frequency}x/sem</span>
                    </div>
                    <div style={{ width: 1, height: 16, background: currentColors.border }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, color: theme.colors.textMuted }}>
                        <Clock size={14} />
                        <span style={{ fontSize: theme.typography.sizes.sm }}>{activePlan.durationWeeks} semanas</span>
                    </div>
                </div>
            }
        >
            <div style={{ display: 'grid', gap: theme.spacing.md }}>
                {sortedSchedule.map((day, index) => (
                    <Card
                        key={index}
                        onClick={() => navigate(`/app/plans/workout/${activePlan._id}?day=${day.dayOfWeek}`)}
                        style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: theme.spacing.lg,
                            transition: 'transform 0.2s, border-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = theme.colors.primary;
                            e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = currentColors.border;
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: theme.radii.md,
                                background: `${theme.colors.primary}20`,
                                color: theme.colors.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: theme.typography.sizes.lg,
                                fontWeight: theme.typography.weights.bold
                            }}>
                                {day.dayOfWeek}
                            </div>

                            <div>
                                <h3 style={{ margin: 0, fontSize: theme.typography.sizes.lg, color: currentColors.text }}>
                                    {daysOfWeekMap[day.dayOfWeek]}
                                </h3>
                                <p style={{ margin: 0, marginTop: 4, color: theme.colors.textMuted, fontSize: theme.typography.sizes.sm }}>
                                    {day.exercises.length} exercícios • {day.exercises.slice(0, 2).map(e => e.name).join(', ')}
                                    {day.exercises.length > 2 && '...'}
                                </p>
                            </div>
                        </div>

                        <Button variant="ghost" size="sm">
                            <PlayCircle size={20} style={{ marginRight: theme.spacing.xs }} />
                            Começar
                            <ChevronRight size={16} style={{ marginLeft: theme.spacing.xs }} />
                        </Button>
                    </Card>
                ))}
            </div>
        </Page>
    );
};
