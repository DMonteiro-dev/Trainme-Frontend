import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../design-system/components/Button';
import { generateMagicLink } from '../../api/authApi';
import { theme } from '../../design-system/theme';

export const QRCodeDisplay = () => {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const data = await generateMagicLink() as { token: string };
            setToken(data.token);
        } catch (error) {
            console.error('Failed to generate QR code', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loginUrl = token ? `${window.location.origin}/magic-login?token=${token}` : '';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.spacing.md }}>
            {!token ? (
                <Button onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? 'A gerar...' : 'Mostrar Código QR'}
                </Button>
            ) : (
                <>
                    <div style={{ background: 'white', padding: theme.spacing.md, borderRadius: theme.radii.md }}>
                        <QRCodeSVG value={loginUrl} size={200} />
                    </div>
                    <p style={{ textAlign: 'center', color: theme.colors.textMuted }}>
                        Faz scan deste código para iniciar sessão noutro dispositivo.
                    </p>
                    <Button variant="secondary" onClick={() => setToken(null)}>
                        Gerar Novo
                    </Button>
                </>
            )}
        </div>
    );
};
