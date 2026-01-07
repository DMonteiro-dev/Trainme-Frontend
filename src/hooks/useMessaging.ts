import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchConversation, fetchConversations, markMessageRead, sendMessage, markConversationRead } from '../api/messagesApi';

export const messagingKeys = {
  conversations: ['messages', 'conversations'] as const,
  conversation: (userId: string) => ['messages', 'conversation', userId] as const,
};

export const useConversations = () =>
  useQuery({ queryKey: messagingKeys.conversations, queryFn: fetchConversations, staleTime: 1000 * 30 });

export const useConversation = (userId: string) =>
  useQuery({
    queryKey: messagingKeys.conversation(userId),
    queryFn: () => fetchConversation(userId),
    enabled: Boolean(userId),
    refetchInterval: 1000 * 10,
  });

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations });
      const receiverId = typeof message.receiverId === 'string' ? message.receiverId : message.receiverId;
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversation(receiverId) });
    },
  });
};

export const useMarkMessageRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markMessageRead,
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations });
      const senderId = typeof message.senderId === 'string' ? message.senderId : message.senderId._id;
      // Also update the specific message in the cache if needed, but invalidation is safer
      // queryClient.invalidateQueries({ queryKey: messagingKeys.conversation(senderId) }); 
    },
  });
};

export const useMarkConversationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => import('../api/messagesApi').then(api => api.markConversationRead(userId)), // Dynamic import to avoid circular dep if any, or just direct
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations });
    }
  });
};
