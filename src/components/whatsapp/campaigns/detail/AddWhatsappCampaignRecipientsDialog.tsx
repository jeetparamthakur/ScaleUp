'use client';

import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import { useMemo, useState } from 'react';
import WhatsappCrmProspectPicker from '@/components/whatsapp/contacts/crm/WhatsappCrmProspectPicker';
import { useWhatsappCampaignAddableMembers } from '@/hooks/useWhatsappCampaigns';
import type { AddWhatsappCampaignRecipientsInput } from '@/lib/whatsapp/campaigns/types';

type AddRecipientsTab = 'manual' | 'list' | 'crm';

interface ManualRow {
  phone: string;
  firstName: string;
  lastName: string;
  company: string;
}

const EMPTY_MANUAL_ROW: ManualRow = {
  phone: '',
  firstName: '',
  lastName: '',
  company: '',
};

function formatMemberLabel(
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

interface AddWhatsappCampaignRecipientsDialogProps {
  open: boolean;
  campaignId: string;
  showCrmTab: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (input: AddWhatsappCampaignRecipientsInput) => Promise<void>;
}

export default function AddWhatsappCampaignRecipientsDialog({
  open,
  campaignId,
  showCrmTab,
  onClose,
  isSubmitting,
  onSubmit,
}: AddWhatsappCampaignRecipientsDialogProps) {
  const [tab, setTab] = useState<AddRecipientsTab>('manual');
  const [manualRows, setManualRows] = useState<ManualRow[]>([{ ...EMPTY_MANUAL_ROW }]);
  const [listSearch, setListSearch] = useState('');
  const [listPage, setListPage] = useState(1);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedProspectIds, setSelectedProspectIds] = useState<Set<string>>(
    new Set(),
  );

  const listLimit = 25;
  const addableQuery = useMemo(
    () => ({
      search: listSearch,
      page: listPage,
      limit: listLimit,
    }),
    [listSearch, listPage],
  );

  const { data: addablePage, isLoading: isLoadingAddable } =
    useWhatsappCampaignAddableMembers(campaignId, addableQuery, {
      enabled: open && tab === 'list',
    });

  const listTotal = addablePage?.total ?? 0;
  const listTotalPages = Math.max(1, Math.ceil(listTotal / listLimit));

  function resetState() {
    setTab('manual');
    setManualRows([{ ...EMPTY_MANUAL_ROW }]);
    setListSearch('');
    setListPage(1);
    setSelectedMemberIds(new Set());
    setSelectedProspectIds(new Set());
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }
    resetState();
    onClose();
  }

  const manualPayload = manualRows
    .map((row) => ({
      phone: row.phone.trim(),
      firstName: row.firstName.trim() || undefined,
      lastName: row.lastName.trim() || undefined,
      company: row.company.trim() || undefined,
    }))
    .filter((row) => row.phone.length > 0);

  const canSubmitManual = tab === 'manual' && manualPayload.length > 0;
  const canSubmitList = tab === 'list' && selectedMemberIds.size > 0;
  const canSubmitCrm = tab === 'crm' && selectedProspectIds.size > 0;
  const canSubmit = canSubmitManual || canSubmitList || canSubmitCrm;

  async function handleSubmit() {
    let payload: AddWhatsappCampaignRecipientsInput;

    if (tab === 'manual') {
      payload = { manual: manualPayload };
    } else if (tab === 'list') {
      payload = { listMemberIds: [...selectedMemberIds] };
    } else {
      payload = { prospectIds: [...selectedProspectIds] };
    }

    try {
      await onSubmit(payload);
      resetState();
      onClose();
    } catch {
      // Keep dialog open for retry.
    }
  }

  function toggleMember(id: string) {
    setSelectedMemberIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pr: 6 }}>Add contacts to campaign</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            Added contacts start at step 1, even if other recipients are already
            on follow-ups. They are also saved on this campaign&apos;s WhatsApp
            contact list when needed.
          </Typography>

          <Tabs
            value={tab}
            onChange={(_, value: AddRecipientsTab) => setTab(value)}
          >
            <Tab value="manual" label="Manual" />
            <Tab value="list" label="From list" />
            {showCrmTab ? <Tab value="crm" label="From CRM" /> : null}
          </Tabs>

          {tab === 'manual' ? (
            <Stack spacing={2}>
              {manualRows.map((row, index) => (
                <Stack
                  key={index}
                  spacing={2}
                  className="rounded-2xl border border-[var(--border-subtle)] p-3"
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="subtitle2" className="flex-1">
                      Contact {index + 1}
                    </Typography>
                    {manualRows.length > 1 ? (
                      <IconButton
                        size="small"
                        aria-label="Remove contact row"
                        onClick={() =>
                          setManualRows((rows) =>
                            rows.filter((_, rowIndex) => rowIndex !== index),
                          )
                        }
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    ) : null}
                  </Stack>
                  <TextField
                    required
                    label="Phone"
                    value={row.phone}
                    onChange={(event) =>
                      setManualRows((rows) =>
                        rows.map((entry, rowIndex) =>
                          rowIndex === index
                            ? { ...entry, phone: event.target.value }
                            : entry,
                        ),
                      )
                    }
                    fullWidth
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="First name"
                      value={row.firstName}
                      onChange={(event) =>
                        setManualRows((rows) =>
                          rows.map((entry, rowIndex) =>
                            rowIndex === index
                              ? { ...entry, firstName: event.target.value }
                              : entry,
                          ),
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Last name"
                      value={row.lastName}
                      onChange={(event) =>
                        setManualRows((rows) =>
                          rows.map((entry, rowIndex) =>
                            rowIndex === index
                              ? { ...entry, lastName: event.target.value }
                              : entry,
                          ),
                        )
                      }
                      fullWidth
                    />
                  </Stack>
                  <TextField
                    label="Company"
                    value={row.company}
                    onChange={(event) =>
                      setManualRows((rows) =>
                        rows.map((entry, rowIndex) =>
                          rowIndex === index
                            ? { ...entry, company: event.target.value }
                            : entry,
                        ),
                      )
                    }
                    fullWidth
                  />
                </Stack>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() =>
                  setManualRows((rows) => [...rows, { ...EMPTY_MANUAL_ROW }])
                }
                className="self-start rounded-xl"
              >
                Add another
              </Button>
            </Stack>
          ) : null}

          {tab === 'list' ? (
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Search contacts"
                value={listSearch}
                onChange={(event) => {
                  setListSearch(event.target.value);
                  setListPage(1);
                }}
                className="max-w-md"
              />
              <Box className="surface-panel overflow-hidden rounded-2xl">
                {isLoadingAddable ? (
                  <Stack className="items-center py-10">
                    <CircularProgress size={24} />
                  </Stack>
                ) : (
                  <TableContainer>
                    <Table size="small" aria-label="Addable list contacts">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox" />
                          <TableCell className="font-semibold">Contact</TableCell>
                          <TableCell className="font-semibold">Phone</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(addablePage?.items ?? []).map((member) => (
                          <TableRow key={member.id} hover>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedMemberIds.has(member.id)}
                                onChange={() => toggleMember(member.id)}
                              />
                            </TableCell>
                            <TableCell>
                              {formatMemberLabel(
                                member.firstName,
                                member.lastName,
                                member.company,
                                member.phone,
                              )}
                            </TableCell>
                            <TableCell>{member.phone}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Page {listPage} of {listTotalPages} ({listTotal} available)
                </Typography>
                <Button
                  size="small"
                  disabled={listPage <= 1}
                  onClick={() => setListPage((page) => Math.max(1, page - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="small"
                  disabled={listPage >= listTotalPages}
                  onClick={() =>
                    setListPage((page) => Math.min(listTotalPages, page + 1))
                  }
                >
                  Next
                </Button>
              </Stack>
            </Stack>
          ) : null}

          {tab === 'crm' && showCrmTab ? (
            <WhatsappCrmProspectPicker
              selectedIds={selectedProspectIds}
              onSelectedIdsChange={setSelectedProspectIds}
            />
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<PersonAddOutlinedIcon />}
          disabled={isSubmitting || !canSubmit}
          onClick={() => {
            void handleSubmit();
          }}
          className="rounded-xl"
        >
          Add contacts
        </Button>
      </DialogActions>
    </Dialog>
  );
}
