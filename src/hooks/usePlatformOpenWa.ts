'use client';

import { useCallback, useMemo, useState } from 'react';
import { useApiMutation, useApiQuery } from '@/hooks/api';
import { platformOpenWaService } from '@/lib/api/services/whatsapp-inbox.service';
import type { PlatformOpenWaSettings } from '@/lib/inbox/whatsapp-types';

export function usePlatformOpenWa() {
  const query = useApiQuery('platform.openwa', () =>
    platformOpenWaService.getSettings(),
  );

  const [draft, setDraft] = useState<{
    baseUrl: string;
    enabled: boolean;
    apiKey: string;
  } | null>(null);

  const { mutate: saveMutate, isLoading: isSaving } = useApiMutation(
    (input: { baseUrl?: string; enabled?: boolean; apiKey?: string }) =>
      platformOpenWaService.updateSettings(input),
  );

  const { mutate: testMutate, isLoading: isTesting } = useApiMutation<
    void,
    { ok: true }
  >(async () => platformOpenWaService.testConnection());

  const display = useMemo(
    () =>
      draft ?? {
        baseUrl: query.data?.baseUrl ?? '',
        enabled: query.data?.enabled ?? false,
        apiKey: '',
      },
    [draft, query.data?.baseUrl, query.data?.enabled],
  );

  const save = useCallback(async () => {
    const payload: {
      baseUrl?: string;
      enabled?: boolean;
      apiKey?: string;
    } = {
      baseUrl: display.baseUrl.trim(),
      enabled: display.enabled,
    };

    if (display.apiKey.trim()) {
      payload.apiKey = display.apiKey.trim();
    }

    const result = await saveMutate(payload);
    setDraft(null);
    await query.refetch();
    return result;
  }, [display, query, saveMutate]);

  const testConnection = useCallback(async () => {
    await save();
    return testMutate(undefined);
  }, [save, testMutate]);

  return {
    settings: query.data as PlatformOpenWaSettings | undefined,
    isLoading: query.isLoading,
    error: query.error,
    display,
    setDraft,
    save,
    isSaving,
    testConnection,
    isTesting,
  };
}
