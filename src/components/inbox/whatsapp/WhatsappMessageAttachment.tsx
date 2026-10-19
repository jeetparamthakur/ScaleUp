'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { useWhatsappMessageMediaBlob } from '@/hooks/useWhatsappMessageMediaBlob';
import {
  whatsappMessageAttachmentCanOpenInBrowser,
  whatsappMessageDownloadFilename,
  whatsappMessageIsAudio,
  whatsappMessageIsDocument,
  whatsappMessageIsVisualMedia,
  whatsappMessageMediaSizeLabel,
  whatsappMessagePreviewLabel,
  whatsappMessageVisualMediaKind,
} from '@/lib/inbox/whatsapp-message-display';
import { waInboxUi } from '@/lib/inbox/whatsapp-inbox-ui';
import type { WhatsappMessage } from '@/lib/inbox/whatsapp-types';

interface WhatsappMessageAttachmentProps {
  conversationId: string;
  message: WhatsappMessage;
  localPreviewUrl?: string | null;
}

function MediaLoadingTile({
  label,
  isVisual,
  rateLimited,
  syncPending,
}: {
  label: string;
  isVisual: boolean;
  rateLimited: boolean;
  syncPending: boolean;
}) {
  const tileClass = isVisual
    ? 'h-[200px] w-[min(100%,280px)] max-w-full rounded-lg'
    : 'min-h-[72px] min-w-[200px] rounded-lg';

  return (
    <Box
      className={`relative flex flex-col justify-end gap-1 overflow-hidden bg-[#e9edef] ${tileClass}`}
      aria-busy
      aria-label={`Loading ${label}`}
    >
      <Box
        className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#e9edef] via-[#f0f2f5] to-[#e9edef]"
        aria-hidden
      />
      <Box className="relative z-[1] px-3 py-2">
        {rateLimited ? (
          <Typography variant="caption" className={waInboxUi.textMuted}>
            Gateway busy, retrying…
          </Typography>
        ) : null}
        {syncPending ? (
          <Typography variant="caption" className={waInboxUi.textMuted}>
            Waiting for WhatsApp to sync media…
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

export default function WhatsappMessageAttachment({
  conversationId,
  message,
  localPreviewUrl = null,
}: WhatsappMessageAttachmentProps) {
  const filename = whatsappMessageDownloadFilename(message);
  const typeLabel = whatsappMessagePreviewLabel(message);
  const sizeLabel = whatsappMessageMediaSizeLabel(message);
  const canOpen = whatsappMessageAttachmentCanOpenInBrowser(message);
  const isVisual = whatsappMessageIsVisualMedia(message);
  const visualKind = whatsappMessageVisualMediaKind(message);
  const isAudio = whatsappMessageIsAudio(message);
  const isDocument = whatsappMessageIsDocument(message);

  const { ref, inView } = useInView({
    rootMargin: '200px',
    enabled: !localPreviewUrl,
  });
  const [documentFetchRequested, setDocumentFetchRequested] = useState(false);

  const shouldFetchMedia =
    Boolean(localPreviewUrl) ||
    inView &&
      (isVisual || isAudio || (isDocument && documentFetchRequested));

  const {
    objectUrl,
    failed,
    isLoading,
    retry,
    confirmedUnavailable,
    syncPending,
    rateLimited,
  } = useWhatsappMessageMediaBlob(conversationId, message, {
    enabled: shouldFetchMedia,
    localPreviewUrl,
  });

  const mediaReady = Boolean(objectUrl) && !isLoading;

  const handleDownload = () => {
    if (!objectUrl) {
      if (isDocument) {
        setDocumentFetchRequested(true);
      }
      return;
    }
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = 'noopener';
    anchor.click();
  };

  const handleOpen = () => {
    if (!objectUrl) {
      return;
    }
    window.open(objectUrl, '_blank', 'noopener,noreferrer');
  };

  const waitingForDocument =
    isDocument && !documentFetchRequested && !localPreviewUrl;

  if (waitingForDocument) {
    return (
      <Box
        ref={ref}
        className="flex min-w-[200px] max-w-full flex-col gap-1.5 rounded-lg bg-black/[0.04] px-3 py-2.5"
      >
        <Box className="flex w-full items-center gap-3">
          <Box
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#008069]/10"
            aria-hidden
          >
            <DescriptionOutlinedIcon className="!text-[#008069]" />
          </Box>
          <Box className="min-w-0 flex-1">
            <Typography
              variant="body2"
              className="truncate text-[14.2px] font-medium text-[#111b21]"
            >
              {filename}
            </Typography>
            {[typeLabel !== filename ? typeLabel : null, sizeLabel].some(Boolean) ? (
              <Typography variant="caption" className={waInboxUi.textMuted}>
                {[typeLabel !== filename ? typeLabel : null, sizeLabel]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            ) : null}
          </Box>
        </Box>
        <Button
          size="small"
          variant="contained"
          onClick={() => setDocumentFetchRequested(true)}
          className="!normal-case !bg-[#008069] !shadow-none hover:!bg-[#006e5a]"
        >
          Download
        </Button>
      </Box>
    );
  }

  if (!inView && !localPreviewUrl && !isDocument) {
    return (
      <Box ref={ref} className="relative">
        <MediaLoadingTile
          label={typeLabel}
          isVisual={isVisual}
          rateLimited={false}
          syncPending={false}
        />
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box ref={ref} className="relative">
        <MediaLoadingTile
          label={typeLabel}
          isVisual={isVisual}
          rateLimited={rateLimited}
          syncPending={syncPending}
        />
      </Box>
    );
  }

  if (failed || !objectUrl) {
    return (
      <Box
        ref={ref}
        className="flex min-w-[200px] flex-col gap-1 rounded-lg bg-black/[0.04] px-3 py-2.5"
      >
        <Typography
          variant="body2"
          className="truncate text-[14.2px] font-medium text-[#111b21]"
        >
          {filename}
        </Typography>
        <Typography variant="caption" className={waInboxUi.textMuted}>
          {confirmedUnavailable
            ? 'This file is no longer available from WhatsApp'
            : 'Could not load file'}
        </Typography>
        <Button
          size="small"
          variant="text"
          onClick={retry}
          className="!min-w-0 !self-start !px-0 !normal-case !text-[#008069]"
        >
          Retry download
        </Button>
      </Box>
    );
  }

  const mediaFadeClass = `transition-opacity duration-200 ${mediaReady ? 'opacity-100' : 'opacity-0'}`;

  if (isVisual && visualKind === 'image') {
    return (
      <Box
        ref={ref}
        className="flex max-w-[min(100%,320px)] flex-col gap-1 overflow-hidden rounded-lg"
      >
        {/* Blob URLs from WhatsApp media fetch — next/image does not apply */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={objectUrl}
          alt={typeLabel}
          className={`max-h-[280px] w-full rounded-lg object-cover ${mediaFadeClass}`}
        />
        <Box className="flex flex-wrap gap-1 px-0.5">
          <Button
            size="small"
            variant="text"
            onClick={handleDownload}
            className="!min-w-0 !px-1 !normal-case !text-[#008069]"
          >
            Download
          </Button>
        </Box>
      </Box>
    );
  }

  if (isVisual && visualKind === 'video') {
    return (
      <Box
        ref={ref}
        className="flex max-w-[min(100%,360px)] flex-col gap-1 overflow-hidden rounded-lg"
      >
        <video
          src={objectUrl}
          controls
          playsInline
          preload="metadata"
          className={`max-h-[280px] w-full rounded-lg bg-black ${mediaFadeClass}`}
        />
        <Box className="flex flex-wrap gap-1 px-0.5">
          <Button
            size="small"
            variant="text"
            onClick={handleDownload}
            className="!min-w-0 !px-1 !normal-case !text-[#008069]"
          >
            Download
          </Button>
        </Box>
      </Box>
    );
  }

  if (isAudio) {
    return (
      <Box
        ref={ref}
        className="flex min-w-[220px] max-w-full flex-col gap-1.5 rounded-lg bg-black/[0.04] px-2 py-2"
      >
        <audio
          src={objectUrl}
          controls
          preload="metadata"
          className={`w-full ${mediaFadeClass}`}
        />
        <Button
          size="small"
          variant="text"
          onClick={handleDownload}
          className="!min-w-0 !self-start !px-1 !normal-case !text-[#008069]"
        >
          Download
        </Button>
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      className="flex min-w-[200px] max-w-full flex-col gap-1.5 rounded-lg bg-black/[0.04] px-3 py-2.5"
    >
      <Box className="flex w-full items-center gap-3">
        <Box
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#008069]/10"
          aria-hidden
        >
          <DescriptionOutlinedIcon className="!text-[#008069]" />
        </Box>
        <Box className="min-w-0 flex-1">
          <Typography
            variant="body2"
            className="truncate text-[14.2px] font-medium text-[#111b21]"
          >
            {filename}
          </Typography>
          {[typeLabel !== filename ? typeLabel : null, sizeLabel].some(Boolean) ? (
            <Typography variant="caption" className={waInboxUi.textMuted}>
              {[typeLabel !== filename ? typeLabel : null, sizeLabel]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          ) : null}
        </Box>
      </Box>
      <Box className="flex flex-wrap gap-1">
        <Button
          size="small"
          variant="contained"
          onClick={handleDownload}
          className="!normal-case !bg-[#008069] !shadow-none hover:!bg-[#006e5a]"
        >
          Download
        </Button>
        {canOpen ? (
          <Button
            size="small"
            variant="outlined"
            onClick={handleOpen}
            className="!normal-case !border-[#008069] !text-[#008069]"
          >
            Open
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}
