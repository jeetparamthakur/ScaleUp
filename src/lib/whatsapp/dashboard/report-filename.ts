import type { WhatsappDashboardReportFormat } from '@/lib/whatsapp/dashboard/types';

function sanitizeFilenameSegment(value: string): string {
  const base = value.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  return base || 'report';
}

export function buildWhatsappDashboardReportFilename(
  dateFrom: string,
  dateTo: string,
  campaignScopeLabel: string,
  format: WhatsappDashboardReportFormat,
): string {
  const scope =
    campaignScopeLabel === 'All campaigns'
      ? 'all-campaigns'
      : sanitizeFilenameSegment(campaignScopeLabel);
  const extension = format === 'csv' ? 'csv' : 'pdf';
  return `whatsapp-dashboard-${dateFrom}-to-${dateTo}-${scope}.${extension}`;
}
