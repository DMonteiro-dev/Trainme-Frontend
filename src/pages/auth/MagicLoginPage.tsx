import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginWithMagicLink } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { theme } from '../../design-system/theme';
import { User } from '../../types';

const MagicLoginPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loadUserFromStorage } = useAuth(); // We might need a way to set auth state directly
    // Actually AuthContext handles login via `login` function which takes credentials.
    // We need a way to set auth state from tokens directly.
    // But `loadUserFromStorage` reads from localStorage.
    // So we can set localStorage and call `loadUserFromStorage`.

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setError('Token inválido ou em falta.');
            return;
        }

        const performLogin = async () => {
            try {
                const data = await loginWithMagicLink(token) as { user: User; accessToken: string; refreshToken: string };
                // data: { user, accessToken, refreshToken }

                // Manually set localStorage (matching AuthContext logic)
                localStorage.setItem('trainme.auth', JSON.stringify({
                    user: data.user,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken
                }));

                // Reload auth state
                await loadUserFromStorage();

                setStatus('success');
                setTimeout(() => {
                    navigate('/app/dashboard');
                }, 1000);
            } catch (err: any) {
                setStatus('error');
                setError(err.message || 'Falha ao iniciar sessão via Magic Link.');
            }
        };

        performLogin();
    }, [searchParams, navigate, loadUserFromStorage]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme.colors.background
        }}>
            <Card style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h2 style={{ marginBottom: theme.spacing.md }}>Magic Login</h2>

                {status === 'loading' && <p>A autenticar...</p>}

                {status === 'success' && (
                    <p style={{ color: theme.colors.success }}>
                        Sucesso! A redirecionar...
                    </p>
                )}

                {status === 'error' && (
                    <div>
                        <p style={{ color: theme.colors.danger, marginBottom: theme.spacing.md }}>
                            {error}
                        </p>
                        <a href="/login" style={{ color: theme.colors.primary }}>Ir para Login</a>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MagicLoginPage;
