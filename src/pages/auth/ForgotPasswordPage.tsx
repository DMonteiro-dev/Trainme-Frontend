import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/authApi';
import { theme } from '../../design-system/theme';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
    email: z.string().email('Email inválido'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const mutation = useMutation({
        mutationFn: (data: ForgotPasswordForm) => forgotPassword(data.email),
    });

    const onSubmit = (data: ForgotPasswordForm) => {
        mutation.mutate(data);
    };

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
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: theme.colors.text }}>Recuperar Senha</h1>
                    <p style={{ margin: `${theme.spacing.sm} 0 0`, color: theme.colors.textMuted }}>
                        Insira o seu email para receber um link de recuperação.
                    </p>
                </div>

                {mutation.isSuccess ? (
                    <div style={{ textAlign: 'center', color: theme.colors.success, padding: theme.spacing.md, backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radii.md }}>
                        <p style={{ margin: 0 }}>Email enviado! Verifique a sua caixa de entrada (ou a consola do servidor).</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.textMuted }}>Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="seu@email.com"
                                style={{
                                    width: '100%',
                                    padding: theme.spacing.md,
                                    borderRadius: theme.radii.sm,
                                    border: `1px solid ${errors.email ? theme.colors.danger : theme.colors.border}`,
                                    backgroundColor: theme.colors.surfaceAlt,
                                    color: theme.colors.text,
                                    fontSize: '1rem',
                                }}
                            />
                            {errors.email && <span style={{ color: theme.colors.danger, fontSize: theme.typography.sizes.xs, marginTop: theme.spacing.xs, display: 'block' }}>{errors.email.message}</span>}
                        </div>

                        {mutation.isError && (
                            <div style={{ color: theme.colors.danger, fontSize: '0.9rem', textAlign: 'center' }}>
                                Ocorreu um erro. Verifique o email ou tente novamente.
                            </div>
                        )}

                        <Button type="submit" disabled={mutation.isPending} style={{ width: '100%' }}>
                            {mutation.isPending ? 'A enviar...' : 'Enviar Link'}
                        </Button>
                    </form>
                )}

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
                        Voltar ao Login
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
