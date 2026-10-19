'use client';

import Box from '@mui/material/Box';
import WhatsappConversationAvatar from '@/components/inbox/whatsapp/WhatsappConversationAvatar';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import WhatsappMessageBubble from '@/components/inbox/whatsapp/WhatsappMessageBubble';
import { formatWhatsappConversationTitle } from '@/lib/inbox/format-whatsapp-conversation-title';
import { waInboxUi } from '@/lib/inbox/whatsapp-inbox-ui';
import {
  bubbleGroupPosition,
  buildWhatsappThreadRows,
} from '@/lib/inbox/whatsapp-thread-layout';
import type { WhatsappConversation, WhatsappMessage } from '@/lib/inbox/whatsapp-types';

interface WhatsappMessageThreadProps {
  conversation: WhatsappConversation | null;
  messages: WhatsappMessage[];
  localPreviewUrls?: Record<string, string>;
  isLoading: boolean;
  hasMore: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  senderLabel?: string;
  senderAvatarUrl?: string | null;
  avatarUrl?: string | null;
}

function ThreadEmptyState({ senderLabel }: { senderLabel?: string }) {
  return (
    <Box
      className={`flex flex-1 flex-col items-center justify-center gap-4 p-10 ${waInboxUi.chatWallpaper}`}
    >
      <Box
        className="flex h-28 w-28 items-center justify-center rounded-full bg-white/80 shadow-[0_2px_12px_rgba(11,20,26,0.08)] ring-1 ring-black/[0.04]"
        aria-hidden
      >
        <ChatOutlinedIcon className="!text-5xl !text-[#8696a0]" />
      </Box>
      <Stack spacing={0.75} className="max-w-sm text-center">
        <Typography variant="h6" className="text-lg font-semibold text-[#111b21]">
          Your messages live here
        </Typography>
        <Typography variant="body2" className={`text-pretty ${waInboxUi.textMuted}`}>
          Pick a conversation on the left to view history and send replies from your connected
          number.
        </Typography>
        {senderLabel ? (
          <Typography variant="caption" className={waInboxUi.textMuted}>
            Sending as <span className="font-medium text-[#111b21]">{senderLabel}</span>
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}

export default function WhatsappMessageThread({
  conversation,
  messages,
  localPreviewUrls = {},
  isLoading,
  hasMore,
  isLoadingOlder,
  onLoadOlder,
  showBackButton = false,
  onBack,
  senderLabel,
  senderAvatarUrl = null,
  avatarUrl = null,
}: WhatsappMessageThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const stickToBottomRef = useRef(true);

  const threadRows = useMemo(() => buildWhatsappThreadRows(messages), [messages]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom < 80;
    stickToBottomRef.current = nearBottom;
    setShowScrollDown(!nearBottom);
  }, []);

  useEffect(() => {
    if (stickToBottomRef.current) {
      scrollToBottom('auto');
    }
  }, [messages, scrollToBottom]);

  if (!conversation) {
    return <ThreadEmptyState senderLabel={senderLabel} />;
  }

  const displayTitle = formatWhatsappConversationTitle(
    conversation.title,
    conversation.chatId,
    conversation.isGroup,
  );

  return (
    <Box className="relative flex min-h-0 flex-1 flex-col">
      <Box className={`${waInboxUi.headerBar} min-h-[60px]`}>
        {showBackButton ? (
          <IconButton
            aria-label="Back to chats"
            onClick={onBack}
            size="small"
            className="!text-[#54656f]"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        ) : null}
        <WhatsappConversationAvatar
          isGroup={conversation.isGroup}
          avatarUrl={avatarUrl}
          className={`${waInboxUi.avatar} !h-10 !w-10`}
        />
        <Box className="min-w-0 flex-1">
          <Typography variant="subtitle1" className="truncate text-[16px] font-medium text-[#111b21]">
            {displayTitle}
          </Typography>
          {conversation.isGroup ? (
            <Typography variant="caption" className={waInboxUi.textMuted}>
              Group chat
            </Typography>
          ) : senderLabel ? (
            <Box className="flex min-w-0 items-center gap-1.5">
              {senderAvatarUrl ? (
                <WhatsappConversationAvatar
                  isGroup={false}
                  avatarUrl={senderAvatarUrl}
                  className={`${waInboxUi.avatar} !h-5 !w-5`}
                />
              ) : null}
              <Typography variant="caption" className={`truncate ${waInboxUi.textMuted}`}>
                via {senderLabel}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Box>

      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        className={`min-h-0 flex-1 overflow-y-auto px-[4%] py-3 sm:px-[8%] ${waInboxUi.chatWallpaper}`}
      >
        {hasMore ? (
          <Box className="mb-3 flex justify-center">
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                stickToBottomRef.current = false;
                onLoadOlder();
              }}
              disabled={isLoadingOlder}
              className="!rounded-full !border-[#e9edef] !bg-white/90 !normal-case !text-[#008069] hover:!bg-white"
            >
              {isLoadingOlder ? 'Loading…' : 'Load earlier messages'}
            </Button>
          </Box>
        ) : null}

        {isLoading ? (
          <Box className="flex justify-center py-12">
            <CircularProgress size={28} className="!text-[#008069]" />
          </Box>
        ) : messages.length === 0 ? (
          <Box className="flex flex-col items-center gap-2 py-16 text-center">
            <Typography variant="body2" className="font-medium text-[#111b21]">
              No messages yet
            </Typography>
            <Typography variant="caption" className={waInboxUi.textMuted}>
              Send a message below to start the conversation.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {threadRows.map((row) => {
              if (row.kind === 'day') {
                return (
                  <Box key={row.key} className={waInboxUi.dayDivider} role="separator">
                    {row.label}
                  </Box>
                );
              }

              const clusterSize = row.messages.length;
              return (
                <Stack key={row.key} spacing={0} className="w-full min-w-0">
                  {row.messages.map((message, index) => (
                    <WhatsappMessageBubble
                      key={message.id}
                      conversationId={conversation.id}
                      message={message}
                      groupPosition={bubbleGroupPosition(index, clusterSize)}
                      localPreviewUrl={localPreviewUrls[message.id] ?? null}
                    />
                  ))}
                </Stack>
              );
            })}
          </Stack>
        )}
      </Box>

      {showScrollDown ? (
        <Fab
          size="small"
          aria-label="Scroll to latest messages"
          onClick={() => {
            stickToBottomRef.current = true;
            scrollToBottom();
          }}
          className="!absolute bottom-24 right-4 !bg-white !text-[#54656f] shadow-lg ring-1 ring-black/[0.06]"
        >
          <KeyboardArrowDownIcon />
        </Fab>
      ) : null}
    </Box>
  );
}
