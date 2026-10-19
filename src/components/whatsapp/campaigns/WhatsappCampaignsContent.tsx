'use client';

import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import DataTable from '@/components/data-table/DataTable';
import { useWhatsappCampaigns } from '@/hooks/useWhatsappCampaigns';
import { useOrgPath } from '@/hooks/useOrgPath';
import type { WhatsappCampaignStatus } from '@/lib/whatsapp/campaigns/types';

function statusColor(
  status: WhatsappCampaignStatus,
): 'default' | 'success' | 'warning' | 'info' {
  if (status === 'completed') {
    return 'success';
  }
  if (status === 'sending' || status === 'scheduled') {
    return 'info';
  }
  if (status === 'stopped') {
    return 'warning';
  }
  return 'default';
}

export interface WhatsappCampaignTableRow {
  id: string;
  name: string;
  status: WhatsappCampaignStatus;
  sent: number;
  replied: number;
  failed: number;
  pending: number;
}

interface WhatsappCampaignsContentProps {
  onCreateCampaign?: () => void;
}

export default function WhatsappCampaignsContent({
  onCreateCampaign,
}: WhatsappCampaignsContentProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { data: campaigns, isLoading } = useWhatsappCampaigns();

  const rows = useMemo<WhatsappCampaignTableRow[]>(
    () =>
      (campaigns ?? []).map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        sent: campaign.progress.sent,
        replied: campaign.progress.replied,
        failed: campaign.progress.failed,
        pending: campaign.progress.pending,
      })),
    [campaigns],
  );

  return (
    <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
      <CardContent className="p-0 md:p-2">
        {!isLoading && rows.length === 0 ? (
          <Box className="px-6 py-14 text-center">
            <Typography variant="h6" className="font-bold">
              No campaigns yet
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-2">
              Create a broadcast to your WhatsApp contact lists. Replies are tracked
              per campaign so those contacts are not messaged again in the same
              campaign.
            </Typography>
            {onCreateCampaign ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                className="mt-6 rounded-2xl px-5 shadow-primary-soft"
                onClick={onCreateCampaign}
              >
                Create campaign
              </Button>
            ) : null}
          </Box>
        ) : (
          <DataTable<WhatsappCampaignTableRow>
            tableId="whatsapp-campaigns"
            rows={rows}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            includeFields={[
              'name',
              'status',
              'sent',
              'replied',
              'failed',
              'pending',
            ]}
            searchPlaceholder="Search campaigns..."
            emptyMessage="No campaigns yet."
            noResultsMessage="No campaigns match your search."
            onRowClick={(row) =>
              router.push(toOrgPath(`/whatsapp/campaigns/${row.id}`))
            }
            columnOverrides={{
              name: {
                label: 'Campaign',
                render: (row) => (
                  <Typography variant="body2" className="font-semibold">
                    {row.name}
                  </Typography>
                ),
              },
              status: {
                render: (row) => (
                  <Chip
                    size="small"
                    label={row.status.replace(/_/g, ' ')}
                    color={statusColor(row.status)}
                    variant="outlined"
                  />
                ),
                filterValue: (row) => row.status.replace(/_/g, ' '),
              },
              sent: { align: 'right' },
              replied: { align: 'right' },
              failed: { align: 'right' },
              pending: { align: 'right' },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
