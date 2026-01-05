import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Filter, Trash2, Edit2, Dumbbell } from 'lucide-react';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { TextField } from '../../design-system/components/TextField';
import { Modal } from '../../design-system/components/Modal';
import { Badge } from '../../design-system/components/Badge';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';
import { useExercises, useCreateExercise, useUpdateExercise, useDeleteExercise } from '../../hooks/useExercises';
import { ExerciseDefinition } from '../../api/exercisesApi';

const exerciseSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    description: z.string().optional(),
    muscleGroup: z.enum(['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio', 'full_body', 'other']),
    equipment: z.enum(['none', 'dumbbell', 'barbell', 'machine', 'cables', 'kettlebell', 'band', 'other']),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    videoUrl: z.string().url('URL inválido').optional().or(z.literal('')),
});

type ExerciseFormValues = z.infer<typeof exerciseSchema>;

const ExerciseLibraryPage = () => {
    const { currentColors } = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState<ExerciseDefinition | null>(null);
    const [search, setSearch] = useState('');
    const [filterMuscle, setFilterMuscle] = useState('');

    const { data: exercises, isLoading } = useExercises({ search, muscleGroup: filterMuscle || undefined });
    const createMutation = useCreateExercise();
    const updateMutation = useUpdateExercise();
    const deleteMutation = useDeleteExercise();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ExerciseFormValues>({
        resolver: zodResolver(exerciseSchema),
        defaultValues: {
            name: '',
            description: '',
            muscleGroup: 'other',
            equipment: 'none',
            difficulty: 'beginner',
            videoUrl: '',
        },
    });

    const handleOpenModal = (exercise?: ExerciseDefinition) => {
        if (exercise) {
            setEditingExercise(exercise);
            reset({
                name: exercise.name,
                description: exercise.description || '',
                muscleGroup: exercise.muscleGroup,
                equipment: exercise.equipment,
                difficulty: exercise.difficulty,
                videoUrl: exercise.videoUrl || '',
            });
        } else {
            setEditingExercise(null);
            reset({
                name: '',
                description: '',
                muscleGroup: 'other',
                equipment: 'none',
                difficulty: 'beginner',
                videoUrl: '',
            });
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (values: ExerciseFormValues) => {
        try {
            if (editingExercise) {
                await updateMutation.mutateAsync({ id: editingExercise._id, data: values });
            } else {
                await createMutation.mutateAsync(values);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save exercise', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tens a certeza que queres eliminar este exercício?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio', 'full_body', 'other'];
    const equipments = ['none', 'dumbbell', 'barbell', 'machine', 'cables', 'kettlebell', 'band', 'other'];
    const difficulties = ['beginner', 'intermediate', 'advanced'];

    return (
        <Page
            title="Biblioteca de Exercícios"
            description="Gere os exercícios disponíveis para os planos de treino."
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
                <div style={{ display: 'flex', gap: theme.spacing.md, flex: 1, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Search size={20} color={currentColors.textMuted} />
                        <TextField
                            placeholder="Pesquisar exercícios..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        value={filterMuscle}
                        onChange={(e) => setFilterMuscle(e.target.value)}
                        style={{
                            padding: theme.spacing.sm,
                            borderRadius: theme.radii.md,
                            border: `1px solid ${currentColors.border}`,
                            background: currentColors.surface,
                            color: currentColors.text,
                            minWidth: '150px',
                        }}
                    >
                        <option value="">Todos os grupos</option>
                        {muscleGroups.map((g) => (
                            <option key={g} value={g}>
                                {g.charAt(0).toUpperCase() + g.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={20} style={{ marginRight: 8 }} />
                    Novo Exercício
                </Button>
            </div>

            {isLoading ? (
                <p>A carregar...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: theme.spacing.md }}>
                    {exercises?.map((exercise) => (
                        <Card key={exercise._id} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: theme.radii.md,
                                            background: theme.colors.primary + '20',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: theme.colors.primary,
                                        }}
                                    >
                                        <Dumbbell size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: theme.typography.sizes.md, color: currentColors.text }}>{exercise.name}</h3>
                                        <span style={{ fontSize: theme.typography.sizes.xs, color: currentColors.textMuted }}>
                                            {exercise.muscleGroup} • {exercise.equipment}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(exercise)}>
                                        <Edit2 size={16} />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(exercise._id)} style={{ color: theme.colors.danger }}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>

                            {exercise.description && (
                                <p style={{ margin: 0, fontSize: theme.typography.sizes.sm, color: currentColors.textMuted, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {exercise.description}
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: theme.spacing.xs, marginTop: 'auto' }}>
                                <Badge tone={exercise.difficulty === 'beginner' ? 'success' : exercise.difficulty === 'intermediate' ? 'warning' : 'danger'}>
                                    {exercise.difficulty}
                                </Badge>
                                {exercise.isSystem && <Badge tone="default">Sistema</Badge>}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
            >
                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    <TextField
                        label="Nome"
                        placeholder="Ex: Supino Plano"
                        error={errors.name?.message}
                        {...register('name')}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.medium, color: currentColors.text }}>
                            Descrição
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            style={{
                                padding: theme.spacing.sm,
                                borderRadius: theme.radii.md,
                                border: `1px solid ${errors.description ? theme.colors.danger : currentColors.border}`,
                                background: currentColors.surfaceAlt,
                                color: currentColors.text,
                                fontFamily: 'inherit',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.medium, color: currentColors.text }}>
                                Grupo Muscular
                            </label>
                            <select
                                {...register('muscleGroup')}
                                style={{
                                    padding: theme.spacing.sm,
                                    borderRadius: theme.radii.md,
                                    border: `1px solid ${currentColors.border}`,
                                    background: currentColors.surfaceAlt,
                                    color: currentColors.text,
                                }}
                            >
                                {muscleGroups.map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.medium, color: currentColors.text }}>
                                Equipamento
                            </label>
                            <select
                                {...register('equipment')}
                                style={{
                                    padding: theme.spacing.sm,
                                    borderRadius: theme.radii.md,
                                    border: `1px solid ${currentColors.border}`,
                                    background: currentColors.surfaceAlt,
                                    color: currentColors.text,
                                }}
                            >
                                {equipments.map((e) => (
                                    <option key={e} value={e}>{e}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.medium, color: currentColors.text }}>
                            Dificuldade
                        </label>
                        <select
                            {...register('difficulty')}
                            style={{
                                padding: theme.spacing.sm,
                                borderRadius: theme.radii.md,
                                border: `1px solid ${currentColors.border}`,
                                background: currentColors.surfaceAlt,
                                color: currentColors.text,
                            }}
                        >
                            {difficulties.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <TextField
                        label="URL do Vídeo (Opcional)"
                        placeholder="https://youtube.com/..."
                        error={errors.videoUrl?.message}
                        {...register('videoUrl')}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                            {createMutation.isPending || updateMutation.isPending ? 'A guardar...' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </Page>
    );
};

export default ExerciseLibraryPage;
