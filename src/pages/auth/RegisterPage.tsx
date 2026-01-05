import { useState, type CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { TextField } from '../../design-system/components/TextField';
import { theme } from '../../design-system/theme';
import apiClient from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

import { registerSchema, type RegisterFormValues } from '../../lib/schemas/auth';


const selectStyle: CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.9rem',
  background: theme.colors.surfaceAlt,
  color: theme.colors.text,
  borderRadius: theme.radii.md,
  border: `1px solid ${theme.colors.border}`,
};

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'client',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await apiClient.post('/api/auth/register', {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role ?? 'client',
      });

      await login({ email: values.email, password: values.password });
      navigate('/app/dashboard', { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = (error.response?.data as { message?: string })?.message ?? 'Não foi possível criar a conta.';
        setServerError(message);
      } else {
        setServerError('A criação de conta falhou. Tenta novamente.');
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: 'clamp(2rem, 5vw, 4rem) 1rem',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.lg,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: theme.colors.primarySoft,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: theme.typography.sizes.xs,
            }}
          >
            Começa hoje
          </p>
          <h1 style={{ margin: `${theme.spacing.xs} 0 ${theme.spacing.sm}` }}>Criar conta</h1>
          <p style={{ margin: 0, color: theme.colors.textMuted }}>Controla clientes, planos e sessões numa única plataforma.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <TextField label="Nome" placeholder="Joana Silva" error={errors.name?.message} {...register('name')} />
          <TextField
            label="Email"
            type="email"
            placeholder="treinador@trainme.app"
            error={errors.email?.message}
            {...register('email')}
          />
          <input type="hidden" {...register('role')} value="client" />
          <TextField
            label="Palavra-passe"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <TextField
            label="Confirmar palavra-passe"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {serverError && (
            <p style={{ color: theme.colors.danger, margin: 0, fontSize: theme.typography.sizes.sm }}>{serverError}</p>
          )}

          <Button type="submit" disabled={isSubmitting} fullWidth>
            {isSubmitting ? 'A criar conta...' : 'Criar conta'}
          </Button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs, fontSize: theme.typography.sizes.sm }}>
          <span>
            Já tens conta?{' '}
            <Link to="/login" style={{ color: theme.colors.primary }}>
              Inicia sessão
            </Link>
          </span>
          <Link to="/" style={{ color: theme.colors.textMuted }}>
            ← Voltar à página inicial
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
