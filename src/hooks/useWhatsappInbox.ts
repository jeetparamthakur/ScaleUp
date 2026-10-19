'use client';

import { useCallback, useMemo, useState } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import {
  invalidateQueriesByPrefix,
  invalidateQuery,
} from '@/hooks/api/query-cache';
import { whatsappInboxService } from '@/lib/api/services/whatsapp-inbox.service';
import { whatsappSenderSelfChatId } from '@/lib/inbox/whatsapp-sender-chat-id';
import type {
  WhatsappConnection,
  WhatsappInboxSender,
  WhatsappMessage,
} from '@/lib/inbox/whatsapp-types';

const MESSAGE_PAGE_SIZE = 50;

interface WhatsappQueryPollOptions {
  refetchIntervalMs?: number;
  enabled?: boolean;
}

export function useWhatsappAvailability() {
  return useApiQuery('inbox.whatsapp.availability', () =>
    whatsappInboxService.getAvailability(),
  );
}

export function useWhatsappModuleInboxAvailability() {
  return useApiQuery('whatsapp.inbox.availability', () =>
    whatsappInboxService.getModuleInboxAvailability(),
  );
}

export function useWhatsappConnection(options: WhatsappQueryPollOptions = {}) {
  const { refetchIntervalMs, enabled = true } = options;
  const query = useApiQuery(
    'inbox.whatsapp.connection',
    () => whatsappInboxService.getConnection(),
    { enabled, refetchIntervalMs },
  );

  const { mutate: startMutate, isLoading: isStarting } = useApiMutation<
    void,
    WhatsappConnection
  >(async () => whatsappInboxService.startConnect());

  const { mutate: disconnectMutate, isLoading: isDisconnecting } =
    useApiMutation<void, WhatsappConnection>(async () =>
      whatsappInboxService.disconnect(),
    );

  const startConnect = useCallback(async () => {
    const result = await startMutate(undefined);
    await query.refetch();
    return result;
  }, [query, startMutate]);

  const disconnect = useCallback(async () => {
    const result = await disconnectMutate(undefined);
    await query.refetch();
    return result;
  }, [disconnectMutate, query]);

  return {
    connection: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    startConnect,
    isStarting,
    disconnect,
    isDisconnecting,
  };
}

export function useWhatsappQr(enabled: boolean) {
  return useApiQuery(
    'inbox.whatsapp.qr',
    () => whatsappInboxService.getQr(),
    { enabled, refetchIntervalMs: enabled ? 2500 : undefined },
  );
}

export function useWhatsappInboxSenders(options: WhatsappQueryPollOptions = {}) {
  const { refetchIntervalMs, enabled = true } = options;
  return useApiQuery(
    'inbox.whatsapp.senders',
    () => whatsappInboxService.listSenders(),
    { enabled, refetchIntervalMs },
  );
}

