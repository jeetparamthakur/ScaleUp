'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import WhatsappConversationSidebar from '@/components/inbox/whatsapp/WhatsappConversationSidebar';
import WhatsappInboxSenderChips from '@/components/inbox/whatsapp/WhatsappInboxSenderChips';
import WhatsappMessageComposer from '@/components/inbox/whatsapp/WhatsappMessageComposer';
import WhatsappMessageThread from '@/components/inbox/whatsapp/WhatsappMessageThread';
import {
  useSendWhatsappAttachment,
  useSendWhatsappMessage,
  useWhatsappModuleInboxAvailability,
  useWhatsappConversationAvatars,
  useWhatsappConversations,
  useWhatsappInboxSenders,
  useWhatsappMessagesPaginated,
  useWhatsappSenderProfilePictures,
} from '@/hooks/useWhatsappInbox';
import { useWhatsappSilentInboxSync } from '@/hooks/useWhatsappSilentInboxSync';
import { WHATSAPP_INBOX_SILENT_SYNC_MS } from '@/lib/inbox/whatsapp-inbox-sync';
import {
  buildPendingAttachmentMessage,
  buildPendingTextMessage,
  createPendingWhatsappMessageId,
  mergeWhatsappMessagesWithOptimistic,
  pruneOptimisticWhatsappMessages,
} from '@/lib/inbox/whatsapp-optimistic-messages';
import { waInboxUi } from '@/lib/inbox/whatsapp-inbox-ui';
import { orgPath } from '@/lib/org-path';
import { whatsappInboxSenderLabel } from '@/lib/inbox/whatsapp-sender-label';
import { whatsappInboxService } from '@/lib/api/services/whatsapp-inbox.service';
import type {
  WhatsappConversation,
  WhatsappInboxSender,
  WhatsappMessage,
} from '@/lib/inbox/whatsapp-types';

function pickDefaultSender(
  senders: WhatsappInboxSender[],
  preferredId: string | null,
): string | null {
  if (preferredId && senders.some((s) => s.id === preferredId && s.status === 'ready')) {
    return preferredId;
  }
  return senders.find((s) => s.status === 'ready')?.id ?? null;
}

