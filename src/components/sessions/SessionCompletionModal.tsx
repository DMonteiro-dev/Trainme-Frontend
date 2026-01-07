import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Upload, FileText, AlertCircle } from 'lucide-react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { TextField } from '../../design-system/components/TextField';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';
import { sessionsApi, Session } from '../../api/sessionsApi';

interface SessionCompletionModalProps {
    session: Session;
    isOpen: boolean;
    onClose: () => void;
}

export const SessionCompletionModal = ({ session, isOpen, onClose }: SessionCompletionModalProps) => {
    const { currentColors } = useTheme();
    const queryClient = useQueryClient();

    const [status, setStatus] = useState<'completed' | 'missed'>(
        (session.status === 'missed' ? 'missed' : 'completed')
    );
    const [feedback, setFeedback] = useState(session.feedback || '');
    const [failureReason, setFailureReason] = useState(session.failureReason || '');
    const [evidenceImage, setEvidenceImage] = useState<File | null>(null);

    // Initialize preview with existing image if available
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        session.evidenceImage
            ? (session.evidenceImage.startsWith('http') ? session.evidenceImage : `${import.meta.env.VITE_API_URL}${session.evidenceImage}`)
            : null
    );

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutate, isPending } = useMutation({
        mutationFn: async (formData: FormData) => {
            return sessionsApi.update(session._id, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            onClose();
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEvidenceImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('status', status);

        if (status === 'completed') {
            formData.append('feedback', feedback);
            if (evidenceImage) {
                formData.append('evidenceImage', evidenceImage);
            }
        } else {
            formData.append('failureReason', failureReason);
        }

        mutate(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registar Cumprimento do Treino">
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                <p style={{ margin: 0, color: currentColors.text }}>
                    Treino de {new Date(session.startTime).toLocaleDateString('pt-PT')}
                </p>

                {/* Status Selection */}
                <div style={{ display: 'flex', gap: theme.spacing.md }}>
                    <button
                        onClick={() => setStatus('completed')}
                        style={{
                            flex: 1,
                            padding: theme.spacing.md,
                            borderRadius: theme.radii.md,
                            border: `2px solid ${status === 'completed' ? theme.colors.success : currentColors.border}`,
                            background: status === 'completed' ? `${theme.colors.success}10` : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: theme.spacing.sm,
                            color: status === 'completed' ? theme.colors.success : currentColors.textMuted,
                            transition: 'all 0.2s'
                        }}
                    >
                        <Check size={24} />
                        <span style={{ fontWeight: 600 }}>Cumpri o Treino</span>
                    </button>

                    <button
                        onClick={() => setStatus('missed')}
                        style={{
                            flex: 1,
                            padding: theme.spacing.md,
                            borderRadius: theme.radii.md,
                            border: `2px solid ${status === 'missed' ? theme.colors.danger : currentColors.border}`,
                            background: status === 'missed' ? `${theme.colors.danger}10` : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: theme.spacing.sm,
                            color: status === 'missed' ? theme.colors.danger : currentColors.textMuted,
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={24} />
                        <span style={{ fontWeight: 600 }}>Não Cumpri</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    {status === 'completed' ? (
                        <>
                            {/* Image Upload */}
                            <div>
                                <label style={{ display: 'block', marginBottom: theme.spacing.xs, fontWeight: 500, color: currentColors.text }}>
                                    Comprovativo (Opcional)
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        border: `2px dashed ${currentColors.border}`,
                                        borderRadius: theme.radii.md,
                                        padding: theme.spacing.lg,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        background: currentColors.surfaceAlt,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '200px',
                                                objectFit: 'contain',
                                                borderRadius: theme.radii.sm
                                            }}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.spacing.xs, color: currentColors.textMuted }}>
                                            <Upload size={24} />
                                            <span>Clica para adicionar foto (smartwatch/ginásio)</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {/* Feedback */}
                            <TextField
                                label="Feedback (Opcional)"
                                placeholder="Como te sentiste? Alguma dificuldade?"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                multiline
                                rows={3}
                            />
                        </>
                    ) : (
                        /* Missed Reason */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
                            <TextField
                                label="Motivo da Falha"
                                placeholder="Ex: Doença, falta de tempo..."
                                value={failureReason}
                                onChange={(e) => setFailureReason(e.target.value)}
                                required
                                multiline
                                rows={3}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, color: theme.colors.warning, fontSize: theme.typography.sizes.sm }}>
                                <AlertCircle size={14} />
                                <span>O teu treinador será notificado.</span>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'A guardar...' : 'Confirmar Registo'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