export function useWhatsappConversationAvatars(
  senderConnectionId: string | null,
  chatIds: string[],
  options: WhatsappQueryPollOptions = {},
) {
  const { enabled: enabledOption = true } = options;
  const idsKey = useMemo(() => {
    const unique = [...new Set(chatIds.map((id) => id.trim()).filter(Boolean))].sort();
    return unique.join(',');
  }, [chatIds]);

  const enabled =
    enabledOption && Boolean(senderConnectionId) && idsKey.length > 0;

  const queryKey = `inbox.whatsapp.profilePictures.${senderConnectionId ?? 'none'}.${idsKey}`;

  const query = useApiQuery(
    queryKey,
    () =>
      whatsappInboxService.getProfilePictures(
        senderConnectionId!,
        idsKey.split(','),
      ),
    { enabled },
  );

  const pictures = useMemo(
    () => query.data?.pictures ?? {},
    [query.data?.pictures],
  );

  const getAvatarUrl = useCallback(
    (chatId: string) => pictures[chatId] ?? null,
    [pictures],
  );

  return {
    getAvatarUrl,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useWhatsappSenderProfilePictures(
  senders: WhatsappInboxSender[],
  options: WhatsappQueryPollOptions = {},
) {
  const { enabled: enabledOption = true } = options;

  const readySenders = useMemo(
    () =>
      senders.filter(
        (sender) =>
          sender.status === 'ready' && Boolean(whatsappSenderSelfChatId(sender.phone)),
      ),
    [senders],
  );

  const sendersKey = useMemo(
    () => [...readySenders.map((sender) => sender.id)].sort().join(','),
    [readySenders],
  );

  const query = useApiQuery(
    `inbox.whatsapp.senderProfilePictures.${sendersKey}`,
    async () => {
      const pictures: Record<string, string | null> = {};
      await Promise.all(
        readySenders.map(async (sender) => {
          const chatId = whatsappSenderSelfChatId(sender.phone);
          if (!chatId) {
            pictures[sender.id] = null;
            return;
          }
          const result = await whatsappInboxService.getProfilePictures(
            sender.id,
            [chatId],
          );
          pictures[sender.id] = result.pictures[chatId] ?? null;
        }),
      );
      return pictures;
    },
    { enabled: enabledOption && readySenders.length > 0 },
  );

  const getSenderAvatarUrl = useCallback(
    (senderId: string) => query.data?.[senderId] ?? null,
    [query.data],
  );

  return {
    getSenderAvatarUrl,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useWhatsappConversations(
  senderConnectionId: string | null,
  options: WhatsappQueryPollOptions = {},
) {
  const { refetchIntervalMs, enabled: enabledOption = true } = options;
  const enabled = enabledOption && Boolean(senderConnectionId);
  const queryKey = `inbox.whatsapp.conversations.${senderConnectionId ?? 'none'}`;

  return useApiQuery(
    queryKey,
    () => whatsappInboxService.listConversations(senderConnectionId!),
    { enabled, refetchIntervalMs },
  );
}

export function useWhatsappMessagesPaginated(
  conversationId: string | null,
  options: WhatsappQueryPollOptions = {},
) {
  const { refetchIntervalMs, enabled: enabledOption = true } = options;
  const enabled = enabledOption && Boolean(conversationId);
  const queryKey = `inbox.whatsapp.messages.${conversationId ?? 'none'}`;

  const [olderByConversation, setOlderByConversation] = useState<
    Record<string, WhatsappMessage[]>
  >({});
  const [loadingOlderFor, setLoadingOlderFor] = useState<string | null>(null);

  const query = useApiQuery(
    queryKey,
    () =>
      whatsappInboxService.listMessages(conversationId!, MESSAGE_PAGE_SIZE, 0),
    { enabled, refetchIntervalMs },
  );

  const olderItems = useMemo(() => {
    if (conversationId == null) {
      return [];
    }
    return olderByConversation[conversationId] ?? [];
  }, [conversationId, olderByConversation]);
  const isLoadingOlder = loadingOlderFor === conversationId;

  const total = query.data?.total ?? 0;

  const messages = useMemo(() => {
    const newestItems = query.data?.items ?? [];
    const byId = new Map<string, WhatsappMessage>();
    for (const message of olderItems) {
      byId.set(message.id, message);
    }
    for (const message of newestItems) {
      byId.set(message.id, message);
    }
    return [...byId.values()].sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    );
  }, [olderItems, query.data?.items]);

  const loadedCount = MESSAGE_PAGE_SIZE + olderItems.length;
  const hasMore = loadedCount < total;

  const loadOlder = useCallback(async () => {
    if (!conversationId || isLoadingOlder || !hasMore) {
      return;
    }

    setLoadingOlderFor(conversationId);
    try {
      const page = await whatsappInboxService.listMessages(
        conversationId,
        MESSAGE_PAGE_SIZE,
        loadedCount,
      );
      setOlderByConversation((prev) => {
        const existing = prev[conversationId] ?? [];
        const byId = new Map(existing.map((item) => [item.id, item]));
        for (const item of page.items) {
          byId.set(item.id, item);
        }
        return { ...prev, [conversationId]: [...byId.values()] };
      });
    } finally {
      setLoadingOlderFor((current) =>
        current === conversationId ? null : current,
      );
    }
  }, [conversationId, hasMore, isLoadingOlder, loadedCount]);

  return {
    messages,
    total,
    hasMore,
    loadOlder,
    isLoadingOlder,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/** @deprecated Prefer useWhatsappMessagesPaginated */
export function useWhatsappMessages(conversationId: string | null) {
  return useWhatsappMessagesPaginated(conversationId);
}

export function useSendWhatsappMessage() {
  const { mutate, isLoading, error, reset } = useApiMutation<
    { conversationId: string; text: string },
    WhatsappMessage
  >(async ({ conversationId, text }) =>
    whatsappInboxService.sendMessage(conversationId, text),
  );

  const sendMessage = useCallback(
    async (conversationId: string, text: string) => {
      const result = await mutate({ conversationId, text });
      invalidateQueriesByPrefix('inbox.whatsapp.conversations.');
      invalidateQuery('inbox.whatsapp.senders');
      invalidateQueriesByPrefix(`inbox.whatsapp.messages.${conversationId}`);
      return result;
    },
    [mutate],
  );

  return { sendMessage, isSending: isLoading, error, reset };
}

export function useSendWhatsappAttachment() {
  const { mutate, isLoading, error, reset } = useApiMutation<
    { conversationId: string; file: File; caption?: string },
    WhatsappMessage
  >(async ({ conversationId, file, caption }) =>
    whatsappInboxService.sendAttachment(conversationId, file, caption),
  );

  const sendAttachment = useCallback(
    async (conversationId: string, file: File, caption?: string) => {
      const result = await mutate({ conversationId, file, caption });
      invalidateQueriesByPrefix('inbox.whatsapp.conversations.');
      invalidateQuery('inbox.whatsapp.senders');
      invalidateQueriesByPrefix(`inbox.whatsapp.messages.${conversationId}`);
      return result;
    },
    [mutate],
  );

  return { sendAttachment, isSendingAttachment: isLoading, error, reset };
}
