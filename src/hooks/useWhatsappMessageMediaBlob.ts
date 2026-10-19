'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { whatsappInboxService } from '@/lib/api/services/whatsapp-inbox.service';
import {
  acquireWhatsappMediaBlobCache,
  releaseWhatsappMediaBlobCache,
  setWhatsappMediaInflight,
  storeWhatsappMediaBlobCache,
  getWhatsappMediaInflight,
} from '@/lib/inbox/whatsapp-media-blob-cache';
import { runWhatsappMediaFetchPool } from '@/lib/inbox/whatsapp-media-fetch-pool';
import type { WhatsappMessage } from '@/lib/inbox/whatsapp-types';

function readMetadataMimetype(message: WhatsappMessage): string | null {
  const meta = message.mediaMetadata;
  if (!meta || typeof meta !== 'object') {
    return null;
  }
  const mimetype = meta.mimetype;
  return typeof mimetype === 'string' && mimetype.trim()
    ? mimetype.trim().split(';')[0]?.trim() ?? null
    : null;
}

function isVideoMessage(
  message: WhatsappMessage,
  metadataMimetype: string | null,
): boolean {
  const type = message.messageType?.toLowerCase() ?? '';
  return type === 'video' || Boolean(metadataMimetype?.startsWith('video/'));
}

function retriableMediaStatus(status: number): boolean {
  return status === 429 || status === 503;
}

function isMediaSyncPendingError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 503 &&
    /not finished syncing this media/i.test(error.message)
  );
}

function isConfirmedUnavailableMediaError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 404 &&
    /no longer available from whatsapp/i.test(error.message)
  );
}

function isGenericBlobType(type: string): boolean {
  const normalized = type.toLowerCase();
  return (
    !normalized ||
    normalized === 'application/octet-stream' ||
    normalized === 'binary/octet-stream'
  );
}

function resolveBlobContentType(
  blob: Blob,
  responseContentType: string | null,
  metadataMimetype: string | null,
): string {
  const fromResponse = responseContentType?.split(';')[0]?.trim() ?? '';
  if (fromResponse && !isGenericBlobType(fromResponse)) {
    return fromResponse;
  }
  if (metadataMimetype && !isGenericBlobType(metadataMimetype)) {
    return metadataMimetype;
  }
  if (blob.type && !isGenericBlobType(blob.type)) {
    return blob.type;
  }
  return fromResponse || metadataMimetype || blob.type || 'application/octet-stream';
}

interface InitialMediaState {
  objectUrl: string | null;
  isLoading: boolean;
  holdsCache: boolean;
}

function readInitialMediaState(
  conversationId: string,
  messageId: string,
  enabled: boolean,
  localPreviewUrl: string | null,
): InitialMediaState {
  if (localPreviewUrl) {
    return {
      objectUrl: localPreviewUrl,
      isLoading: false,
      holdsCache: false,
    };
  }
  if (!enabled) {
    return { objectUrl: null, isLoading: false, holdsCache: false };
  }
  const cached = acquireWhatsappMediaBlobCache(conversationId, messageId);
  if (cached) {
    return {
      objectUrl: cached.objectUrl,
      isLoading: false,
      holdsCache: true,
    };
  }
  return { objectUrl: null, isLoading: true, holdsCache: false };
}

