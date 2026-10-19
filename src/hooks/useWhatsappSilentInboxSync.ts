'use client';

import { useEffect, useRef } from 'react';
import { whatsappInboxService } from '@/lib/api/services/whatsapp-inbox.service';
import { WHATSAPP_INBOX_SILENT_SYNC_MS } from '@/lib/inbox/whatsapp-inbox-sync';

type UseWhatsappSilentInboxSyncOptions = {
  enabled?: boolean;
  onSynced?: () => void;
};

/**
 * Periodically asks the backend to pull recent WhatsApp history from OpenWA, then refreshes UI data.
 * No toasts or banners — intended for background keep-in-sync while the inbox is visible.
 */
export function useWhatsappSilentInboxSync(
  senderConnectionId: string | null,
  activeConversationId: string | null,
  options: UseWhatsappSilentInboxSyncOptions = {},
) {
  const { enabled = true, onSynced } = options;
  const onSyncedRef = useRef(onSynced);

  useEffect(() => {
    onSyncedRef.current = onSynced;
  }, [onSynced]);

  useEffect(() => {
    if (!enabled || !senderConnectionId) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (cancelled || document.visibilityState === 'hidden') {
        return;
      }
      try {
        await whatsappInboxService.syncSender(
          senderConnectionId,
          activeConversationId,
        );
        onSyncedRef.current?.();
      } catch {
        // Silent — list/message polling still runs on its own interval.
      }
    };

    const intervalId = window.setInterval(() => {
      void run();
    }, WHATSAPP_INBOX_SILENT_SYNC_MS);

    const initialDelayId = window.setTimeout(() => {
      void run();
    }, 4000);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void run();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.clearTimeout(initialDelayId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [activeConversationId, enabled, senderConnectionId]);
}
