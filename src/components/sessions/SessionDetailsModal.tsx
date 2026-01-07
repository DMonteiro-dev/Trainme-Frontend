import React from 'react';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, Calendar, User, FileText, Image as ImageIcon } from 'lucide-react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';
import { Session } from '../../api/sessionsApi';
import { Card } from '../../design-system/components/Card';

interface SessionDetailsModalProps {
    session: Session;
    isOpen: boolean;
    onClose: () => void;
    userRole: 'trainer' | 'client';
    onEdit?: () => void;
}

export const SessionDetailsModal = ({ session, isOpen, onClose, userRole, onEdit }: SessionDetailsModalProps) => {
    const { currentColors } = useTheme();

    const getStatusBadge = () => {
        switch (session.status) {
            case 'completed':
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: theme.colors.success, background: `${theme.colors.success}20`, padding: '4px 12px', borderRadius: 20 }}>
                        <CheckCircle size={16} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>Concluída</span>
                    </div>
                );
            case 'missed':
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: theme.colors.danger, background: `${theme.colors.danger}20`, padding: '4px 12px', borderRadius: 20 }}>
                        <XCircle size={16} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>Não Realizada</span>
                    </div>
                );
            case 'cancelled':
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: theme.colors.textMuted, background: `${theme.colors.textMuted}20`, padding: '4px 12px', borderRadius: 20 }}>
                        <XCircle size={16} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>Cancelada</span>
                    </div>
                );
            default:
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: theme.colors.primary, background: `${theme.colors.primary}20`, padding: '4px 12px', borderRadius: 20 }}>
                        <Clock size={16} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>Agendada</span>
                    </div>
                );
        }
    };

    const otherPersonName = userRole === 'trainer' ? session.client.name : session.trainer.name;
    const otherPersonLabel = userRole === 'trainer' ? 'Cliente' : 'Treinador';

    // Construct image URL assuming backend serves uploads at /uploads
    // Using window.location.origin to point to backend proxy in dev or relative path
    const evidenceUrl = session.evidenceImage
        ? (session.evidenceImage.startsWith('http') ? session.evidenceImage : `${import.meta.env.VITE_API_URL}${session.evidenceImage}`)
        : null;

    const canEdit = userRole === 'client' && (session.status === 'completed' || session.status === 'missed');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Sessão">
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>

                {/* Header Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <h3 style={{ margin: 0, fontSize: 18, color: currentColors.text }}>
                            {format(parseISO(session.startTime), "EEEE, d 'de' MMMM", { locale: pt })}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: theme.colors.textMuted }}>
                            <Clock size={14} />
                            <span>
                                {format(parseISO(session.startTime), 'HH:mm')} - {format(parseISO(session.endTime), 'HH:mm')}
                            </span>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>

                {/* Participants */}
                <Card style={{ padding: theme.spacing.md, background: currentColors.surfaceAlt }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                        <div style={{ padding: 10, background: theme.colors.primary, borderRadius: '50%', color: '#fff' }}>
                            <User size={20} />
                        </div>
                        <div>
                            <span style={{ fontSize: 12, color: theme.colors.textMuted, display: 'block' }}>{otherPersonLabel}</span>
                            <span style={{ fontWeight: 600, color: currentColors.text, fontSize: 16 }}>{otherPersonName}</span>
                        </div>
                    </div>
                </Card>

                {/* Notes (Usually from Trainer) */}
                {session.notes && (
                    <div>
                        <h4 style={{ fontSize: 14, color: theme.colors.textMuted, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FileText size={14} /> Notas do Treino
                        </h4>
                        <p style={{ margin: 0, padding: theme.spacing.md, background: currentColors.surfaceAlt, borderRadius: theme.radii.md, color: currentColors.text }}>
                            {session.notes}
                        </p>
                    </div>
                )}

                {/* Completion Details */}
                {session.status === 'completed' && (
                    <>
                        <div style={{ borderTop: `1px solid ${currentColors.border}`, paddingTop: theme.spacing.md }}>
                            <h4 style={{ fontSize: 16, fontWeight: 600, color: currentColors.text, marginBottom: theme.spacing.md }}>
                                Registo de Conclusão
                            </h4>

                            {session.feedback && (
                                <div style={{ marginBottom: theme.spacing.md }}>
                                    <span style={{ fontSize: 12, color: theme.colors.textMuted, display: 'block', marginBottom: 4 }}>Feedback do Cliente</span>
                                    <p style={{ margin: 0, fontStyle: 'italic', color: currentColors.text }}>"{session.feedback}"</p>
                                </div>
                            )}

                            {evidenceUrl ? (
                                <div>
                                    <span style={{ fontSize: 12, color: theme.colors.textMuted, display: 'block', marginBottom: 8 }}>Comprovativo Fotográfico</span>
                                    <div style={{ borderRadius: theme.radii.md, overflow: 'hidden', border: `1px solid ${currentColors.border}` }}>
                                        <img
                                            src={evidenceUrl}
                                            alt="Comprovativo"
                                            style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block' }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Erro+na+Imagem';
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p style={{ fontSize: 12, color: theme.colors.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ImageIcon size={14} /> Sem foto de comprovativo.
                                </p>
                            )}
                        </div>
                    </>
                )}

                {session.status === 'missed' && session.failureReason && (
                    <div style={{ padding: theme.spacing.md, background: `${theme.colors.danger}10`, borderRadius: theme.radii.md, border: `1px solid ${theme.colors.danger}` }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: 14, color: theme.colors.danger }}>Motivo da Falha</h4>
                        <p style={{ margin: 0, color: currentColors.text }}>{session.failureReason}</p>
                    </div>
                )}

                <div style={{ display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
                    <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
                        Fechar
                    </Button>
                    {canEdit && onEdit && (
                        <Button onClick={onEdit} style={{ flex: 1 }}>
                            Editar Registo
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};