export function useWhatsappMessageMediaBlob(
  conversationId: string,
  message: WhatsappMessage,
  options: { enabled?: boolean; localPreviewUrl?: string | null } = {},
) {
  const enabled = options.enabled !== false;
  const localPreviewUrl = options.localPreviewUrl ?? null;
  const metadataMimetype = readMetadataMimetype(message);
  const isVideo = isVideoMessage(message, metadataMimetype);
  const isHeavyMedia =
    isVideo ||
    (message.messageType?.toLowerCase() ?? '') === 'voice' ||
    (message.messageType?.toLowerCase() ?? '') === 'audio' ||
    (message.messageType?.toLowerCase() ?? '') === 'ptt' ||
    Boolean(metadataMimetype?.startsWith('audio/'));
  const maxAutoRetries = isHeavyMedia ? 6 : 3;

  const [initialMedia] = useState(() =>
    readInitialMediaState(
      conversationId,
      message.id,
      enabled,
      localPreviewUrl,
    ),
  );
  const holdsCacheRef = useRef(initialMedia.holdsCache);
  const [objectUrl, setObjectUrl] = useState<string | null>(
    initialMedia.objectUrl,
  );
  const [failed, setFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(initialMedia.isLoading);
  const [retryCount, setRetryCount] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);
  const [confirmedUnavailable, setConfirmedUnavailable] = useState(false);
  const [syncPending, setSyncPending] = useState(false);
  const rateLimitAutoRetriesRef = useRef(0);

  const reportDecodeFailure = useCallback(() => {
    if (holdsCacheRef.current) {
      releaseWhatsappMediaBlobCache(conversationId, message.id);
      holdsCacheRef.current = false;
    }
    setObjectUrl(null);
    setFailed(true);
    setIsLoading(false);
  }, [conversationId, message.id]);

  const retry = useCallback(() => {
    if (holdsCacheRef.current) {
      releaseWhatsappMediaBlobCache(conversationId, message.id);
      holdsCacheRef.current = false;
    }
    setObjectUrl(localPreviewUrl);
    setFailed(false);
    setRateLimited(false);
    setConfirmedUnavailable(false);
    setSyncPending(false);
    rateLimitAutoRetriesRef.current = 0;
    setIsLoading(!localPreviewUrl);
    setRetryCount((value) => value + 1);
  }, [conversationId, localPreviewUrl, message.id]);

  useEffect(() => {
    rateLimitAutoRetriesRef.current = 0;
  }, [conversationId, message.id]);

  useEffect(() => {
    if (!enabled || localPreviewUrl || objectUrl) {
      return;
    }

    let active = true;
    let retryTimer: number | undefined;

    const load = async (): Promise<void> => {
      let inflightPromise = getWhatsappMediaInflight(
        conversationId,
        message.id,
      );
      if (!inflightPromise) {
        inflightPromise = runWhatsappMediaFetchPool(isVideo, async () => {
          const { blob, contentType } =
            await whatsappInboxService.fetchMessageMedia(
              conversationId,
              message.id,
            );
          const resolvedType = resolveBlobContentType(
            blob,
            contentType,
            metadataMimetype,
          );
          const typedBlob =
            resolvedType && blob.type !== resolvedType
              ? new Blob([blob], { type: resolvedType })
              : blob;
          return storeWhatsappMediaBlobCache(
            conversationId,
            message.id,
            typedBlob,
            resolvedType,
          );
        });
        setWhatsappMediaInflight(conversationId, message.id, inflightPromise);
      }

      try {
        await inflightPromise;
        if (!active) {
          return;
        }
        const acquired = acquireWhatsappMediaBlobCache(
          conversationId,
          message.id,
        );
        if (!acquired) {
          setFailed(true);
          setIsLoading(false);
          return;
        }
        holdsCacheRef.current = true;
        setObjectUrl(acquired.objectUrl);
        setIsLoading(false);
        setFailed(false);
      } catch (error: unknown) {
        if (!active) {
          return;
        }
        if (
          error instanceof ApiError &&
          retriableMediaStatus(error.status) &&
          rateLimitAutoRetriesRef.current < maxAutoRetries
        ) {
          rateLimitAutoRetriesRef.current += 1;
          setRateLimited(true);
          const delayMs = isHeavyMedia
            ? 2000 * 2 ** (rateLimitAutoRetriesRef.current - 1)
            : 2000;
          retryTimer = window.setTimeout(() => {
            if (active) {
              setIsLoading(true);
              setFailed(false);
              setRetryCount((value) => value + 1);
            }
          }, delayMs);
          return;
        }
        if (isConfirmedUnavailableMediaError(error)) {
          setConfirmedUnavailable(true);
        }
        if (isMediaSyncPendingError(error)) {
          setSyncPending(true);
          if (rateLimitAutoRetriesRef.current < maxAutoRetries) {
            rateLimitAutoRetriesRef.current += 1;
            const delayMs = isHeavyMedia
              ? 5000 * rateLimitAutoRetriesRef.current
              : 3000;
            retryTimer = window.setTimeout(() => {
              if (active) {
                setIsLoading(true);
                setFailed(false);
                setRetryCount((value) => value + 1);
              }
            }, delayMs);
            return;
          }
        }
        setFailed(true);
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }
      if (holdsCacheRef.current) {
        releaseWhatsappMediaBlobCache(conversationId, message.id);
        holdsCacheRef.current = false;
      }
    };
  }, [
    conversationId,
    message.id,
    metadataMimetype,
    retryCount,
    isHeavyMedia,
    maxAutoRetries,
    enabled,
    localPreviewUrl,
    isVideo,
    objectUrl,
  ]);

  const resolvedObjectUrl = localPreviewUrl ?? objectUrl;
  const resolvedLoading = localPreviewUrl ? false : isLoading;

  return {
    objectUrl: resolvedObjectUrl,
    failed: localPreviewUrl ? false : failed,
    isLoading: resolvedLoading,
    rateLimited,
    confirmedUnavailable,
    syncPending,
    retry,
    reportDecodeFailure,
  };
}
