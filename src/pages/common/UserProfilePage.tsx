import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { TextField } from '../../design-system/components/TextField';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { Camera, Save, Lock, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const UserProfilePage = () => {
    const { user, loadUserFromStorage } = useAuth();
    // Use type assertion to handle potential _id existence
    const userId = (user as any)?._id || user?.id;
    const { theme, currentColors } = useTheme();
    const queryClient = useQueryClient();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiClient.patch('/api/users/me', data);
            return res.data;
        },
        onSuccess: async () => {
            await loadUserFromStorage();
            queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            setPassword('');
            setConfirmPassword('');
        },
        onError: (err: any) => {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao atualizar perfil' });
        },
    });

    const uploadAvatarMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await apiClient.post('/api/users/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
        onSuccess: async () => {
            await loadUserFromStorage();
            queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
            setMessage({ type: 'success', text: 'Foto de perfil atualizada!' });
        },
        onError: () => {
            setMessage({ type: 'error', text: 'Erro ao carregar foto' });
        },
    });

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            setMessage({ type: 'error', text: 'As passwords não coincidem' });
            return;
        }
        const payload: any = { name, email };
        if (password) payload.password = password;
        updateProfileMutation.mutate(payload);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            uploadAvatarMutation.mutate(e.target.files[0]);
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${import.meta.env.VITE_API_URL}${url}`;
    };

    return (
        <Page title="O meu perfil" description="Gere a tua informação pessoal e segurança">
            <div style={{ display: 'grid', gap: theme.spacing.lg, maxWidth: '600px', margin: '0 auto' }}>

                {/* Status Message */}
                {message && (
                    <div style={{
                        padding: theme.spacing.md,
                        borderRadius: theme.radii.md,
                        background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: message.type === 'success' ? theme.colors.success : theme.colors.danger,
                        border: `1px solid ${message.type === 'success' ? theme.colors.success : theme.colors.danger}`,
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Identity Card */}
                <Card style={{ textAlign: 'center', padding: theme.spacing.xl }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: theme.spacing.md }}>
                        {user?.avatarUrl ? (
                            <img
                                src={getImageUrl(user.avatarUrl)}
                                alt={user.name}
                                style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: `4px solid ${currentColors.surfaceAlt}` }}
                                onError={(e) => {
                                    console.error('Error loading avatar:', e.currentTarget.src);
                                    e.currentTarget.style.display = 'none'; // Hide broken image
                                }}
                            />
                        ) : (
                            <div style={{ width: 120, height: 120, borderRadius: '50%', background: theme.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '3rem', border: `4px solid ${currentColors.surfaceAlt}` }}>
                                {user?.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <label
                            htmlFor="avatar-upload"
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                background: theme.colors.primary,
                                color: '#fff',
                                padding: theme.spacing.xs,
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            }}
                        >
                            <Camera size={20} />
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <h2 style={{ margin: 0, color: currentColors.text }}>{user?.name}</h2>
                    <p style={{ margin: 0, color: currentColors.textMuted }}>{user?.role === 'trainer' ? 'Treinador' : 'Cliente'}</p>

                    {/* QR Code Section */}
                    <div style={{ marginTop: theme.spacing.lg, padding: theme.spacing.md, background: '#fff', display: 'inline-block', borderRadius: theme.radii.md }}>
                        <QRCodeSVG value={JSON.stringify({ userId })} size={150} />
                        <p style={{ margin: '8px 0 0', color: '#000', fontSize: theme.typography.sizes.xs }}>
                            Scan para entrar
                        </p>
                    </div>
                </Card>

                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.lg, borderBottom: `1px solid ${currentColors.border}`, paddingBottom: theme.spacing.md }}>
                        <User size={20} color={theme.colors.primary} />
                        <h3 style={{ margin: 0, color: currentColors.text }}>Informação Pessoal</h3>
                    </div>
                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                        <TextField
                            label="Nome"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            placeholder="O teu nome"
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            placeholder="O teu email"
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, margin: `${theme.spacing.md} 0`, borderBottom: `1px solid ${currentColors.border}`, paddingBottom: theme.spacing.md }}>
                            <Lock size={20} color={theme.colors.primary} />
                            <h3 style={{ margin: 0, color: currentColors.text }}>Segurança</h3>
                        </div>

                        <TextField
                            label="Nova Password"
                            type="password"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            placeholder="Deixa em branco para manter"
                        />
                        <TextField
                            label="Confirmar Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                            placeholder="Confirma a nova password"
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: theme.spacing.md }}>
                            <Button type="submit" disabled={updateProfileMutation.isPending}>
                                <Save size={18} style={{ marginRight: theme.spacing.xs }} />
                                {updateProfileMutation.isPending ? 'A guardar...' : 'Guardar Alterações'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </Page>
    );
};

export default UserProfilePage;
