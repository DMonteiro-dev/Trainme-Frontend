import React, { useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { theme } from '../../design-system/theme';
import { Dumbbell, CheckCircle, Clock } from 'lucide-react';
import { TrainingPlanWorkout } from '../../types';

interface ScheduledWorkout {
    workoutId: string;
    date: string | Date;
    time?: string;
    completed?: boolean;
}

interface WeeklyCalendarProps {
    weekStartDate: Date;
    workouts: TrainingPlanWorkout[];
    schedule: ScheduledWorkout[];
    onDrop?: (workoutId: string, date: Date, time?: string) => void;
    onWorkoutClick?: (workout: TrainingPlanWorkout) => void;
    isTrainer?: boolean;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
    weekStartDate,
    workouts,
    schedule,
    onDrop,
    onWorkoutClick,
    isTrainer = false
}) => {
    const days = useMemo(() => {
        const start = startOfWeek(weekStartDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }, [weekStartDate]);

    const getWorkoutsForDay = (date: Date) => {
        return schedule.filter(s => isSameDay(new Date(s.date), date)).map(s => {
            const workout = workouts.find(w => w.id === s.workoutId);
            return { ...s, workout };
        }).filter(item => item.workout);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = theme.colors.surfaceAlt;
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.backgroundColor = 'transparent';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, date: Date) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = 'transparent';
        const workoutId = e.dataTransfer.getData('workoutId');
        if (workoutId && onDrop) {
            onDrop(workoutId, date);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: theme.spacing.sm }}>
            {days.map((day) => {
                const dayWorkouts = getWorkoutsForDay(day);
                const isToday = isSameDay(day, new Date());

                return (
                    <div
                        key={day.toISOString()}
                        onDragOver={isTrainer ? handleDragOver : undefined}
                        onDragLeave={isTrainer ? handleDragLeave : undefined}
                        onDrop={isTrainer ? (e) => handleDrop(e, day) : undefined}
                        style={{
                            border: `1px solid ${isToday ? theme.colors.primary : theme.colors.border}`,
                            borderRadius: theme.radii.md,
                            minHeight: '150px',
                            backgroundColor: theme.colors.surface,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{
                            padding: theme.spacing.sm,
                            borderBottom: `1px solid ${theme.colors.border}`,
                            textAlign: 'center',
                            backgroundColor: isToday ? theme.colors.primary : 'transparent',
                            color: isToday ? '#fff' : theme.colors.text,
                            borderTopLeftRadius: theme.radii.md,
                            borderTopRightRadius: theme.radii.md
                        }}>
                            <div style={{ fontSize: theme.typography.sizes.xs, textTransform: 'uppercase' }}>
                                {format(day, 'EEE', { locale: pt })}
                            </div>
                            <div style={{ fontWeight: 'bold' }}>
                                {format(day, 'd')}
                            </div>
                        </div>

                        <div style={{ padding: theme.spacing.xs, flex: 1, display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
                            {dayWorkouts.map((item, index) => (
                                <div
                                    key={`${item.workoutId}-${index}`}
                                    onClick={() => item.workout && onWorkoutClick?.(item.workout)}
                                    style={{
                                        padding: theme.spacing.xs,
                                        backgroundColor: theme.colors.surfaceAlt,
                                        borderRadius: theme.radii.sm,
                                        fontSize: theme.typography.sizes.xs,
                                        cursor: 'pointer',
                                        border: `1px solid ${theme.colors.border}`
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                        {item.completed ? <CheckCircle size={12} color={theme.colors.success} /> : <Dumbbell size={12} />}
                                        <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.workout?.title}
                                        </span>
                                    </div>
                                    {item.time && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.colors.textMuted }}>
                                            <Clock size={10} />
                                            {item.time}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
