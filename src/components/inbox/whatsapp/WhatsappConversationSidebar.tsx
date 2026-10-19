'use client';

import Badge from '@mui/material/Badge';
import WhatsappConversationAvatar from '@/components/inbox/whatsapp/WhatsappConversationAvatar';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useMemo, useState } from 'react';
import { formatChatTime } from '@/lib/inbox/formatChatTime';
import { formatWhatsappConversationTitle } from '@/lib/inbox/format-whatsapp-conversation-title';
import { waInboxUi } from '@/lib/inbox/whatsapp-inbox-ui';
import type { WhatsappConversation } from '@/lib/inbox/whatsapp-types';

const searchFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    fontSize: '0.875rem',
    boxShadow: '0 1px 0.5px rgba(11, 20, 26, 0.08)',
    '& fieldset': { border: '1px solid rgba(11, 20, 26, 0.06)' },
    '&:hover fieldset': { border: '1px solid rgba(11, 20, 26, 0.08)' },
    '&.Mui-focused fieldset': { border: '1px solid rgba(0, 128, 105, 0.35)' },
  },
};

interface WhatsappConversationSidebarProps {
  conversations: WhatsappConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  syncPending?: boolean;
  isLoading?: boolean;
  subtitle?: string;
  senderAvatarUrl?: string | null;
  getAvatarUrl?: (chatId: string) => string | null;
}

export default function WhatsappConversationSidebar({
  conversations,
  selectedId,
  onSelect,
  syncPending = false,
  isLoading = false,
  subtitle,
  senderAvatarUrl,
  getAvatarUrl,
}: WhatsappConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return conversations;
    }
    return conversations.filter((conversation) => {
      const displayTitle = formatWhatsappConversationTitle(
        conversation.title,
        conversation.chatId,
        conversation.isGroup,
      );
      return (
        displayTitle.toLowerCase().includes(q) ||
        conversation.title.toLowerCase().includes(q) ||
        (conversation.lastMessagePreview ?? '').toLowerCase().includes(q)
      );
    });
  }, [conversations, searchQuery]);

  return (
    <Box className="flex h-full min-h-0 flex-col">
      <Box className={`${waInboxUi.panelMuted} shrink-0 border-b border-[#e9edef]/80 px-4 pb-3 pt-4`}>
        <Typography variant="subtitle1" className="text-[17px] font-semibold text-[#111b21]">
          Chats
        </Typography>
        {subtitle ? (
          <Box className="mt-1 flex items-center gap-2">
            {senderAvatarUrl ? (
              <WhatsappConversationAvatar
                isGroup={false}
                avatarUrl={senderAvatarUrl}
                className={`${waInboxUi.avatar} !h-7 !w-7`}
              />
            ) : null}
            <Typography variant="caption" className={waInboxUi.textMuted}>
              {subtitle}
            </Typography>
          </Box>
        ) : null}
        {syncPending ? (
          <Typography variant="caption" className={`mt-1 block ${waInboxUi.accent}`}>
            Syncing history…
          </Typography>
        ) : null}
        <TextField
          size="small"
          fullWidth
          placeholder="Search or start new chat"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="mt-3"
          sx={searchFieldSx}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" className="!text-[#54656f]" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box className="min-h-0 flex-1 overflow-y-auto bg-white py-2">
        {isLoading && conversations.length === 0 ? (
          <Stack spacing={1.5} className="px-3 py-2">
            {Array.from({ length: 6 }, (_, index) => (
              <Stack key={index} direction="row" spacing={1.5} className="items-center px-2 py-1">
                <Skeleton variant="circular" width={48} height={48} />
                <Box className="min-w-0 flex-1">
                  <Skeleton width="55%" height={18} />
                  <Skeleton width="85%" height={14} className="mt-1" />
                </Box>
              </Stack>
            ))}
          </Stack>
        ) : null}
        {!isLoading && filtered.length === 0 ? (
          <Stack spacing={1.5} className="items-center px-6 py-12 text-center">
            <Box
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0f2f5] text-[#8696a0]"
              aria-hidden
            >
              <ForumOutlinedIcon />
            </Box>
            <Typography variant="body2" className="font-medium text-[#111b21]">
              {conversations.length === 0
                ? syncPending
                  ? 'Syncing your chats'
                  : 'No conversations yet'
                : 'No matches'}
            </Typography>
            <Typography variant="caption" className={`max-w-[240px] text-pretty ${waInboxUi.textMuted}`}>
              {conversations.length === 0
                ? syncPending
                  ? 'History sync in progress. Chats will appear here shortly.'
                  : 'When someone messages your connected number, the thread will show up here.'
                : 'Try a different name or message preview.'}
            </Typography>
          </Stack>
        ) : filtered.length > 0 ? (
          <List disablePadding className="px-1">
            {filtered.map((conversation) => {
              const selected = conversation.id === selectedId;
              const hasUnread = conversation.unreadCount > 0;
              const displayTitle = formatWhatsappConversationTitle(
                conversation.title,
                conversation.chatId,
                conversation.isGroup,
              );
              return (
                <ListItemButton
                  key={conversation.id}
                  selected={selected}
                  onClick={() => onSelect(conversation.id)}
                  className={`${waInboxUi.listItem} ${selected ? waInboxUi.listItemSelected : ''}`}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#f0f2f5',
                    },
                    '&.Mui-selected:hover': {
                      backgroundColor: '#f0f2f5',
                    },
                  }}
                >
                  <Badge
                    badgeContent={conversation.unreadCount}
                    color="success"
                    invisible={conversation.unreadCount <= 0}
                    max={99}
                    className="mr-3 shrink-0"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#25d366',
                        color: '#fff',
                        fontWeight: 600,
                      },
                    }}
                  >
                    <WhatsappConversationAvatar
                      isGroup={conversation.isGroup}
                      avatarUrl={getAvatarUrl?.(conversation.chatId) ?? null}
                    />
                  </Badge>
                  <ListItemText
                    disableTypography
                    className="min-w-0"
                    primary={
                      <Box className="flex items-center justify-between gap-2">
                        <span
                          className={`truncate text-[15px] text-[#111b21] ${
                            hasUnread ? 'font-semibold' : 'font-normal'
                          }`}
                        >
                          {displayTitle}
                        </span>
                        <span
                          className={`shrink-0 text-xs tabular-nums ${
                            hasUnread ? 'font-medium text-[#008069]' : waInboxUi.textMuted
                          }`}
                        >
                          {formatChatTime(conversation.lastMessageAt)}
                        </span>
                      </Box>
                    }
                    secondary={
                      <span
                        className={`mt-0.5 line-clamp-1 text-sm ${
                          hasUnread ? 'font-medium text-[#111b21]' : `font-normal ${waInboxUi.textMuted}`
                        }`}
                      >
                        {conversation.lastMessagePreview ?? 'No messages'}
                      </span>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        ) : null}
      </Box>
    </Box>
  );
}
