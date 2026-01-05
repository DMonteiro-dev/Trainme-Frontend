import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import { ArrowLeft, Video } from 'lucide-react';
import { trainingPlansApi } from '../../api/trainingPlansApi';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Page } from '../../design-system/components/Page';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';

export const WorkoutDetailPage = () => {
    const { id } = useParams(); // Plan ID
    const [searchParams] = useSearchParams();
    const dateParam = searchParams.get('date');
    const dayParam = searchParams.get('day');
    const navigate = useNavigate();
    const { currentColors } = useTheme();

    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showMissedModal, setShowMissedModal] = useState(false);
    const [reason, setReason] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');

    const { data: plan, isLoading } = useQuery({
        queryKey: ['training-plan', id],
        queryFn: () => trainingPlansApi.getById(id!)
    });

    if (isLoading || !plan) return <LoadingSpinner />;

    // Determine target date and day of week
    let dayOfWeek: number;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let targetDateStr: string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let targetDate: Date;

    if (dateParam) {
        targetDate = parseISO(dateParam);
        targetDateStr = dateParam;
        dayOfWeek = targetDate.getDay();
        if (dayOfWeek === 0) dayOfWeek = 7;
    } else if (dayParam) {
        targetDate = new Date();
        targetDateStr = targetDate.toISOString();
        dayOfWeek = parseInt(dayParam, 10);
    } else {
        return <div style={{ padding: theme.spacing.lg, color: currentColors.text }}>Parâmetros inválidos.</div>;
    }

    const dailyPlan = plan.schedule.find(s => s.dayOfWeek === dayOfWeek);

    if (!dailyPlan) {
        return (
            <Page title="Sem Treino">
                <div style={{ textAlign: 'center', padding: theme.spacing.xl, color: theme.colors.textMuted }}>
                    Não há treino agendado para este dia.
                    <div style={{ marginTop: theme.spacing.md }}>
                        <Button variant="ghost" onClick={() => navigate('/app/plans')}>
                            Voltar
                        </Button>
                    </div>
                </div>
            </Page>
        );
    }

    const getEmbedUrl = (url?: string) => {
        if (!url) return null;
        // Simple regex to basic YouTube ID extraction
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }
        return null;
    };

    const daysOfWeekMap: Record<number, string> = {
        1: 'Segunda-feira',
        2: 'Terça-feira',
        3: 'Quarta-feira',
        4: 'Quinta-feira',
        5: 'Sexta-feira',
        6: 'Sábado',
        7: 'Domingo',
    };

    return (
        <Page
            title={daysOfWeekMap[dayOfWeek]}
            description={`${dailyPlan.exercises.length} exercícios`}
            actions={
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/plans')}>
                    <ArrowLeft size={16} style={{ marginRight: theme.spacing.xs }} />
                    Voltar
                </Button>
            }
        >
            <div style={{ paddingBottom: theme.spacing.xl }}>
                <div style={{ display: 'grid', gap: theme.spacing.lg }}>
                    {dailyPlan.exercises.map((exercise, index) => {
                        const embedUrl = getEmbedUrl(exercise.videoLink);

                        return (
                            <Card key={index} style={{ overflow: 'hidden' }}>
                                <div style={{ marginBottom: theme.spacing.md, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3 style={{ margin: 0, fontSize: theme.typography.sizes.lg, color: currentColors.text }}>
                                        {exercise.name}
                                    </h3>
                                    {exercise.videoLink && !embedUrl && (
                                        <a
                                            href={exercise.videoLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: theme.colors.primary, display: 'flex', alignItems: 'center' }}
                                        >
                                            <Video size={20} />
                                        </a>
                                    )}
                                </div>

                                {embedUrl && (
                                    <div style={{
                                        position: 'relative',
                                        paddingBottom: '56.25%', /* 16:9 Aspect Ratio */
                                        height: 0,
                                        marginBottom: theme.spacing.md,
                                        borderRadius: theme.radii.md,
                                        overflow: 'hidden',
                                        background: '#000'
                                    }}>
                                        <iframe
                                            src={embedUrl}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                border: 0
                                            }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title="Embedded youtube"
                                        />
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
                                    <div style={{
                                        background: currentColors.surfaceAlt,
                                        padding: theme.spacing.sm,
                                        borderRadius: theme.radii.md,
                                        textAlign: 'center',
                                        border: `1px solid ${currentColors.border}`
                                    }}>
                                        <span style={{ display: 'block', fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted, textTransform: 'uppercase' }}>
                                            Séries
                                        </span>
                                        <span style={{ fontSize: theme.typography.sizes.xl, fontWeight: 'bold', color: currentColors.text }}>
                                            {exercise.sets}
                                        </span>
                                    </div>
                                    <div style={{
                                        background: currentColors.surfaceAlt,
                                        padding: theme.spacing.sm,
                                        borderRadius: theme.radii.md,
                                        textAlign: 'center',
                                        border: `1px solid ${currentColors.border}`
                                    }}>
                                        <span style={{ display: 'block', fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted, textTransform: 'uppercase' }}>
                                            Reps
                                        </span>
                                        <span style={{ fontSize: theme.typography.sizes.xl, fontWeight: 'bold', color: currentColors.text }}>
                                            {exercise.reps}
                                        </span>
                                    </div>
                                </div>

                                {exercise.instructions && (
                                    <div style={{
                                        padding: theme.spacing.md,
                                        background: `${theme.colors.primary}10`,
                                        borderRadius: theme.radii.md,
                                        border: `1px solid ${theme.colors.primary}30`
                                    }}>
                                        <p style={{ margin: 0, fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>
                                            {exercise.instructions}
                                        </p>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>
        </Page>
    );
};
