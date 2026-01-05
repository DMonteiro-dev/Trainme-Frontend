import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { sessionsApi } from '../../api/sessionsApi';
import { useTheme } from '../../context/ThemeContext';
import { theme } from '../../design-system/theme';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const SessionStatsGraph = ({ clientId }: { clientId?: string }) => {
    const { currentColors } = useTheme();
    const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

    const { data: stats, isLoading } = useQuery({
        queryKey: ['session-stats', clientId],
        queryFn: () => sessionsApi.getStats(clientId)
    });

    if (isLoading) return <Card><LoadingSpinner /></Card>;
    if (!stats) return null;

    const data = period === 'weekly'
        ? stats.weekly.map(item => ({
            label: `Sem ${item._id.week}`,
            completed: item.completed,
            missed: item.missed,
            total: item.total
        }))
        : stats.monthly.map(item => {
            const date = new Date();
            date.setMonth(item._id.month - 1);
            return {
                label: date.toLocaleString('pt-PT', { month: 'short' }),
                completed: item.completed,
                missed: item.missed,
                total: item.total
            };
        });

    return (
        <Card style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
                <h3 style={{ margin: 0, color: currentColors.text }}>Evolução de Treinos</h3>
                <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                    <Button
                        size="sm"
                        variant={period === 'weekly' ? 'primary' : 'ghost'}
                        onClick={() => setPeriod('weekly')}
                    >
                        Semanas
                    </Button>
                    <Button
                        size="sm"
                        variant={period === 'monthly' ? 'primary' : 'ghost'}
                        onClick={() => setPeriod('monthly')}
                    >
                        Meses
                    </Button>
                </div>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={currentColors.border} vertical={false} />
                            <XAxis
                                dataKey="label"
                                stroke={currentColors.textMuted}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke={currentColors.textMuted}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: currentColors.surface,
                                    borderColor: currentColors.border,
                                    borderRadius: theme.radii.md
                                }}
                            />
                            <Legend />
                            <Bar
                                dataKey="completed"
                                name="Concluídos"
                                fill={theme.colors.success}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                            <Bar
                                dataKey="missed"
                                name="Falhados"
                                fill={theme.colors.danger}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentColors.textMuted }}>
                        Sem dados disponíveis.
                    </div>
                )}
            </div>
        </Card>
    );
};
