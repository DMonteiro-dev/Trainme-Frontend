import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Modal } from '../../design-system/components/Modal';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (decodedText: string) => void;
    title?: string;
}

export const QRScannerModal = ({ isOpen, onClose, onScanSuccess, title = 'Digitalizar código QR' }: QRScannerModalProps) => {
    const { currentColors } = useTheme();
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && !scannerRef.current) {
            // Small timeout to ensure DOM is ready
            const timeoutId = setTimeout(() => {
                try {
                    const scanner = new Html5QrcodeScanner(
                        "qr-reader",
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
                    );

                    scanner.render(
                        (decodedText) => {
                            onScanSuccess(decodedText);
                            scanner.clear();
                            onClose();
                        },
                        (errorMessage) => {
                            // Ignore transient errors
                            // console.warn(errorMessage);
                        }
                    );
                    scannerRef.current = scanner;
                } catch (err: any) {
                    setError("Não foi possível iniciar a câmara. Verifica as permissões.");
                    console.error(err);
                }
            }, 100);

            return () => {
                clearTimeout(timeoutId);
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(console.error);
                    scannerRef.current = null;
                }
            };
        }
    }, [isOpen, onScanSuccess, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.spacing.md }}>
                {error ? (
                    <p style={{ color: theme.colors.danger }}>{error}</p>
                ) : (
                    <div id="qr-reader" style={{ width: '100%', maxWidth: '400px' }}></div>
                )}
                <p style={{ color: currentColors.textMuted, textAlign: 'center', fontSize: theme.typography.sizes.sm }}>
                    Posiciona o código QR do utilizador dentro da área de leitura.
                </p>
            </div>
        </Modal>
    );
};
