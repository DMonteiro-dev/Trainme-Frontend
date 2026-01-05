import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { TextField } from '../../design-system/components/TextField';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useConversation, useMarkMessageRead, useSendMessage } from '../../hooks/useMessaging';
import { useSocket } from '../../context/SocketContext';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toggleMessageLike } from '../../api/messagesApi';
import { Heart } from 'lucide-react';

const ConversationDetailPage = () => {
  const { id: userId = '' } = useParams();
  const { user } = useAuth();
  const { currentColors } = useTheme();
  const [message, setMessage] = useState('');

  // Update data destructuring
  const { data, isLoading } = useConversation(userId);

  // Handle migration/cache mismatch where data might still be an array from previous queries
  const messages = Array.isArray(data) ? data : data?.messages;
  const canSendMessage = Array.isArray(data) ? true : (data?.canSendMessage ?? true);

  const { mutateAsync: send, isPending } = useSendMessage();
  const { mutate: markRead } = useMarkMessageRead();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { mutate: toggleLike } = useMutation({
    mutationFn: toggleMessageLike,
    onSuccess: (updatedMessage) => {
      // Optimistic update handled via socket or query invalidation?
      // Let's update cache directly for instant feedback
      queryClient.setQueryData(['conversation', userId], (old: any) => {
        if (!old) return old;
        // Old structure was array, now it is object { messages: [], canSendMessage: bool }
        // We need to handle both just in case, or assume new structure.
        // Actually react-query cache will be updated by invalidation mostly.
        // But for setQueryData:
        return {
          ...old,
          messages: old.messages.map((m: any) => m._id === updatedMessage._id ? updatedMessage : m)
        };
      });
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage: any) => {
      // Only add if it belongs to this conversation
      if (newMessage.senderId === userId || newMessage.receiverId === userId) {
        queryClient.setQueryData(['conversation', userId], (old: any) => {
          if (!old) return { messages: [newMessage], canSendMessage: true }; // Default structure

          const msgs = old.messages || [];
          // Check if already exists to avoid duplicates
          if (msgs.find((m: any) => m._id === newMessage._id)) return old;

          return {
            ...old,
            messages: [...msgs, newMessage]
          };
        });

        // Mark as read if we are viewing it
        if (newMessage.senderId === userId) {
          markRead(newMessage._id);
        }
      }
    };

    const handleMessageUpdated = (updatedMessage: any) => {
      if (updatedMessage.senderId === userId || updatedMessage.receiverId === userId) {
        queryClient.setQueryData(['conversation', userId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.map((m: any) => m._id === updatedMessage._id ? updatedMessage : m)
          };
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_updated', handleMessageUpdated);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_updated', handleMessageUpdated);
    };
  }, [socket, userId, queryClient, markRead]);

  const orderedMessages = useMemo(() => messages ?? [], [messages]);

  // Basic validation for MongoDB ObjectId (24 hex characters)
  const isValidUserId = userId && /^[0-9a-fA-F]{24}$/.test(userId);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim() || !isValidUserId || !canSendMessage) return;
    await send({ receiverId: userId, content: message.trim() });
    setMessage('');
  };

  const handleLike = (messageId: string) => {
    toggleLike(messageId);
  };

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>A abrir conversa...</div>;
  }

  if (!isValidUserId && !isLoading && !data) {
    return (
      <Page title="Conversa Inválida" description="Não foi possível encontrar este utilizador.">
        <Card>
          <div style={{ padding: '2rem', textAlign: 'center', color: currentColors.textMuted }}>
            ID de utilizador inválido. Por favor volte atrás e selecione uma conversa válida.
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <Page title="Conversa" description="Troca de mensagens em tempo real.">
      <Card style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          {orderedMessages.map((msg) => {
            // Handle senderId being populated (object) or raw (string)
            const senderObj = typeof msg.senderId === 'object' && msg.senderId !== null ? msg.senderId : null;

            // Normalize senderId to string
            let senderIdString = '';
            if (senderObj) {
              senderIdString = (senderObj as any)._id || (senderObj as any).id || '';
            } else {
              senderIdString = String(msg.senderId);
            }

            // Normalize user ID (handle both id and _id just in case)
            const currentUserId = user?.id || (user as any)?._id || '';

            const isOwn = String(senderIdString) === String(currentUserId);

            const isLiked = msg.likes?.includes(user?.id || '');
            const senderAvatar = senderObj?.avatarUrl;

            return (
              <div
                key={msg._id || msg.id}
                style={{
                  alignSelf: isOwn ? 'flex-end' : 'flex-start',
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: theme.spacing.xs,
                  maxWidth: '70%',
                  flexDirection: isOwn ? 'row-reverse' : 'row',
                }}
              >
                {!isOwn && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: currentColors.surfaceAlt,
                      flexShrink: 0,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: theme.typography.sizes.xs,
                      color: currentColors.textMuted
                    }}
                  >
                    {senderAvatar ? (
                      <img src={senderAvatar.startsWith('http') ? senderAvatar : `${import.meta.env.VITE_API_URL}${senderAvatar}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      senderObj?.name?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                )}

                <div
                  style={{
                    position: 'relative',
                    background: isOwn ? currentColors.primary : currentColors.surfaceAlt,
                    color: isOwn ? '#fff' : currentColors.text,
                    padding: theme.spacing.sm,
                    borderRadius: theme.radii.md,
                    cursor: 'pointer',
                  }}
                  onDoubleClick={() => handleLike(msg._id || msg.id)}
                >
                  <p style={{ margin: 0 }}>{msg.content}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: theme.typography.sizes.xs, color: isOwn ? 'rgba(255,255,255,0.7)' : currentColors.textMuted }}>
                      {new Date(msg.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {/* Like Indicator/Button */}
                    {(msg.likes && (msg.likes.length > 0 || isLiked)) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLike(msg._id || msg.id); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: isLiked ? currentColors.danger : (isOwn ? 'rgba(255,255,255,0.7)' : currentColors.textMuted)
                        }}
                      >
                        <Heart size={12} fill={isLiked ? currentColors.danger : 'none'} />
                        {msg.likes.length > 0 && <span style={{ fontSize: 10, marginLeft: 2 }}>{msg.likes.length}</span>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {!canSendMessage && (
          <div style={{
            padding: theme.spacing.md,
            background: theme.colors.warning + '20',
            border: `1px solid ${theme.colors.warning}`,
            borderRadius: theme.radii.md,
            color: theme.colors.warning,
            textAlign: 'center',
            marginBottom: theme.spacing.md,
            marginTop: theme.spacing.md
          }}>
            Não tem permissão para enviar mensagens para este utilizador (relação inativa).
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          <TextField
            placeholder={isValidUserId && canSendMessage ? "Escreve uma mensagem..." : (canSendMessage ? "Selecione um utilizador válido" : "Mensagens desativadas")}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            style={{ flex: 1 }}
            disabled={!isValidUserId || !canSendMessage}
          />
          <Button type="submit" disabled={isPending || !isValidUserId || !canSendMessage}>
            {isPending ? 'A enviar...' : 'Enviar'}
          </Button>
        </form>
      </Card>
    </Page>
  );
};

export default ConversationDetailPage;
