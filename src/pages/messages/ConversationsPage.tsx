import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { Modal } from '../../design-system/components/Modal';
import { TextField } from '../../design-system/components/TextField';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';
import { useConversations, useSendMessage } from '../../hooks/useMessaging';
import { useAuth } from '../../context/AuthContext';
import { fetchTrainerClients } from '../../api/trainerApi';
import { fetchClientProfile } from '../../api/clientApi';

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
};

const ConversationsPage = () => {
  const { user } = useAuth();
  const { currentColors } = useTheme();
  const navigate = useNavigate();
  const { data: conversations, isLoading } = useConversations();
  const { mutateAsync: sendMessage } = useSendMessage();

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  // Queries for "New Chat" selection
  const { data: clients } = useQuery({
    queryKey: ['trainer', 'clients'],
    queryFn: fetchTrainerClients,
    enabled: user?.role === 'trainer' && showNewChatModal,
  });

  const { data: clientProfile } = useQuery({
    queryKey: ['client', 'profile'],
    queryFn: fetchClientProfile,
    enabled: user?.role === 'client' && showNewChatModal,
  });

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    try {
      await sendMessage({ receiverId: 'ALL', content: broadcastMessage });
      setShowBroadcastModal(false);
      setBroadcastMessage('');
      // Optionally show success toast
    } catch (error) {
      console.error('Failed to broadcast:', error);
    }
  };

  const handleStartChat = async (receiverId: string) => {
    // If conversation exists, just navigate
    const existing = conversations?.find(c => c.userId === receiverId);
    if (existing) {
      navigate(`/app/messages/${receiverId}`);
      setShowNewChatModal(false);
      return;
    }

    // If not, we can either navigate to the empty chat page (if it handles it) 
    // or send a first message. 
    // The current ConversationDetailPage usually fetches messages. 
    // If we navigate to a new ID, it might show empty.
    navigate(`/app/messages/${receiverId}`);
    setShowNewChatModal(false);
  };

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>A sincronizar mensagens...</div>;
  }

  return (
    <Page
      title="Mensagens"
      description="Conversa com os teus clientes e treinadores."
      actions={
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          {user?.role === 'admin' && (
            <Button onClick={() => setShowBroadcastModal(true)}>
              📢 Broadcast
            </Button>
          )}
          {(user?.role === 'trainer' || user?.role === 'client') && (
            <Button onClick={() => setShowNewChatModal(true)}>
              Nova Conversa
            </Button>
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        {conversations?.length ? (
          conversations.map((conversation) => (
            <Link key={conversation.userId} to={`/app/messages/${conversation.userId}`} style={{ textDecoration: 'none' }}>
              <Card
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: theme.spacing.md,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: currentColors.surfaceAlt,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: theme.typography.weights.semibold,
                      color: currentColors.text
                    }}
                  >
                    {conversation.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: theme.typography.weights.medium, color: currentColors.text }}>{conversation.userName}</p>
                    <p style={{ margin: 0, color: currentColors.textMuted }}>{conversation.lastMessage ?? 'Sem mensagens ainda.'}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, color: currentColors.textMuted }}>{formatDate(conversation.lastMessageAt)}</p>
                  {conversation.unreadCount > 0 && <Badge tone="danger">{conversation.unreadCount}</Badge>}
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <Card>Sem conversas ainda. Inicia uma nova conversa.</Card>
        )}
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        title="Enviar Mensagem para Todos"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <TextField
            label="Mensagem"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="Escreve a mensagem para todos os utilizadores..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.sm }}>
            <Button variant="secondary" onClick={() => setShowBroadcastModal(false)}>Cancelar</Button>
            <Button onClick={handleBroadcast} disabled={!broadcastMessage.trim()}>Enviar Broadcast</Button>
          </div>
        </div>
      </Modal>

      {/* New Chat Modal */}
      <Modal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        title="Nova Conversa"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <p>Escolhe com quem queres falar:</p>

          {user?.role === 'trainer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
              {clients?.length ? (
                clients.map(client => (
                  <Button
                    key={client.userId}
                    variant="secondary"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => handleStartChat(client.userId)}
                  >
                    {client.name}
                  </Button>
                ))
              ) : (
                <p>Não tens clientes atribuídos.</p>
              )}
            </div>
          )}

          {user?.role === 'client' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
              {clientProfile?.trainer ? (
                <Button
                  variant="secondary"
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => handleStartChat(clientProfile.trainer!.id)}
                >
                  {clientProfile.trainer.name} (Treinador)
                </Button>
              ) : (
                <p>Não tens treinador atribuído.</p>
              )}
            </div>
          )}
        </div>
      </Modal>
    </Page>
  );
};

export default ConversationsPage;
