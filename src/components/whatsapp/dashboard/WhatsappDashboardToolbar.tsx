'use client';

import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { DateRangePicker, type DateRangeValue } from '@/components/ui/inputs';
import WhatsappDashboardCampaignFilter, {
  WHATSAPP_DASHBOARD_ALL_CAMPAIGNS_ID,
} from '@/components/whatsapp/dashboard/WhatsappDashboardCampaignFilter';
import {
  clampWhatsappDashboardDateRange,
  formatWhatsappDashboardDateRangeLabel,
} from '@/lib/whatsapp/dashboard/date-range';
import type { WhatsappDashboardCampaignRow } from '@/lib/whatsapp/dashboard/types';

interface WhatsappDashboardToolbarProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  campaigns: WhatsappDashboardCampaignRow[];
  campaignFilter: string;
  onCampaignFilterChange: (campaignId: string) => void;
  onDownloadClick: () => void;
  disabled?: boolean;
}

export default function WhatsappDashboardToolbar({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  campaigns,
  campaignFilter,
  onCampaignFilterChange,
  onDownloadClick,
  disabled = false,
}: WhatsappDashboardToolbarProps) {
  const [incompleteRange, setIncompleteRange] = useState<DateRangeValue | null>(
    null,
  );

  const pickerValue = incompleteRange ?? { from: dateFrom, to: dateTo };

  function applyDateRange(next: DateRangeValue) {
    if (!next.from && !next.to) {
      setIncompleteRange(null);
      return;
    }

    if (!next.from || !next.to) {
      setIncompleteRange({ from: next.from, to: next.to });
      return;
    }

    setIncompleteRange(null);
    const clamped = clampWhatsappDashboardDateRange({
      dateFrom: next.from,
      dateTo: next.to,
    });
    onDateFromChange(clamped.dateFrom);
    onDateToChange(clamped.dateTo);
  }

  return (
    <Box className="surface-panel overflow-hidden rounded-xl border border-surface">
      <Box className="px-4 py-4 md:px-5 md:py-4">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          className="items-start justify-between gap-3 sm:items-center"
        >
          <Box className="min-w-0">
            <Typography
              variant="h4"
              component="h1"
              className="text-xl font-semibold tracking-tight text-foreground md:text-[1.35rem]"
            >
              WhatsApp dashboard
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              className="mt-0.5 max-w-xl leading-snug"
            >
              Campaign performance, reply trends, and sender capacity.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadOutlinedIcon fontSize="small" />}
            onClick={onDownloadClick}
            disabled={disabled}
            className="w-full shrink-0 rounded-xl px-3.5 py-1.5 normal-case shadow-none sm:w-auto"
          >
            Download report
          </Button>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          className="mt-4 items-stretch gap-3 border-t border-[color:var(--surface-border)] pt-4 sm:items-end sm:justify-end"
          component="section"
          aria-label="Dashboard filters"
        >
          <DateRangePicker
            id="whatsapp-dashboard-date-range"
            label="Reporting period"
            value={pickerValue}
            onChange={applyDateRange}
            formatLabel={(value) =>
              formatWhatsappDashboardDateRangeLabel(value.from, value.to)
            }
            disabled={disabled}
            className="w-full sm:max-w-[17rem]"
          />

          <WhatsappDashboardCampaignFilter
            campaigns={campaigns}
            value={campaignFilter}
            onChange={onCampaignFilterChange}
            disabled={disabled}
          />
        </Stack>
      </Box>
    </Box>
  );
}

export { WHATSAPP_DASHBOARD_ALL_CAMPAIGNS_ID };
