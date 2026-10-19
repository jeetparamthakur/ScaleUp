'use client';

import Avatar from '@mui/material/Avatar';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { useState } from 'react';
import { waInboxUi } from '@/lib/inbox/whatsapp-inbox-ui';

interface WhatsappConversationAvatarProps {
  isGroup: boolean;
  avatarUrl?: string | null;
  className?: string;
}

export default function WhatsappConversationAvatar({
  isGroup,
  avatarUrl,
  className = waInboxUi.avatar,
}: WhatsappConversationAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const normalizedUrl = avatarUrl?.trim() ?? '';
  const showImage = Boolean(normalizedUrl) && !imageFailed;
  const FallbackIcon = isGroup ? GroupsOutlinedIcon : PersonOutlinedIcon;

  return (
    <Avatar
      key={normalizedUrl || 'fallback'}
      src={showImage ? normalizedUrl : undefined}
      slotProps={{
        img: {
          onError: () => {
            setImageFailed(true);
          },
        },
      }}
      className={className}
    >
      <FallbackIcon className="!text-[22px] !text-[#8696a0]" aria-hidden />
    </Avatar>
  );
}