export default function WhatsappChatLayout() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params.orgSlug;
  const router = useRouter();
  const searchParams = useSearchParams();
  const senderFromUrl = searchParams.get('sender');

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    null,
  );
  const [manualSenderId, setManualSenderId] = useState<string | null>(null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [optimisticByConversation, setOptimisticByConversation] = useState<
    Record<string, WhatsappMessage[]>
  >({});
  const [localPreviewUrls, setLocalPreviewUrls] = useState<
    Record<string, string>
  >({});

  const { data: availability } = useWhatsappModuleInboxAvailability();

  const sendersQuery = useWhatsappInboxSenders({
    enabled: availability?.available ?? true,
    refetchIntervalMs: 15000,
  });

  const senders = useMemo(
    () => sendersQuery.data ?? [],
    [sendersQuery.data],
  );

  const readySenders = useMemo(
    () => senders.filter((sender) => sender.status === 'ready'),
    [senders],
  );

  const selectedSenderId = useMemo(
    () => pickDefaultSender(readySenders, senderFromUrl ?? manualSenderId),
    [readySenders, senderFromUrl, manualSenderId],
  );

  const selectedSender = useMemo(
    () => senders.find((item) => item.id === selectedSenderId) ?? null,
    [senders, selectedSenderId],
  );

  const syncPending =
    selectedSender?.status === 'ready' && !selectedSender.lastBackfillAt;

  useEffect(() => {
    if (!syncPending) {
      return;
    }
    const intervalId = window.setInterval(() => {
      void sendersQuery.refetch();
    }, 3000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [sendersQuery, syncPending]);

  const inboxPollingMs =
    selectedSenderId && selectedSender?.status === 'ready'
      ? syncPending
        ? 3000
        : WHATSAPP_INBOX_SILENT_SYNC_MS
      : undefined;

  const conversationsQuery = useWhatsappConversations(selectedSenderId, {
    enabled: Boolean(selectedSenderId) && selectedSender?.status === 'ready',
    refetchIntervalMs: inboxPollingMs,
  });

  const conversations = useMemo(
    () => conversationsQuery.data?.items ?? [],
    [conversationsQuery.data?.items],
  );

  const activeConversationId = useMemo(() => {
    if (
      selectedConversationId &&
      conversations.some((item) => item.id === selectedConversationId)
    ) {
      return selectedConversationId;
    }
    return conversations[0]?.id ?? null;
  }, [conversations, selectedConversationId]);

  const selectedConversation = useMemo<WhatsappConversation | null>(() => {
    if (!activeConversationId) {
      return null;
    }
    return conversations.find((item) => item.id === activeConversationId) ?? null;
  }, [activeConversationId, conversations]);

  const conversationChatIds = useMemo(
    () => conversations.map((item) => item.chatId),
    [conversations],
  );

  const { getAvatarUrl } = useWhatsappConversationAvatars(
    selectedSenderId,
    conversationChatIds,
    {
      enabled: selectedSender?.status === 'ready',
    },
  );

  const { getSenderAvatarUrl } = useWhatsappSenderProfilePictures(senders, {
    enabled: senders.length > 0,
  });

  const selectedSenderAvatarUrl = useMemo(() => {
    if (!selectedSenderId) {
      return null;
    }
    return getSenderAvatarUrl(selectedSenderId);
  }, [getSenderAvatarUrl, selectedSenderId]);

  const activeAvatarUrl = useMemo(() => {
    if (!selectedConversation) {
      return null;
    }
    return getAvatarUrl(selectedConversation.chatId);
  }, [getAvatarUrl, selectedConversation]);

  const optimisticMessages = useMemo(() => {
    if (!activeConversationId) {
      return [];
    }
    return optimisticByConversation[activeConversationId] ?? [];
  }, [activeConversationId, optimisticByConversation]);

  const messagesQuery = useWhatsappMessagesPaginated(activeConversationId, {
    enabled: Boolean(activeConversationId) && selectedSender?.status === 'ready',
    refetchIntervalMs:
      activeConversationId && selectedSender?.status === 'ready'
        ? syncPending
          ? 3000
          : WHATSAPP_INBOX_SILENT_SYNC_MS
        : undefined,
  });

  const visibleOptimisticMessages = useMemo(
    () =>
      pruneOptimisticWhatsappMessages(
        optimisticMessages,
        messagesQuery.messages,
      ),
    [messagesQuery.messages, optimisticMessages],
  );

  const displayMessages = useMemo(
    () =>
      mergeWhatsappMessagesWithOptimistic(
        messagesQuery.messages,
        visibleOptimisticMessages,
      ),
    [messagesQuery.messages, visibleOptimisticMessages],
  );

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }
    if (visibleOptimisticMessages.length === optimisticMessages.length) {
      return;
    }
    const removedIds = optimisticMessages
      .filter(
        (item) =>
          !visibleOptimisticMessages.some((kept) => kept.id === item.id),
      )
      .map((item) => item.id);
    if (removedIds.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLocalPreviewUrls((prev) => {
        const next = { ...prev };
        for (const id of removedIds) {
          const url = next[id];
          if (url) {
            URL.revokeObjectURL(url);
          }
          delete next[id];
        }
        return next;
      });
      setOptimisticByConversation((prev) => ({
        ...prev,
        [activeConversationId]: visibleOptimisticMessages,
      }));
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    activeConversationId,
    optimisticMessages,
    visibleOptimisticMessages,
  ]);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      void whatsappInboxService
        .prefetchConversationMedia(activeConversationId)
        .catch(() => undefined);
    }, 300);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeConversationId]);

  useWhatsappSilentInboxSync(
    selectedSender?.status === 'ready' ? selectedSenderId : null,
    activeConversationId,
    {
      enabled: selectedSender?.status === 'ready',
      onSynced: () => {
        void conversationsQuery.refetch();
        if (activeConversationId) {
          void messagesQuery.refetch();
        }
      },
    },
  );

  const {
    sendMessage,
    isSending,
    error: sendError,
    reset: resetSendError,
  } = useSendWhatsappMessage();

  const {
    sendAttachment,
    isSendingAttachment,
    error: attachError,
    reset: resetAttachError,
  } = useSendWhatsappAttachment();

  const composerError = sendError ?? attachError;
  const composerBusy = isSending || isSendingAttachment;

  const handleClearComposerError = useCallback(() => {
    resetSendError();
    resetAttachError();
  }, [resetAttachError, resetSendError]);

  const handleSelectSender = useCallback(
    (senderId: string) => {
      setManualSenderId(senderId);
      setSelectedConversationId(null);
      setMobileThreadOpen(false);
      const path = orgPath(orgSlug, '/whatsapp/inbox');
      router.replace(`${path}?sender=${senderId}`, { scroll: false });
    },
    [orgSlug, router],
  );

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
    setMobileThreadOpen(true);
  }, []);

  const appendOptimisticMessage = useCallback(
    (conversationId: string, message: WhatsappMessage) => {
      setOptimisticByConversation((prev) => {
        const existing = prev[conversationId] ?? [];
        return {
          ...prev,
          [conversationId]: [...existing, message],
        };
      });
    },
    [],
  );

  const removeOptimisticMessage = useCallback(
    (conversationId: string, messageId: string) => {
      setOptimisticByConversation((prev) => {
        const existing = prev[conversationId] ?? [];
        const nextList = existing.filter((item) => item.id !== messageId);
        if (nextList.length === existing.length) {
          return prev;
        }
        return { ...prev, [conversationId]: nextList };
      });
      setLocalPreviewUrls((prev) => {
        const url = prev[messageId];
        if (url) {
          URL.revokeObjectURL(url);
        }
        if (!(messageId in prev)) {
          return prev;
        }
        const next = { ...prev };
        delete next[messageId];
        return next;
      });
    },
    [],
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!activeConversationId) {
        return;
      }
      const pendingId = createPendingWhatsappMessageId();
      appendOptimisticMessage(
        activeConversationId,
        buildPendingTextMessage(pendingId, text),
      );
      try {
        await sendMessage(activeConversationId, text);
      } catch {
        removeOptimisticMessage(activeConversationId, pendingId);
      }
    },
    [
      activeConversationId,
      appendOptimisticMessage,
      removeOptimisticMessage,
      sendMessage,
    ],
  );

  const handleSendAttachment = useCallback(
    async (file: File, caption?: string) => {
      if (!activeConversationId) {
        return;
      }
      const pendingId = createPendingWhatsappMessageId();
      const previewUrl = URL.createObjectURL(file);
      setLocalPreviewUrls((prev) => ({ ...prev, [pendingId]: previewUrl }));
      appendOptimisticMessage(
        activeConversationId,
        buildPendingAttachmentMessage(pendingId, file, caption),
      );
      try {
        await sendAttachment(activeConversationId, file, caption);
      } catch {
        removeOptimisticMessage(activeConversationId, pendingId);
      }
    },
    [
      activeConversationId,
      appendOptimisticMessage,
      removeOptimisticMessage,
      sendAttachment,
    ],
  );

  const settingsHref = orgPath(orgSlug, '/whatsapp/settings');

  if (sendersQuery.isLoading) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress className="!text-[#008069]" />
      </Box>
    );
  }

  if (!availability?.available) {
    return (
      <Box className="max-w-xl space-y-4">
        <Alert severity="info">
          WhatsApp is not available yet. A platform administrator must configure
          OpenWA under Platform → WhatsApp / OpenWA.
        </Alert>
      </Box>
    );
  }

  if (senders.length === 0) {
    return (
      <Box className="max-w-xl space-y-4">
        <Alert severity="info">
          Add a connected WhatsApp sender to view and reply to conversations here.
        </Alert>
        <Button
          component={Link}
          href={settingsHref}
          variant="contained"
          className="!bg-[#008069] !normal-case"
        >
          WhatsApp senders
        </Button>
      </Box>
    );
  }

  if (readySenders.length === 0) {
    return (
      <Box className="max-w-xl space-y-4">
        <Alert severity="info">
          Finish connecting at least one WhatsApp sender to open your inbox.
        </Alert>
        <Button
          component={Link}
          href={settingsHref}
          variant="contained"
          className="!bg-[#008069] !normal-case"
        >
          WhatsApp senders
        </Button>
      </Box>
    );
  }

  if (!selectedSenderId || !selectedSender) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress className="!text-[#008069]" />
      </Box>
    );
  }

  const senderLabel = whatsappInboxSenderLabel(selectedSender);

  return (
    <Box className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <Stack direction="row" spacing={2} className="shrink-0 items-center">
        <Box
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#008069]/10 text-[#008069] ring-1 ring-[#008069]/15"
          aria-hidden
        >
          <WhatsAppIcon />
        </Box>
        <Box className="min-w-0">
          <Typography variant="h5" className="font-semibold tracking-tight text-foreground">
            Inbox
          </Typography>
          <Typography variant="body2" className={`mt-0.5 ${waInboxUi.textMuted}`}>
            Chats from your connected WhatsApp numbers
          </Typography>
        </Box>
      </Stack>

      <Box className={`min-h-0 flex-1 ${waInboxUi.shell}`}>
        <Box
          className={`${waInboxUi.sidebar} lg:border-r ${waInboxUi.sidebarDivider} ${
            mobileThreadOpen ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <WhatsappInboxSenderChips
            senders={readySenders}
            selectedId={selectedSenderId}
            onSelect={handleSelectSender}
            getSenderAvatarUrl={getSenderAvatarUrl}
          />
          <WhatsappConversationSidebar
            conversations={conversations}
            selectedId={activeConversationId}
            onSelect={handleSelectConversation}
            syncPending={syncPending}
            isLoading={conversationsQuery.isLoading}
            subtitle={`Sending as ${senderLabel}`}
            senderAvatarUrl={selectedSenderAvatarUrl}
            getAvatarUrl={getAvatarUrl}
          />
        </Box>

        <Box
          className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-white ${
            mobileThreadOpen ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <WhatsappMessageThread
            conversation={selectedConversation}
            messages={displayMessages}
            localPreviewUrls={localPreviewUrls}
            isLoading={messagesQuery.isLoading}
            hasMore={messagesQuery.hasMore}
            isLoadingOlder={messagesQuery.isLoadingOlder}
            onLoadOlder={() => void messagesQuery.loadOlder()}
            showBackButton={mobileThreadOpen}
            onBack={() => setMobileThreadOpen(false)}
            senderLabel={senderLabel}
            senderAvatarUrl={selectedSenderAvatarUrl}
            avatarUrl={activeAvatarUrl}
          />
        <WhatsappMessageComposer
          disabled={!activeConversationId}
          isSending={composerBusy}
          error={composerError}
          onClearError={handleClearComposerError}
          onSend={handleSend}
          onSendAttachment={handleSendAttachment}
        />
        </Box>
      </Box>
    </Box>
  );
}
