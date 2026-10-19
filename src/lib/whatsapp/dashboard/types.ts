import type { WhatsappCampaignStatus } from '@/lib/whatsapp/campaigns/types';
import type { WhatsappSenderConnectionStatus } from '@/lib/whatsapp/connections/types';

export interface WhatsappDashboardSummary {
  messagesSent: number;
  replies: number;
  campaignsRunning: number;
  campaignsScheduled: number;
  campaignsCompleted: number;
  campaignsDraft: number;
  campaignsStopped: number;
  sendersReady: number;
  sendersTotal: number;
}

export interface WhatsappDashboardStatusSlice {
  status: string;
  count: number;
}

export interface WhatsappDashboardDailyTrendPoint {
  date: string;
  messagesSent: number;
  replies: number;
}

export interface WhatsappDashboardCampaignRow {
  id: string;
  name: string;
  status: WhatsappCampaignStatus;
  messagesSent: number;
  replies: number;
  recipientsSent: number;
}

export interface WhatsappDashboardSenderRow {
  id: string;
  label: string;
  status: WhatsappSenderConnectionStatus;
  messagesSent: number;
  sendsTodayCount: number;
  dailySendLimit: number | null;
  remainingDailyCapacity: number | null;
}

export interface WhatsappDashboardResponse {
  summary: WhatsappDashboardSummary;
  campaignStatusSlices: WhatsappDashboardStatusSlice[];
  dailySendTrend: WhatsappDashboardDailyTrendPoint[];
  campaigns: WhatsappDashboardCampaignRow[];
  senders: WhatsappDashboardSenderRow[];
  dateFrom: string;
  dateTo: string;
}

export interface WhatsappDashboardQuery {
  dateFrom: string;
  dateTo: string;
  campaignId?: string;
}

export type WhatsappDashboardReportFormat = 'csv' | 'pdf';
