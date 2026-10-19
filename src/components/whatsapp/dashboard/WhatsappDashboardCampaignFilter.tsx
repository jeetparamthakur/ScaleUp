'use client';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useMemo } from 'react';
import { formatWhatsappCampaignStatusLabel } from '@/lib/whatsapp/dashboard/chart-labels';
import type { WhatsappDashboardCampaignRow } from '@/lib/whatsapp/dashboard/types';

export const WHATSAPP_DASHBOARD_ALL_CAMPAIGNS_ID = '';

export interface WhatsappDashboardCampaignOption {
  id: string;
  name: string;
  statusLabel: string;
}

interface WhatsappDashboardCampaignFilterProps {
  campaigns: WhatsappDashboardCampaignRow[];
  value: string;
  onChange: (campaignId: string) => void;
  disabled?: boolean;
}

function buildOptions(
  campaigns: WhatsappDashboardCampaignRow[],
): WhatsappDashboardCampaignOption[] {
  const allOption: WhatsappDashboardCampaignOption = {
    id: WHATSAPP_DASHBOARD_ALL_CAMPAIGNS_ID,
    name: 'All campaigns',
    statusLabel: '',
  };

  const campaignOptions = campaigns.map((row) => ({
    id: row.id,
    name: row.name,
    statusLabel: formatWhatsappCampaignStatusLabel(row.status),
  }));

  return [allOption, ...campaignOptions];
}

export default function WhatsappDashboardCampaignFilter({
  campaigns,
  value,
  onChange,
  disabled = false,
}: WhatsappDashboardCampaignFilterProps) {
  const options = useMemo(() => buildOptions(campaigns), [campaigns]);

  const selected =
    options.find((option) => option.id === value) ?? options[0] ?? null;

  return (
    <Autocomplete
      size="small"
      disabled={disabled}
      options={options}
      value={selected}
      onChange={(_event, option) => {
        onChange(option?.id ?? WHATSAPP_DASHBOARD_ALL_CAMPAIGNS_ID);
      }}
      getOptionLabel={(option) =>
        option.id === WHATSAPP_DASHBOARD_ALL_CAMPAIGNS_ID
          ? option.name
          : `${option.name} (${option.statusLabel})`
      }
      isOptionEqualToValue={(left, right) => left.id === right.id}
      filterOptions={(items, state) => {
        const query = state.inputValue.trim().toLowerCase();
        if (!query) {
          return items;
        }
        return items.filter((item) => {
          if (item.id === WHATSAPP_DASHBOARD_ALL_CAMPAIGNS_ID) {
            return 'all campaigns'.includes(query);
          }
          return (
            item.name.toLowerCase().includes(query) ||
            item.statusLabel.toLowerCase().includes(query)
          );
        });
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Campaign"
          placeholder="Search campaigns"
          slotProps={{
            ...params.slotProps,
            inputLabel: { shrink: true },
          }}
        />
      )}
      className="w-full min-w-[11rem] sm:w-auto sm:max-w-[16rem] shrink-0"
      disableClearable
    />
  );
}
