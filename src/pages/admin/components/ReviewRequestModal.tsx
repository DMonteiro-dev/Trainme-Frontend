import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../design-system/components/Modal';
import { Button } from '../../../design-system/components/Button';
import { theme } from '../../../design-system/theme';
import { useTheme } from '../../../context/ThemeContext';
import { useNotification } from '../../../context/NotificationContext';
import { approveTrainerChangeRequest, rejectTrainerChangeRequest } from '../../../api/trainerChangeRequestsService';
import { TrainerChangeRequest } from '../../../types';
import { Check, X, User, ArrowRight } from 'lucide-react';

interface ReviewRequestModalProps {
    request: TrainerChangeRequest;
    isOpen: boolean;
    onClose: () => void;
}

export const ReviewRequestModal = ({ request, isOpen, onClose }: ReviewRequestModalProps) => {
    const { currentColors } = useTheme();
    const { showToast } = useNotification();
    const queryClient = useQueryClient();

    const handleSuccess = (message: string) => {
        showToast(message);
        queryClient.invalidateQueries({ predicate: ({ queryKey }) => queryKey[0] === 'trainer-change-requests' });
        queryClient.invalidateQueries({ queryKey: ['admin', 'trainers'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'clients'] });
        onClose();
    };

    const { mutate: approve, isPending: approving } = useMutation({
        mutationFn: () => approveTrainerChangeRequest(request.id),
        onSuccess: () => handleSuccess('Pedido aprovado com sucesso!'),
        onError: (error: any) => showToast(error.response?.data?.message || 'Erro ao aprovar pedido'),
    });

    const { mutate: reject, isPending: rejecting } = useMutation({
        mutationFn: () => rejectTrainerChangeRequest(request.id),
        onSuccess: () => handleSuccess('Pedido rejeitado com sucesso!'),
        onError: (error: any) => showToast(error.response?.data?.message || 'Erro ao rejeitar pedido'),
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Responder ao Pedido">
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>

                {/* Header / Context */}
                <div style={{
                    padding: theme.spacing.md,
                    background: currentColors.surfaceAlt,
                    borderRadius: theme.radii.md,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: theme.spacing.md
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: '0.75rem', color: currentColors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Cliente</span>
                        <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{request.client?.name || 'Cliente Desconhecido'}</span>
                    </div>

                </div>

                {/* Change Visualization */}
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                    <div style={{ flex: 1, padding: theme.spacing.md, border: `1px solid ${currentColors.border}`, borderRadius: theme.radii.md }}>
                        <div style={{ fontSize: '0.85rem', color: currentColors.textMuted, marginBottom: 4 }}>Treinador Atual</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, color: currentColors.textMuted }}>
                            <User size={16} />
                            <span>{request.currentTrainer?.name || 'Sem treinador'}</span>
                        </div>
                    </div>

                    <ArrowRight color={currentColors.textMuted} />

                    <div style={{ flex: 1, padding: theme.spacing.md, border: `1px solid ${currentColors.primary}`, background: `${currentColors.primary}05`, borderRadius: theme.radii.md }}>
                        <div style={{ fontSize: '0.85rem', color: currentColors.primary, marginBottom: 4, fontWeight: 600 }}>Novo Treinador</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, fontWeight: 500 }}>
                            <User size={16} color={currentColors.primary} />
                            <span>{request.requestedTrainer?.name || 'Remover Treinador'}</span>
                        </div>
                    </div>
                </div>

                {/* Reason */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: theme.spacing.xs, color: currentColors.text }}>
                        Motivo do Pedido
                    </label>
                    <div style={{
                        padding: theme.spacing.md,
                        background: currentColors.surfaceAlt,
                        borderRadius: theme.radii.md,
                        color: currentColors.text,
                        lineHeight: 1.5,
                        fontSize: '0.95rem'
                    }}>
                        "{request.reason}"
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.sm }}>
                    <Button
                        variant="ghost"
                        style={{ flex: 1, color: theme.colors.danger, borderColor: theme.colors.danger, border: '1px solid' }}
                        onClick={() => reject()}
                        disabled={approving || rejecting}
                    >
                        <X size={18} style={{ marginRight: 8 }} />
                        Rejeitar
                    </Button>

                    <Button
                        style={{ flex: 1, background: theme.colors.success, borderColor: theme.colors.success }}
                        onClick={() => approve()}
                        disabled={approving || rejecting}
                    >
                        <Check size={18} style={{ marginRight: 8 }} />
                        {approving ? 'A processar...' : 'Aprovar'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
