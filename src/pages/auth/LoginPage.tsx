import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QrCode } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { TextField } from '../../design-system/components/TextField';
import { theme } from '../../design-system/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { QRScannerModal } from '../../components/common/QRScannerModal';

import { loginSchema, type LoginFormValues } from '../../lib/schemas/auth';

// ... existing schema ... (removed)


const LoginPage = () => {
  const { login, loginWithQr } = useAuth(); // Destructure loginWithQr
  const { currentColors } = useTheme();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values);
      navigate('/app/dashboard', { replace: true });
    } catch (error) {
      // ... existing error handling
      if (axios.isAxiosError(error)) {
        const message = (error.response?.data as { message?: string })?.message ?? 'Credenciais inválidas.';
        setServerError(message);
      } else {
        setServerError('Não foi possível iniciar sessão. Tenta novamente.');
      }
    }
  };

  const handleQRScan = async (decodedText: string) => {
    setServerError(null);
    try {
      const data = JSON.parse(decodedText);
      if (data.userId) {
        await loginWithQr(data.userId);
        navigate('/app/dashboard', { replace: true });
      } else {
        console.error('Invalid QR Code format', data);
        setServerError('Código QR inválido.');
      }
    } catch (error) {
      console.error('QR Login Error:', error);
      setServerError('Falha ao entrar com QR Code.');
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
          maxWidth: '420px',
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
            Bem-vindo de volta
          </p>
          <h1 style={{ margin: `${theme.spacing.xs} 0 ${theme.spacing.sm}`, color: currentColors.text }}>Iniciar sessão</h1>
          <p style={{ margin: 0, color: currentColors.textMuted }}>Entra na tua conta para gerir treinos e clientes.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <TextField
            label="Email"
            type="email"
            placeholder="treinador@trainme.app"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Palavra-passe"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div style={{ textAlign: 'right', marginTop: `-${theme.spacing.sm}` }}>
            <Link to="/forgot-password" style={{ color: theme.colors.primary, fontSize: theme.typography.sizes.sm, textDecoration: 'none' }}>
              Esqueceu a senha?
            </Link>
          </div>

          {serverError && (
            <p style={{ color: theme.colors.danger, margin: 0, fontSize: theme.typography.sizes.sm }}>{serverError}</p>
          )}

          <Button type="submit" disabled={isSubmitting} fullWidth>
            {isSubmitting ? 'A entrar...' : 'Entrar'}
          </Button>

          <div style={{ position: 'relative', textAlign: 'center' }}>
            <span style={{ background: currentColors.surface, padding: '0 10px', color: currentColors.textMuted, fontSize: theme.typography.sizes.sm, position: 'relative', zIndex: 1 }}>OU</span>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: currentColors.border }}></div>
          </div>

          <Button type="button" variant="secondary" fullWidth onClick={() => setIsScannerOpen(true)}>
            <QrCode size={18} style={{ marginRight: 8 }} />
            Dar scan QR Code
          </Button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs, fontSize: theme.typography.sizes.sm }}>
          <span>
            <span style={{ color: currentColors.text }}>Ainda não tens conta?{' '}</span>
            <Link to="/register" style={{ color: theme.colors.primary }}>
              Cria uma conta
            </Link>
          </span>
          <Link to="/" style={{ color: currentColors.textMuted }}>
            ← Voltar à página inicial
          </Link>
        </div>
      </Card>

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleQRScan}
      />
    </div>
  );
};

export default LoginPage;
