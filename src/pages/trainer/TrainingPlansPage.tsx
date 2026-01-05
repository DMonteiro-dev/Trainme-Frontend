import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Plus,
    Calendar,
    Dumbbell,
    Clock,
    Search
} from 'lucide-react';
import { trainingPlansApi } from '../../api/trainingPlansApi';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Page } from '../../design-system/components/Page';
import { TextField } from '../../design-system/components/TextField';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';

export const TrainingPlansPage = () => {
    const navigate = useNavigate();
    const { currentColors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

    const { data: plans, isLoading } = useQuery({
        queryKey: ['training-plans'],
        queryFn: () => trainingPlansApi.list()
    });

    const filteredPlans = useMemo(() => {
        if (!plans) return [];
        return plans.filter(plan => {
            const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (typeof plan.clientId === 'object' && plan.clientId.name.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [plans, searchQuery, statusFilter]);

    if (isLoading) return <LoadingSpinner />;

    return (
        <Page
            title="Planos de Treino"
            description="Gerir e monitorizar o progresso dos atletas"
            actions={
                <Button onClick={() => navigate('/app/trainer/plans/new')}>
                    <Plus size={18} />
                    Novo Plano
                </Button>
            }
        >
            {/* Controls Section */}
            <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ position: 'relative' }}>
                            <TextField
                                placeholder="Pesquisar por plano ou atleta..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                            <Search
                                size={16}
                                style={{
                                    position: 'absolute',
                                    left: '0.9rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: theme.colors.textMuted,
                                    pointerEvents: 'none'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                        {(['all', 'active', 'archived'] as const).map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setStatusFilter(status)}
                                style={{ textTransform: 'capitalize' }}
                            >
                                {status === 'all' ? 'Todos' : status === 'active' ? 'Ativos' : 'Arquivados'}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Grid Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: theme.spacing.md
            }}>
                {filteredPlans.map((plan) => (
                    <Card
                        key={plan._id}
                        onClick={() => navigate(`/app/trainer/plans/${plan._id}`)}
                        style={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: theme.spacing.md,
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.2s, border-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = theme.colors.primary;
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = currentColors.border;
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {/* Status Stripe */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: plan.status === 'active' ? theme.colors.success : theme.colors.textMuted
                            }}
                        />

                        {/* Header */}
                        <div style={{ marginTop: theme.spacing.xs }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, fontSize: theme.typography.sizes.lg, color: currentColors.text }}>
                                    {plan.name}
                                </h3>
                                <div style={{
                                    fontSize: theme.typography.sizes.xs,
                                    padding: '2px 8px',
                                    borderRadius: theme.radii.pill,
                                    background: plan.status === 'active' ? `${theme.colors.success}20` : `${theme.colors.textMuted}20`,
                                    color: plan.status === 'active' ? theme.colors.success : theme.colors.textMuted,
                                    fontWeight: theme.typography.weights.medium
                                }}>
                                    {plan.status === 'active' ? 'Ativo' : 'Arquivado'}
                                </div>
                            </div>
                        </div>

                        {/* Client Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                            <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: theme.colors.primary,
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: theme.typography.sizes.sm,
                                fontWeight: theme.typography.weights.bold
                            }}>
                                {typeof plan.clientId === 'object' ? plan.clientId.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                                <div style={{ fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.medium }}>
                                    {typeof plan.clientId === 'object' ? plan.clientId.name : 'Cliente'}
                                </div>
                                <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted }}>
                                    {typeof plan.clientId === 'object' ? plan.clientId.email : '-'}
                                </div>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: theme.spacing.sm,
                            paddingTop: theme.spacing.sm,
                            borderTop: `1px solid ${currentColors.border}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, color: theme.colors.textMuted }}>
                                <Calendar size={14} />
                                <span style={{ fontSize: theme.typography.sizes.sm }}>
                                    {plan.frequency}x / semana
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, color: theme.colors.textMuted }}>
                                <Clock size={14} />
                                <span style={{ fontSize: theme.typography.sizes.sm }}>
                                    {plan.durationWeeks} semanas
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {filteredPlans.length === 0 && (
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
                        <Dumbbell size={32} color={theme.colors.textMuted} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: theme.typography.sizes.lg, marginBottom: theme.spacing.xs }}>
                            {searchQuery ? 'Nenhum plano encontrado' : 'Sem planos criados'}
                        </h3>
                        <p style={{ margin: 0, color: theme.colors.textMuted }}>
                            {searchQuery
                                ? `Não encontramos resultados para "${searchQuery}"`
                                : 'Começa por criar o teu primeiro plano de treino para os teus atletas.'}
                        </p>
                    </div>
                    <Button onClick={() => navigate('/app/trainer/plans/new')} variant="secondary">
                        {searchQuery ? 'Limpar pesquisa' : 'Criar Plano'}
                    </Button>
                </Card>
            )}
        </Page>
    );
};
