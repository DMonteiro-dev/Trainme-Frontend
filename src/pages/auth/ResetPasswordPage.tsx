import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../api/authApi';
import { theme } from '../../design-system/theme';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'A confirmação deve ter pelo menos 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const mutation = useMutation({
        mutationFn: (data: ResetPasswordForm) => resetPassword(token!, data.password),
    });

    const onSubmit = (data: ResetPasswordForm) => {
        if (!token) return;
        mutation.mutate(data);
    };

    if (!token) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: theme.colors.background }}>
                <Card style={{ padding: theme.spacing.xl, textAlign: 'center' }}>
                    <p style={{ color: theme.colors.danger }}>Token inválido ou em falta.</p>
                    <Link to="/forgot-password" style={{ color: theme.colors.primary }}>Voltar</Link>
                </Card>
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: theme.colors.background,
                padding: theme.spacing.md,
            }}
        >
            <Card
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: theme.spacing.xl,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing.lg,
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: theme.colors.text }}>Definir Nova Senha</h1>
                </div>

                {mutation.isSuccess ? (
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.spacing.md }}>
                        <CheckCircle size={48} color={theme.colors.success} />
                        <p style={{ margin: 0, color: theme.colors.text }}>Senha alterada com sucesso!</p>
                        <Button onClick={() => navigate('/login')} style={{ width: '100%' }}>
                            Ir para Login
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.textMuted }}>Nova Senha</label>
                            <input
                                {...register('password')}
                                type="password"
                                style={{
                                    width: '100%',
                                    padding: theme.spacing.md,
                                    borderRadius: theme.radii.sm,
                                    border: `1px solid ${errors.password ? theme.colors.danger : theme.colors.border}`,
                                    backgroundColor: theme.colors.surfaceAlt,
                                    color: theme.colors.text,
                                    fontSize: '1rem',
                                }}
                            />
                            {errors.password && <span style={{ color: theme.colors.danger, fontSize: theme.typography.sizes.xs, marginTop: theme.spacing.xs, display: 'block' }}>{errors.password.message}</span>}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.textMuted }}>Confirmar Senha</label>
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                style={{
                                    width: '100%',
                                    padding: theme.spacing.md,
                                    borderRadius: theme.radii.sm,
                                    border: `1px solid ${errors.confirmPassword ? theme.colors.danger : theme.colors.border}`,
                                    backgroundColor: theme.colors.surfaceAlt,
                                    color: theme.colors.text,
                                    fontSize: '1rem',
                                }}
                            />
                            {errors.confirmPassword && <span style={{ color: theme.colors.danger, fontSize: theme.typography.sizes.xs, marginTop: theme.spacing.xs, display: 'block' }}>{errors.confirmPassword.message}</span>}
                        </div>

                        {mutation.isError && (
                            <div style={{ color: theme.colors.danger, fontSize: '0.9rem', textAlign: 'center' }}>
                                Erro ao redefinir senha. O token pode ter expirado.
                            </div>
                        )}

                        <Button type="submit" disabled={mutation.isPending} style={{ width: '100%' }}>
                            {mutation.isPending ? 'A guardar...' : 'Guardar Nova Senha'}
                        </Button>
                    </form>
                )}

                {!mutation.isSuccess && (
                    <div style={{ textAlign: 'center' }}>
                        <Link
                            to="/login"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: theme.spacing.xs,
                                color: theme.colors.primary,
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                            }}
                        >
                            <ArrowLeft size={16} />
                            Cancelar
                        </Link>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
