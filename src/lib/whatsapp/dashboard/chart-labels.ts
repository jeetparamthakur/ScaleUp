import type { WhatsappCampaignStatus } from '@/lib/whatsapp/campaigns/types';

const CAMPAIGN_STATUS_LABELS: Record<WhatsappCampaignStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  sending: 'Running',
  completed: 'Completed',
  stopped: 'Stopped',
};

const CAMPAIGN_STATUS_COLORS: Record<WhatsappCampaignStatus, string> = {
  draft: '#94A3B8',
  scheduled: '#0EA5E9',
  sending: '#10B981',
  completed: '#059669',
  stopped: '#F59E0B',
};

export function formatWhatsappCampaignStatusLabel(status: string): string {
  if (status in CAMPAIGN_STATUS_LABELS) {
    return CAMPAIGN_STATUS_LABELS[status as WhatsappCampaignStatus];
  }
  return status;
}

export function getWhatsappCampaignStatusColor(status: string): string {
  if (status in CAMPAIGN_STATUS_COLORS) {
    return CAMPAIGN_STATUS_COLORS[status as WhatsappCampaignStatus];
  }
  return '#64748B';
}

export function formatDashboardCount(value: number): string {
  return value.toLocaleString();
}

export function formatTrendDateLabel(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00.000Z`);
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
