import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  WhatsappDashboardQuery,
  WhatsappDashboardReportFormat,
  WhatsappDashboardResponse,
} from '@/lib/whatsapp/dashboard/types';

function buildDashboardQueryParams(
  query: WhatsappDashboardQuery,
  format?: WhatsappDashboardReportFormat,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('dateFrom', query.dateFrom);
  params.set('dateTo', query.dateTo);
  if (query.campaignId) {
    params.set('campaignId', query.campaignId);
  }
  if (format) {
    params.set('format', format);
  }
  return params;
}

export const whatsappDashboardService = {
  get(query: WhatsappDashboardQuery) {
    const params = buildDashboardQueryParams(query);
    return apiClient.get<WhatsappDashboardResponse>(
      `${ENDPOINTS.whatsappCampaigns.dashboard}?${params.toString()}`,
    );
  },

  downloadReport(
    query: WhatsappDashboardQuery,
    format: WhatsappDashboardReportFormat,
    filename: string,
  ) {
    const params = buildDashboardQueryParams(query, format);
    return apiClient.download(
      `${ENDPOINTS.whatsappCampaigns.dashboardExport}?${params.toString()}`,
      filename,
    );
  },
};
