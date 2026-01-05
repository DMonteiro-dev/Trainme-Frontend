import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Circle, Clock } from 'lucide-react';
import { trainingPlansApi } from '../../api/trainingPlansApi';
import { theme } from '../../design-system/theme';
import { TrainingPlanProgressSummary } from '../../types';

export const ClientProgressPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: plan, isLoading } = useQuery({
        queryKey: ['trainer-plan', id],
        queryFn: () => trainingPlansApi.getById(id!),
        enabled: !!id,
    });

    if (isLoading || !plan) {
        return <div style={{ padding: theme.spacing.xl, color: theme.colors.text }}>A carregar progresso...</div>;
    }

    return (
        <div style={{ padding: theme.spacing.lg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
                <button
                    onClick={() => navigate('/trainer/plans')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: theme.colors.textMuted,
                        cursor: 'pointer',
                        padding: 0,
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.text, margin: 0 }}>
                        Progresso: {plan.name}
                    </h1>
                    <p style={{ color: theme.colors.textMuted, margin: 0, fontSize: theme.typography.sizes.sm }}>
                        Acompanhamento dos clientes atribuídos
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: theme.spacing.lg }}>
                {plan.progress?.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: theme.spacing.xl, textAlign: 'center', color: theme.colors.textMuted, border: `1px dashed ${theme.colors.border}`, borderRadius: theme.radii.md }}>
                        Nenhum cliente atribuído ou sem dados de progresso.
                    </div>
                ) : (
                    plan.progress?.map((item: TrainingPlanProgressSummary) => (
                        <div
                            key={item.client.id}
                            style={{
                                backgroundColor: theme.colors.surface,
                                borderRadius: theme.radii.md,
                                border: `1px solid ${theme.colors.border}`,
                                padding: theme.spacing.lg,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
                                <div
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: theme.colors.primary,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontWeight: theme.typography.weights.bold,
                                    }}
                                >
                                    {item.client.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: theme.typography.weights.medium, color: theme.colors.text }}>{item.client.name}</div>
                                    <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted }}>{item.client.email}</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: theme.spacing.md }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.xs, fontSize: theme.typography.sizes.sm }}>
                                    <span style={{ color: theme.colors.textMuted }}>Conclusão</span>
                                    <span style={{ color: theme.colors.text, fontWeight: theme.typography.weights.bold }}>{Math.round(item.completionRate)}%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radii.pill, overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            width: `${item.completionRate}%`,
                                            height: '100%',
                                            backgroundColor: item.completionRate === 100 ? theme.colors.success : theme.colors.primary,
                                            borderRadius: theme.radii.pill,
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <CheckCircle size={14} color={theme.colors.success} />
                                    <span>{item.completedExercises} / {item.totalExercises} ex.</span>
                                </div>
                                {item.lastCompletedAt && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Clock size={14} />
                                        <span>{new Date(item.lastCompletedAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
