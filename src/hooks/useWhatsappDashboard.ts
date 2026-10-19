'use client';

import { useApiQuery } from '@/hooks/api';
import { whatsappDashboardService } from '@/lib/api/services/whatsapp-dashboard.service';
import type { WhatsappDashboardQuery } from '@/lib/whatsapp/dashboard/types';
import { getDefaultWhatsappDashboardDateRange } from '@/lib/whatsapp/dashboard/date-range';

function resolveQuery(
  query: Partial<WhatsappDashboardQuery> | undefined,
): WhatsappDashboardQuery {
  const defaults = getDefaultWhatsappDashboardDateRange();
  return {
    dateFrom: query?.dateFrom ?? defaults.dateFrom,
    dateTo: query?.dateTo ?? defaults.dateTo,
    campaignId: query?.campaignId,
  };
}

export function useWhatsappDashboard(query?: Partial<WhatsappDashboardQuery>) {
  const resolved = resolveQuery(query);
  const campaignKey = resolved.campaignId ?? 'all';

  return useApiQuery(
    `whatsapp.dashboard.${resolved.dateFrom}.${resolved.dateTo}.${campaignKey}`,
    () => whatsappDashboardService.get(resolved),
    { refetchIntervalMs: 30000 },
  );
}
