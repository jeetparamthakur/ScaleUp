'use client';

import { useCallback } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { invalidateQuery } from '@/hooks/api/query-cache';
import { whatsappSenderConnectionsService } from '@/lib/api/services/whatsapp-sender-connections.service';
import type {
  WhatsappSenderConnection,
  WhatsappSenderQrState,
} from '@/lib/whatsapp/connections/types';

const LIST_QUERY_KEY = 'whatsapp.connections';

interface WhatsappQueryPollOptions {
  refetchIntervalMs?: number;
  enabled?: boolean;
}

export function useWhatsappModuleAvailability() {
  return useApiQuery('whatsapp.availability', () =>
    whatsappSenderConnectionsService.getAvailability(),
  );
}

export function useWhatsappSenderConnections(
  options: WhatsappQueryPollOptions = {},
) {
  const { refetchIntervalMs, enabled = true } = options;
  return useApiQuery(
    LIST_QUERY_KEY,
    () => whatsappSenderConnectionsService.listConnections(),
    { enabled, refetchIntervalMs },
  );
}

export function useWhatsappSenderConnection(
  connectionId: string | null,
  options: WhatsappQueryPollOptions = {},
) {
  const { refetchIntervalMs, enabled: enabledOption = true } = options;
  const enabled = enabledOption && Boolean(connectionId);
  const queryKey = `whatsapp.connection.${connectionId ?? 'none'}`;

  return useApiQuery(
    queryKey,
    () => whatsappSenderConnectionsService.getConnection(connectionId!),
    { enabled, refetchIntervalMs },
  );
}

export function useWhatsappSenderQr(
  connectionId: string | null,
  enabled: boolean,
) {
  const pollEnabled = enabled && Boolean(connectionId);
  const queryKey = `whatsapp.connection.qr.${connectionId ?? 'none'}`;

  return useApiQuery(
    queryKey,
    () => whatsappSenderConnectionsService.getQr(connectionId!),
    { enabled: pollEnabled, refetchIntervalMs: pollEnabled ? 1000 : undefined },
  );
}

export function useCreateWhatsappSenderConnection() {
  const { mutate, isLoading, error, reset } = useApiMutation<
    { displayName?: string } | undefined,
    WhatsappSenderConnection
  >(async (input) =>
    whatsappSenderConnectionsService.createConnection(input),
  );

  const createConnection = useCallback(
    async (displayName?: string) => {
      const result = await mutate(displayName ? { displayName } : undefined);
      invalidateQuery(LIST_QUERY_KEY);
      return result;
    },
    [mutate],
  );

  return { createConnection, isCreating: isLoading, error, reset };
}

export function useDisconnectWhatsappSenderConnection() {
  const { mutate, isLoading, error, reset } = useApiMutation<
    string,
    { deleted: true }
  >(async (connectionId) =>
    whatsappSenderConnectionsService.disconnect(connectionId),
  );

  const disconnect = useCallback(
    async (connectionId: string) => {
      const result = await mutate(connectionId);
      invalidateQuery(LIST_QUERY_KEY);
      invalidateQuery(`whatsapp.connection.${connectionId}`);
      invalidateQuery(`whatsapp.connection.qr.${connectionId}`);
      return result;
    },
    [mutate],
  );

  return { disconnect, isDisconnecting: isLoading, error, reset };
}

export type { WhatsappSenderQrState };
