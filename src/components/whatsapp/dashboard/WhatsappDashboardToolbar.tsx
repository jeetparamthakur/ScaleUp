'use client';

import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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

  const rangeLabel = formatWhatsappDashboardDateRangeLabel(dateFrom, dateTo);

  return (
    <Box className="dashboard-hero surface-panel overflow-hidden rounded-2xl">
      <Box className="p-6 md:p-8">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          className="items-start justify-between"
        >
          <Box className="min-w-0 max-w-2xl">
            <Chip
              label="WhatsApp"
              size="small"
              className="h-6 rounded-lg border-0 bg-primary-soft font-semibold text-primary"
            />
            <Typography
              variant="h3"
              component="h1"
              className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl"
            >
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" className="mt-2">
              Campaign performance, reply trends, and sender capacity in one place.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<DownloadOutlinedIcon />}
            onClick={onDownloadClick}
            disabled={disabled}
            className="w-full shrink-0 rounded-2xl px-5 shadow-primary-soft md:w-auto"
          >
            Download report
          </Button>
        </Stack>
      </Box>

      <Box
        className="border-t border-[color:var(--surface-border)] bg-surface-muted px-6 py-4 md:px-8 md:py-5"
        component="section"
        aria-label="Dashboard filters"
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2.5}
          className="items-start justify-between gap-4"
        >
          <Stack direction="row" spacing={1.25} className="items-center pt-0.5">
            <Box
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"
              aria-hidden
            >
              <CalendarMonthOutlinedIcon fontSize="small" />
            </Box>
            <Box className="min-w-0">
              <Typography variant="subtitle2" className="font-semibold leading-tight">
                Reporting period
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-0.5">
                {rangeLabel}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            className="w-full flex-wrap items-stretch sm:items-end lg:w-auto lg:justify-end"
          >
            <DateRangePicker
              id="whatsapp-dashboard-date-range"
              value={pickerValue}
              onChange={applyDateRange}
              formatLabel={(value) =>
                formatWhatsappDashboardDateRangeLabel(value.from, value.to)
              }
              disabled={disabled}
            />

            <WhatsappDashboardCampaignFilter
              campaigns={campaigns}
              value={campaignFilter}
              onChange={onCampaignFilterChange}
              disabled={disabled}
            />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export { WHATSAPP_DASHBOARD_ALL_CAMPAIGNS_ID };
