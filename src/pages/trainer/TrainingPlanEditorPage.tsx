import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Save, Trash2, Plus, ArrowLeft, Video } from 'lucide-react';
import { trainingPlansApi, ITrainingPlan } from '../../api/trainingPlansApi';
import { fetchTrainerClients } from '../../api/trainerApi';
import { Button } from '../../design-system/components/Button';
import { TextField } from '../../design-system/components/TextField';
import { Select } from '../../design-system/components/Select';
import { Card } from '../../design-system/components/Card';
import { Page } from '../../design-system/components/Page';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';

interface PlanForm {
    name: string;
    clientId: string;
    frequency: 3 | 4 | 5;
    durationWeeks: number;
    schedule: {
        dayOfWeek: number;
        exercises: {
            name: string;
            sets: number;
            reps: string;
            instructions?: string;
            videoLink?: string;
        }[];
    }[];
}

export const TrainingPlanEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { currentColors } = useTheme();
    const isNew = id === 'new';

    const { data: clients } = useQuery({
        queryKey: ['clients'],
        queryFn: () => fetchTrainerClients()
    });

    const { data: plan, isLoading } = useQuery({
        queryKey: ['training-plan', id],
        queryFn: () => trainingPlansApi.getById(id!),
        enabled: !isNew
    });

    const { control, register, handleSubmit, watch, setValue, reset } = useForm<PlanForm>({
        defaultValues: {
            frequency: 3,
            durationWeeks: 4,
            schedule: Array(3).fill(null).map((_, i) => ({
                dayOfWeek: i + 1,
                exercises: []
            }))
        }
    });

    useEffect(() => {
        if (plan) {
            reset({
                name: plan.name,
                clientId: typeof plan.clientId === 'object' ? plan.clientId._id : plan.clientId,
                frequency: plan.frequency,
                durationWeeks: plan.durationWeeks,
                schedule: plan.schedule
            });
        }
    }, [plan, reset]);

    const frequency = watch('frequency');

    useEffect(() => {
        const currentSchedule = watch('schedule');
        if (currentSchedule.length !== frequency) {
            // Smart defaults for days
            const defaultDays = frequency === 3 ? [1, 3, 5] :
                frequency === 4 ? [1, 2, 4, 5] :
                    [1, 2, 3, 4, 5]; // 5 days

            const newSchedule = Array(frequency).fill(null).map((_, i) => {
                const existing = currentSchedule[i];
                // Ensure exercises array exists if copying from undefined/null
                return existing || { dayOfWeek: defaultDays[i] || (i + 1), exercises: [] };
            });
            setValue('schedule', newSchedule);
        }
    }, [frequency, setValue, watch]);

    const createMutation = useMutation({
        mutationFn: trainingPlansApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-plans'] });
            navigate('/app/plans');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<ITrainingPlan>) => trainingPlansApi.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-plans'] });
            navigate('/app/plans');
        }
    });

    const onSubmit = (data: PlanForm) => {
        if (isNew) {
            createMutation.mutate(data as any);
        } else {
            updateMutation.mutate(data as any);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <Page
            title={isNew ? 'Novo Plano de Treino' : 'Editar Plano'}
            actions={
                <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    <Button variant="ghost" onClick={() => navigate('/app/plans')}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={createMutation.isPending || updateMutation.isPending}
                    >
                        <Save size={16} />
                        Guardar
                    </Button>
                </div>
            }
        >
            <Card style={{ display: 'grid', gap: theme.spacing.md }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                    <TextField
                        label="Nome do Plano"
                        {...register('name', { required: 'Nome é obrigatório' })}
                        placeholder="Ex: Hipertrofia Iniciante"
                    />
                    <Select
                        label="Cliente"
                        {...register('clientId', { required: 'Cliente é obrigatório' })}
                    >
                        <option value="">Selecione um cliente</option>
                        {clients?.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </Select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                    <Select
                        label="Frequência Semanal"
                        {...register('frequency', { valueAsNumber: true })}
                    >
                        <option value={3}>3 dias / semana</option>
                        <option value={4}>4 dias / semana</option>
                        <option value={5}>5 dias / semana</option>
                    </Select>
                    <TextField
                        label="Duração (Semanas)"
                        type="number"
                        {...register('durationWeeks', { valueAsNumber: true, min: 1 })}
                    />
                </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
                {watch('schedule').map((day, dayIndex) => (
                    <DayEditor
                        key={dayIndex}
                        dayIndex={dayIndex}
                        control={control}
                        register={register}
                        currentColors={currentColors}
                    />
                ))}
            </div>
        </Page>
    );
};

const DayEditor = ({ dayIndex, control, register, currentColors }: { dayIndex: number, control: any, register: any, currentColors: any }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `schedule.${dayIndex}.exercises`
    });

    const daysOfWeek = [
        { value: 1, label: 'Segunda-feira' },
        { value: 2, label: 'Terça-feira' },
        { value: 3, label: 'Quarta-feira' },
        { value: 4, label: 'Quinta-feira' },
        { value: 5, label: 'Sexta-feira' },
        { value: 6, label: 'Sábado' },
        { value: 7, label: 'Domingo' },
    ];

    return (
        <Card>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.md,
                borderBottom: `1px solid ${currentColors.border}`,
                paddingBottom: theme.spacing.md
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                    <h3 style={{ margin: 0, fontSize: theme.typography.sizes.lg, color: currentColors.text }}>
                        Treino {dayIndex + 1}
                    </h3>
                    <Select
                        {...register(`schedule.${dayIndex}.dayOfWeek` as const, { valueAsNumber: true })}
                        style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.8rem' }}
                    >
                        {daysOfWeek.map((day) => (
                            <option key={day.value} value={day.value}>
                                {day.label}
                            </option>
                        ))}
                    </Select>
                </div>
                <span style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>
                    {fields.length} / 10 exercícios
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        style={{
                            padding: theme.spacing.md,
                            background: currentColors.surfaceAlt,
                            borderRadius: theme.radii.md,
                            border: `1px solid ${currentColors.border}`,
                            position: 'relative'
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            style={{
                                position: 'absolute',
                                top: theme.spacing.xs,
                                right: theme.spacing.xs,
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: theme.colors.textMuted,
                                padding: theme.spacing.xs
                            }}
                            title="Remover exercício"
                        >
                            <Trash2 size={14} />
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: theme.spacing.md }}>
                            <div style={{ gridColumn: 'span 4' }}>
                                <TextField
                                    label="Exercício"
                                    {...register(`schedule.${dayIndex}.exercises.${index}.name` as const, { required: true })}
                                    placeholder="Nome do exercício"
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <TextField
                                    label="Séries"
                                    type="number"
                                    {...register(`schedule.${dayIndex}.exercises.${index}.sets` as const, { required: true, min: 1 })}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <TextField
                                    label="Reps"
                                    {...register(`schedule.${dayIndex}.exercises.${index}.reps` as const, { required: true })}
                                    placeholder="Ex: 10-12"
                                />
                            </div>
                            <div style={{ gridColumn: 'span 4' }}>
                                <TextField
                                    label="Link Vídeo (Opcional)"
                                    {...register(`schedule.${dayIndex}.exercises.${index}.videoLink` as const)}
                                    placeholder="https://..."
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <TextField
                                    label="Instruções (Opcional)"
                                    {...register(`schedule.${dayIndex}.exercises.${index}.instructions` as const)}
                                    placeholder="Dicas de execução..."
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {fields.length < 10 && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => append({ name: '', sets: 3, reps: '10' })}
                        style={{ borderStyle: 'dashed' }}
                    >
                        <Plus size={16} />
                        Adicionar Exercício
                    </Button>
                )}
            </div>
        </Card>
    );
};
