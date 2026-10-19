'use client';

import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  WHATSAPP_MESSAGE_MAX_LENGTH,
  renderWhatsappFormattedMessage,
} from '@/lib/whatsapp/format-whatsapp-message';

const MAX_ATTACHMENT_BYTES = 16 * 1024 * 1024;

interface WhatsappCampaignMessageEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export default function WhatsappCampaignMessageEditor({
  value,
  onChange,
  disabled = false,
  error = false,
}: WhatsappCampaignMessageEditorProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const attachmentPreviewUrl = useMemo(() => {
    if (!attachment || !isImageFile(attachment)) {
      return null;
    }
    return URL.createObjectURL(attachment);
  }, [attachment]);

  useEffect(() => {
    return () => {
      if (attachmentPreviewUrl) {
        URL.revokeObjectURL(attachmentPreviewUrl);
      }
    };
  }, [attachmentPreviewUrl]);

  function clearAttachment() {
    setAttachment(null);
    setAttachmentError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleAttachmentPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentError('File must be 16 MB or smaller.');
      event.target.value = '';
      return;
    }
    setAttachmentError(null);
    setAttachment(file);
  }

  const charCount = value.length;
  const atLimit = charCount >= WHATSAPP_MESSAGE_MAX_LENGTH;

  return (
    <Stack spacing={1.5}>
      <Box
        className={`overflow-hidden rounded-2xl border bg-background shadow-sm transition-[box-shadow,border-color] ${
          error
            ? 'border-error'
            : 'border-surface-border focus-within:border-primary/45 focus-within:ring-2 focus-within:ring-primary/15'
        }`}
      >
        <Box className="px-4 pb-2 pt-3">
          {attachment ? (
            <Box
              className="relative mb-3 inline-flex max-w-full overflow-hidden rounded-xl border border-surface-border bg-muted/20"
            >
              {attachmentPreviewUrl ? (
                <Box
                  component="img"
                  src={attachmentPreviewUrl}
                  alt=""
                  className="max-h-36 max-w-full object-cover"
                />
              ) : (
                <Stack
                  direction="row"
                  spacing={1.5}
                  className="items-center px-3 py-2.5"
                >
                  <InsertDriveFileOutlinedIcon
                    className="text-emerald-600 dark:text-emerald-400"
                    fontSize="small"
                  />
                  <Typography variant="body2" className="max-w-[220px] truncate">
                    {attachment.name}
                  </Typography>
                </Stack>
              )}
              <IconButton
                size="small"
                aria-label="Remove attachment"
                disabled={disabled}
                onClick={clearAttachment}
                className="absolute right-1 top-1 rounded-lg bg-background/90 shadow-sm"
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : null}

          <InputBase
            inputRef={inputRef}
            value={value}
            onChange={(event) => {
              const next = event.target.value;
              if (next.length <= WHATSAPP_MESSAGE_MAX_LENGTH) {
                onChange(next);
              }
            }}
            disabled={disabled}
            multiline
            minRows={5}
            maxRows={12}
            placeholder="Write your message here"
            fullWidth
            className="w-full text-[15px] leading-relaxed text-foreground"
            sx={{
              '& textarea': {
                padding: 0,
                resize: 'none',
              },
            }}
          />
        </Box>

        <Box
          className="flex items-center gap-1 border-t border-surface-border bg-muted/10 px-2 py-1.5"
        >
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            disabled={disabled}
            onChange={handleAttachmentPick}
          />
          <Tooltip title="Attach image, video, or document">
            <span>
              <IconButton
                size="small"
                aria-label="Attach file"
                disabled={disabled}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
              >
                <AttachFileOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Box className="flex-1" />
          <Typography
            variant="caption"
            color={atLimit ? 'error' : 'text.secondary'}
            className="shrink-0 px-1 tabular-nums"
          >
            {charCount}/{WHATSAPP_MESSAGE_MAX_LENGTH}
          </Typography>
        </Box>
      </Box>

      {attachmentError ? (
        <Alert severity="error" className="rounded-xl">
          {attachmentError}
        </Alert>
      ) : null}

      {attachment ? (
        <Alert severity="info" className="rounded-xl">
          Attachment preview is shown here. Campaign sends use text only for now;
          media delivery is coming soon.
        </Alert>
      ) : null}

      {value.trim() || attachment ? (
        <Box
          className="rounded-2xl border border-surface-border bg-muted/10 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.05)_1px,transparent_0)] bg-[length:20px_20px] p-4 dark:bg-[radial-gradient(circle_at_1px_1px,rgba(248,250,252,0.06)_1px,transparent_0)]"
        >
          <Typography
            variant="caption"
            color="text.secondary"
            className="mb-3 block font-medium uppercase tracking-wide"
          >
            Preview
          </Typography>
          <Stack spacing={1.5} className="ml-auto max-w-[92%]">
            {attachmentPreviewUrl ? (
              <Box
                component="img"
                src={attachmentPreviewUrl}
                alt=""
                className="max-h-40 w-auto max-w-full self-end rounded-2xl rounded-tr-md border border-surface-border object-cover shadow-sm"
              />
            ) : attachment ? (
              <Box
                className="self-end rounded-2xl rounded-tr-md border border-surface-border bg-background px-3 py-2 shadow-sm"
              >
                <Stack direction="row" spacing={1} className="items-center">
                  <InsertDriveFileOutlinedIcon fontSize="small" />
                  <Typography variant="body2" className="max-w-[200px] truncate">
                    {attachment.name}
                  </Typography>
                </Stack>
              </Box>
            ) : null}
            {value.trim() ? (
              <Box
                className="rounded-2xl rounded-tr-md bg-emerald-600/[0.12] px-3.5 py-2.5 text-[15px] leading-relaxed text-foreground shadow-sm dark:bg-emerald-400/10"
              >
                <Typography
                  component="div"
                  variant="body2"
                  className="whitespace-pre-wrap break-words text-[15px]"
                >
                  {renderWhatsappFormattedMessage(value)}
                </Typography>
              </Box>
            ) : null}
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
}
