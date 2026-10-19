'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatMessageTime } from '@/lib/inbox/formatChatTime';
import WhatsappMessageAttachment from '@/components/inbox/whatsapp/WhatsappMessageAttachment';
import {
  whatsappMessageIsMedia,
  whatsappMessageMediaCaption,
  whatsappMessagePreviewLabel,
} from '@/lib/inbox/whatsapp-message-display';
import {
  type BubbleGroupPosition,
  bubbleClusterSpacingClass,
  bubbleShapeClass,
} from '@/lib/inbox/whatsapp-thread-layout';
import { waInboxUi } from '@/lib/inbox/whatsapp-inbox-ui';
import type { WhatsappMessage } from '@/lib/inbox/whatsapp-types';

interface WhatsappMessageBubbleProps {
  conversationId: string;
  message: WhatsappMessage;
  groupPosition: BubbleGroupPosition;
  localPreviewUrl?: string | null;
}

function MessageTime({ sentAt }: { sentAt: string }) {
  return (
    <Typography
      variant="caption"
      className={`mt-0.5 block text-right tabular-nums text-[11px] ${waInboxUi.textMuted}`}
    >
      {formatMessageTime(sentAt)}
    </Typography>
  );
}

export default function WhatsappMessageBubble({
  conversationId,
  message,
  groupPosition,
  localPreviewUrl = null,
}: WhatsappMessageBubbleProps) {
  const isMedia = whatsappMessageIsMedia(message);
  const caption = whatsappMessageMediaCaption(message);
  const label = whatsappMessagePreviewLabel(message);

  const shape = bubbleShapeClass(message.fromMe, groupPosition);
  const align = message.fromMe ? waInboxUi.bubbleSent : waInboxUi.bubbleReceived;
  const shellClass = waInboxUi.bubbleBase;

  return (
    <Box
      className={`${shellClass} ${shape} ${align} ${bubbleClusterSpacingClass(groupPosition)}`}
    >
      {isMedia ? (
        <WhatsappMessageAttachment
          key={`${conversationId}:${message.id}`}
          conversationId={conversationId}
          message={message}
          localPreviewUrl={localPreviewUrl}
        />
      ) : null}
      {caption ? (
        <Typography
          variant="body2"
          className="whitespace-pre-wrap px-1.5 text-[14.2px] leading-snug text-[#111b21]"
        >
          {caption}
        </Typography>
      ) : null}
      {!isMedia ? (
        <Typography
          variant="body2"
          className="whitespace-pre-wrap text-[14.2px] leading-snug text-[#111b21]"
        >
          {caption || label}
        </Typography>
      ) : null}
      <MessageTime sentAt={message.sentAt} />
    </Box>
  );
}
