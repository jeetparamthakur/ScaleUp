'use client';

import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import AddWhatsappCampaignRecipientsDialog from '@/components/whatsapp/campaigns/detail/AddWhatsappCampaignRecipientsDialog';
import { useAddWhatsappCampaignRecipients } from '@/hooks/useAddWhatsappCampaignRecipients';
import { useCanWhatsappImportFromCrm } from '@/hooks/useCanWhatsappImportFromCrm';
import {
  useWhatsappCampaign,
  useWhatsappCampaignRecipients,
} from '@/hooks/useWhatsappCampaigns';
import type {
  WhatsappCampaignDetail,
  WhatsappCampaignRecipientStatus,
} from '@/lib/whatsapp/campaigns/types';

const STATUS_OPTIONS: Array<WhatsappCampaignRecipientStatus | ''> = [
  '',
  'pending',
  'sent',
  'replied',
  'failed',
  'skipped',
];

function formatRecipientName(
  firstName: string | null,
  lastName: string | null,
  company: string | null,
  phone: string,
): string {
  const parts = [firstName, lastName].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(' ');
  }
  return company ?? phone;
}

interface WhatsappCampaignRecipientsTabProps {
  campaign: WhatsappCampaignDetail;
}

export default function WhatsappCampaignRecipientsTab({
  campaign,
}: WhatsappCampaignRecipientsTabProps) {
  const campaignId = campaign.id;
  const canAddRecipients =
    campaign.status === 'scheduled' || campaign.status === 'sending';
  const showCrmTab = useCanWhatsappImportFromCrm();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<WhatsappCampaignRecipientStatus | ''>('');
  const [page, setPage] = useState(1);
  const limit = 25;

  const recipientsQuery = useMemo(
    () => ({
      search,
      status: status || undefined,
      page,
      limit,
    }),
    [search, status, page],
  );

  const { data, isLoading, refetch: refetchRecipients } =
    useWhatsappCampaignRecipients(campaignId, recipientsQuery);
  const { refetch: refetchCampaign } = useWhatsappCampaign(campaignId);

  const refreshRecipients = async () => {
    await Promise.all([refetchRecipients(), refetchCampaign()]);
  };

  const { addRecipients, isAdding } = useAddWhatsappCampaignRecipients({
    onSuccess: refreshRecipients,
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Stack spacing={2}>
      {canAddRecipients ? (
        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<PersonAddOutlinedIcon />}
            onClick={() => setIsAddDialogOpen(true)}
            className="rounded-xl"
          >
            Add contacts
          </Button>
        </Stack>
      ) : null}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          size="small"
          label="Search recipients"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="min-w-[220px] flex-1"
        />
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as WhatsappCampaignRecipientStatus | '');
            setPage(1);
          }}
          className="min-w-[160px]"
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option || 'all'} value={option}>
              {option ? option : 'All statuses'}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Box className="surface-panel overflow-hidden rounded-2xl">
        {isLoading ? (
          <Stack className="items-center py-12">
            <CircularProgress size={24} />
          </Stack>
        ) : (
          <TableContainer>
            <Table aria-label="Campaign recipients">
              <TableHead>
                <TableRow>
                  <TableCell className="font-semibold">Contact</TableCell>
                  <TableCell className="font-semibold">Phone</TableCell>
                  <TableCell className="font-semibold">Status</TableCell>
                  <TableCell className="font-semibold">Sent</TableCell>
                  <TableCell className="font-semibold">Replied</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.items ?? []).map((recipient) => (
                  <TableRow key={recipient.id} hover>
                    <TableCell>
                      {formatRecipientName(
                        recipient.firstName,
                        recipient.lastName,
                        recipient.company,
                        recipient.phoneE164,
                      )}
                    </TableCell>
                    <TableCell>{recipient.phoneE164}</TableCell>
                    <TableCell>
                      <Chip size="small" label={recipient.status} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {recipient.sentAt
                        ? new Date(recipient.sentAt).toLocaleString()
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {recipient.repliedAt
                        ? new Date(recipient.repliedAt).toLocaleString()
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Page {page} of {totalPages} ({total} recipients)
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip
            label="Previous"
            clickable
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          />
          <Chip
            label="Next"
            clickable
            disabled={page >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          />
        </Stack>
      </Stack>

      <AddWhatsappCampaignRecipientsDialog
        open={isAddDialogOpen}
        campaignId={campaignId}
        showCrmTab={showCrmTab}
        onClose={() => setIsAddDialogOpen(false)}
        isSubmitting={isAdding}
        onSubmit={async (input) => {
          await addRecipients(campaignId, input);
        }}
      />
    </Stack>
  );
}
