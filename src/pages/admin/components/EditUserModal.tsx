import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminUser } from '../../../api/adminApi';
import { theme } from '../../../design-system/theme';
import { AdminUser } from '../../../types';

const editUserSchema = z.object({
    name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    role: z.enum(['admin', 'trainer', 'client']),
    status: z.enum(['active', 'blocked', 'pending']),
});

type EditUserForm = z.infer<typeof editUserSchema>;

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: AdminUser;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user }) => {
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<EditUserForm>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status as any,
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status as any,
            });
        }
    }, [isOpen, user, reset]);

    const updateMutation = useMutation({
        mutationFn: (data: EditUserForm) => updateAdminUser(user.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-user', user.id] });
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            onClose();
        },
    });

    const onSubmit = (data: EditUserForm) => {
        updateMutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                backdropFilter: 'blur(4px)',
            }}
        >
            <div
                style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.radii.md,
                    padding: theme.spacing.xl,
                    width: '100%',
                    maxWidth: '500px',
                    border: `1px solid ${theme.colors.border}`,
                    position: 'relative',
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: theme.spacing.md,
                        right: theme.spacing.md,
                        background: 'none',
                        border: 'none',
                        color: theme.colors.textMuted,
                        cursor: 'pointer',
                    }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginTop: 0, marginBottom: theme.spacing.lg, color: theme.colors.text }}>
                    Editar Utilizador
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.textMuted }}>Nome</label>
                        <input
                            {...register('name')}
                            style={{
                                width: '100%',
                                padding: theme.spacing.sm,
                                borderRadius: theme.radii.sm,
                                border: `1px solid ${theme.colors.border}`,
                                backgroundColor: theme.colors.surfaceAlt,
                                color: theme.colors.text,
                            }}
                        />
                        {errors.name && <span style={{ color: theme.colors.danger, fontSize: theme.typography.sizes.xs }}>{errors.name.message}</span>}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.textMuted }}>Email</label>
                        <input
                            {...register('email')}
                            style={{
                                width: '100%',
                                padding: theme.spacing.sm,
                                borderRadius: theme.radii.sm,
                                border: `1px solid ${theme.colors.border}`,
                                backgroundColor: theme.colors.surfaceAlt,
                                color: theme.colors.text,
                            }}
                        />
                        {errors.email && <span style={{ color: theme.colors.danger, fontSize: theme.typography.sizes.xs }}>{errors.email.message}</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.textMuted }}>Role</label>
                            <select
                                {...register('role')}
                                style={{
                                    width: '100%',
                                    padding: theme.spacing.sm,
                                    borderRadius: theme.radii.sm,
                                    border: `1px solid ${theme.colors.border}`,
                                    backgroundColor: theme.colors.surfaceAlt,
                                    color: theme.colors.text,
                                }}
                            >
                                <option value="client">Client</option>
                                <option value="trainer">Trainer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.textMuted }}>Status</label>
                            <select
                                {...register('status')}
                                style={{
                                    width: '100%',
                                    padding: theme.spacing.sm,
                                    borderRadius: theme.radii.sm,
                                    border: `1px solid ${theme.colors.border}`,
                                    backgroundColor: theme.colors.surfaceAlt,
                                    color: theme.colors.text,
                                }}
                            >
                                <option value="active">Active</option>
                                <option value="blocked">Blocked</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                                borderRadius: theme.radii.sm,
                                border: `1px solid ${theme.colors.border}`,
                                backgroundColor: 'transparent',
                                color: theme.colors.text,
                                cursor: 'pointer',
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || updateMutation.isPending}
                            style={{
                                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                                borderRadius: theme.radii.sm,
                                border: 'none',
                                backgroundColor: theme.colors.primary,
                                color: '#fff',
                                cursor: 'pointer',
                                opacity: isSubmitting ? 0.7 : 1,
                            }}
                        >
                            {updateMutation.isPending ? 'A guardar...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
