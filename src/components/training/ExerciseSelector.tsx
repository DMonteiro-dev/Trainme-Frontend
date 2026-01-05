import { useState } from 'react';
import { Search, Dumbbell, Plus } from 'lucide-react';
import { Modal } from '../../design-system/components/Modal';
import { TextField } from '../../design-system/components/TextField';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';
import { useExercises } from '../../hooks/useExercises';
import { ExerciseDefinition } from '../../api/exercisesApi';

interface ExerciseSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (exercise: ExerciseDefinition) => void;
}

export const ExerciseSelector = ({ isOpen, onClose, onSelect }: ExerciseSelectorProps) => {
    const { currentColors } = useTheme();
    const [search, setSearch] = useState('');
    const [filterMuscle, setFilterMuscle] = useState('');

    const { data: exercises, isLoading } = useExercises({ search, muscleGroup: filterMuscle || undefined });

    const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio', 'full_body', 'other'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Selecionar Exercício">
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md, height: '60vh' }}>
                <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    <div style={{ flex: 1 }}>
                        <TextField
                            placeholder="Pesquisar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <select
                        value={filterMuscle}
                        onChange={(e) => setFilterMuscle(e.target.value)}
                        style={{
                            padding: theme.spacing.sm,
                            borderRadius: theme.radii.md,
                            border: `1px solid ${currentColors.border}`,
                            background: currentColors.surfaceAlt,
                            color: currentColors.text,
                        }}
                    >
                        <option value="">Todos</option>
                        {muscleGroups.map((g) => (
                            <option key={g} value={g}>
                                {g.charAt(0).toUpperCase() + g.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                    {isLoading ? (
                        <p style={{ textAlign: 'center', color: currentColors.textMuted }}>A carregar...</p>
                    ) : exercises?.length === 0 ? (
                        <p style={{ textAlign: 'center', color: currentColors.textMuted }}>Nenhum exercício encontrado.</p>
                    ) : (
                        exercises?.map((exercise) => (
                            <div
                                key={exercise._id}
                                onClick={() => {
                                    onSelect(exercise);
                                    onClose();
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: theme.spacing.md,
                                    padding: theme.spacing.sm,
                                    borderRadius: theme.radii.md,
                                    border: `1px solid ${currentColors.border}`,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = currentColors.surfaceAlt)}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: theme.radii.sm,
                                        background: theme.colors.primary + '20',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: theme.colors.primary,
                                    }}
                                >
                                    <Dumbbell size={16} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                                        <span style={{ fontWeight: theme.typography.weights.medium, color: currentColors.text }}>
                                            {exercise.name}
                                        </span>
                                        <Badge tone={exercise.difficulty === 'beginner' ? 'success' : exercise.difficulty === 'intermediate' ? 'warning' : 'danger'}>
                                            {exercise.difficulty}
                                        </Badge>
                                    </div>
                                    <span style={{ fontSize: theme.typography.sizes.xs, color: currentColors.textMuted }}>
                                        {exercise.muscleGroup} • {exercise.equipment}
                                    </span>
                                </div>
                                <Plus size={20} color={currentColors.textMuted} />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Modal>
    );
};
