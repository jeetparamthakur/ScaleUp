'use client';

import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import type { WhatsappInboxSender } from '@/lib/inbox/whatsapp-types';
import { whatsappInboxSenderLabel } from '@/lib/inbox/whatsapp-sender-label';
import { waInboxUi } from '@/lib/inbox/whatsapp-inbox-ui';

interface WhatsappInboxSenderChipsProps {
  senders: WhatsappInboxSender[];
  selectedId: string;
  onSelect: (senderId: string) => void;
  getSenderAvatarUrl?: (senderId: string) => string | null;
}

function SenderChipAvatar({
  senderId,
  selected,
  getSenderAvatarUrl,
}: {
  senderId: string;
  selected: boolean;
  getSenderAvatarUrl?: (senderId: string) => string | null;
}) {
  const url = getSenderAvatarUrl?.(senderId)?.trim() ?? '';
  return (
    <Avatar
      src={url || undefined}
      className={`!h-6 !w-6 !text-[11px] ${
        selected ? '!bg-[#006b52]' : '!bg-[#dfe5e7]'
      }`}
    >
      <PhoneAndroidOutlinedIcon
        className={`!text-[14px] ${selected ? '!text-white' : '!text-[#54656f]'}`}
        aria-hidden
      />
    </Avatar>
  );
}

export default function WhatsappInboxSenderChips({
  senders,
  selectedId,
  onSelect,
  getSenderAvatarUrl,
}: WhatsappInboxSenderChipsProps) {
  if (senders.length <= 1) {
    return null;
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      className={`${waInboxUi.panelMuted} gap-2 overflow-x-auto border-b border-[#e9edef] px-3 py-2.5`}
      role="tablist"
      aria-label="WhatsApp senders"
    >
      {senders.map((sender) => {
        const selected = sender.id === selectedId;
        const ready = sender.status === 'ready';

        return (
          <Chip
            key={sender.id}
            role="tab"
            aria-selected={selected}
            avatar={
              <SenderChipAvatar
                senderId={sender.id}
                selected={selected}
                getSenderAvatarUrl={getSenderAvatarUrl}
              />
            }
            label={whatsappInboxSenderLabel(sender)}
            size="small"
            disabled={!ready}
            onClick={() => onSelect(sender.id)}
            className="!shrink-0 !font-normal"
            sx={{
              borderRadius: '16px',
              backgroundColor: selected ? '#008069' : '#ffffff',
              color: selected ? '#ffffff' : '#54656f',
              border: selected ? 'none' : '1px solid #e9edef',
              '&:hover': {
                backgroundColor: selected ? '#007a5e' : '#f5f6f6',
              },
              '&.Mui-disabled': {
                opacity: 0.5,
              },
            }}
          />
        );
      })}
    </Stack>
  );
}
