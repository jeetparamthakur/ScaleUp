'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useCallback, useRef, useState } from 'react';
import WhatsappComposerEmojiPicker from '@/components/inbox/whatsapp/WhatsappComposerEmojiPicker';
import { waInboxUi } from '@/lib/inbox/whatsapp-inbox-ui';

function hasComposerText(value: string): boolean {
  return value.trim().length > 0;
}

const composerFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '24px',
    backgroundColor: '#ffffff',
    fontSize: '0.9375rem',
    paddingLeft: '4px',
    boxShadow: '0 1px 0.5px rgba(11, 20, 26, 0.08)',
    '& fieldset': { border: '1px solid rgba(11, 20, 26, 0.06)' },
    '&:hover fieldset': { border: '1px solid rgba(11, 20, 26, 0.08)' },
    '&.Mui-focused fieldset': { border: '1px solid rgba(0, 128, 105, 0.35)' },
  },
};

const MAX_ATTACHMENT_BYTES = 16 * 1024 * 1024;

interface WhatsappMessageComposerProps {
  disabled?: boolean;
  isSending?: boolean;
  error?: string | null;
  onSend: (text: string) => Promise<void>;
  onSendAttachment?: (file: File, caption?: string) => Promise<void>;
  onClearError?: () => void;
}

export default function WhatsappMessageComposer({
  disabled = false,
  isSending = false,
  error,
  onSend,
  onSendAttachment,
  onClearError,
}: WhatsappMessageComposerProps) {
  const [draft, setDraft] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const busy = isSending;
  const canSend =
    !disabled &&
    !busy &&
    (pendingFile != null || hasComposerText(draft));

  const handleSend = useCallback(async () => {
    if (!canSend) {
      return;
    }
    onClearError?.();
    setLocalError(null);

    if (pendingFile && onSendAttachment) {
      const caption = draft.trim() || undefined;
      await onSendAttachment(pendingFile, caption);
      setPendingFile(null);
      setDraft('');
      return;
    }

    const text = draft.trim();
    if (!hasComposerText(text)) {
      return;
    }
    await onSend(text);
    setDraft('');
  }, [canSend, draft, onClearError, onSend, onSendAttachment, pendingFile]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  const handlePickFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) {
        return;
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        setLocalError('File is too large. Maximum size is 16 MB.');
        return;
      }
      setLocalError(null);
      setPendingFile(file);
    },
    [],
  );

  const insertEmoji = useCallback((emoji: string) => {
    const el = textInputRef.current;
    if (!el) {
      setDraft((current) => current + emoji);
      return;
    }

    const start = el.selectionStart ?? draft.length;
    const end = el.selectionEnd ?? draft.length;
    const next = `${draft.slice(0, start)}${emoji}${draft.slice(end)}`;
    setDraft(next);

    requestAnimationFrame(() => {
      el.focus();
      const caret = start + emoji.length;
      el.setSelectionRange(caret, caret);
    });
  }, [draft]);

  const displayError = localError ?? error;

  return (
    <Box className={`${waInboxUi.composerBar} shrink-0`}>
      {displayError ? (
        <Alert severity="error" className="mb-2" onClose={() => {
          setLocalError(null);
          onClearError?.();
        }}>
          {displayError}
        </Alert>
      ) : null}

      {pendingFile ? (
        <Box className="mb-2 flex flex-col gap-0.5">
          <Box className="flex items-center gap-1">
            <Chip
              size="small"
              label={pendingFile.name}
              onDelete={() => setPendingFile(null)}
              deleteIcon={<CloseIcon fontSize="small" />}
              className="max-w-full !bg-white"
            />
          </Box>
          <Typography variant="caption" className={waInboxUi.textMuted}>
            Sent as a file on WhatsApp (document).
          </Typography>
        </Box>
      ) : null}

      <Box className="flex items-end gap-1">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
          onChange={handleFileChange}
          disabled={disabled || busy || !onSendAttachment}
        />
        <IconButton
          aria-label="Attach file"
          onClick={handlePickFile}
          disabled={disabled || busy || !onSendAttachment}
          className="!mb-0.5 !text-[#54656f]"
          size="small"
        >
          <AttachFileIcon fontSize="small" />
        </IconButton>
        <WhatsappComposerEmojiPicker
          disabled={disabled || busy}
          onPick={insertEmoji}
        />
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={4}
          placeholder={pendingFile ? 'Add a caption' : 'Type a message'}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || busy}
          size="small"
          inputRef={textInputRef}
          sx={composerFieldSx}
          slotProps={{
            htmlInput: {
              className: 'text-[15px] leading-snug',
            },
          }}
        />
        <IconButton
          aria-label="Send message"
          onClick={() => void handleSend()}
          disabled={!canSend}
          className={`!mb-0.5 shrink-0 !rounded-full !text-white ${waInboxUi.accentBg} ${waInboxUi.sendButton} disabled:!scale-100 disabled:!bg-[#8696a0] disabled:!shadow-none`}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
