'use client';

import AddIcon from '@mui/icons-material/Add';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import ListDetailHeader from '@/components/email/lists/detail/ListDetailHeader';
import AddWhatsappContactDialog from '@/components/whatsapp/contacts/detail/AddWhatsappContactDialog';
import AppendWhatsappImportDialog from '@/components/whatsapp/contacts/detail/AppendWhatsappImportDialog';
import WhatsappCrmProspectImportDialog from '@/components/whatsapp/contacts/crm/WhatsappCrmProspectImportDialog';
import WhatsappContactListMembersTable from '@/components/whatsapp/contacts/detail/WhatsappContactListMembersTable';
import {
  useWhatsappContactList,
  useWhatsappContactListMembers,
  useWhatsappContactListMutations,
} from '@/hooks/useWhatsappContactLists';
import { useCanWhatsappImportFromCrm } from '@/hooks/useCanWhatsappImportFromCrm';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import type { WhatsappContactListMember } from '@/lib/whatsapp/lists/detail-types';
import { downloadWhatsappListPdf } from '@/lib/whatsapp/lists/download-whatsapp-list-pdf';

interface WhatsappContactListDetailContentProps {
  listId: string;
}

export default function WhatsappContactListDetailContent({
  listId,
}: WhatsappContactListDetailContentProps) {
  const canUpdate = useHasPermission('whatsapp-lists:update');
  const canRead = useHasPermission('whatsapp-lists:read');
  const canImportFromCrm = useCanWhatsappImportFromCrm();
  const { notifySuccess, notifyError } = useNotify();
  const toOrgPath = useOrgPath();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [crmOpen, setCrmOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: list,
    error: listError,
    isLoading: isListLoading,
    refetch: refetchList,
  } = useWhatsappContactList(listId);

  const membersQuery = useMemo(
    () => ({
      search,
      page,
      pageSize,
    }),
    [search, page, pageSize],
  );

  const {
    data: membersPage,
    isLoading: isMembersLoading,
    refetch: refetchMembers,
  } = useWhatsappContactListMembers(listId, membersQuery);

  const {
    addMember,
    removeMember,
    appendFromProspects,
    isAddingMember,
    isAppendingImport,
    isAppendingFromProspects,
  } = useWhatsappContactListMutations(listId);

  const importBanner = useMemo(() => {
    const imported = searchParams.get('imported');
    if (!imported) {
      return null;
    }

    const skipped = searchParams.get('skipped');
    const importedCount = Number(imported);
    const skippedCount = skipped ? Number(skipped) : 0;

    if (Number.isNaN(importedCount)) {
      return null;
    }

    return (
      `Imported ${importedCount.toLocaleString()} contacts` +
      (skippedCount > 0
        ? ` (${skippedCount.toLocaleString()} rows skipped)`
        : '')
    );
  }, [searchParams]);

  async function refreshAll() {
    await Promise.all([refetchList(), refetchMembers()]);
  }

  async function handleAddContact(
    input: Parameters<typeof addMember>[0],
  ) {
    setActionError(null);

    try {
      await addMember(input);
      setAddOpen(false);
      notifySuccess('Contact added');
      await refreshAll();
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Unable to add contact'));
    }
  }

  async function handleExportPdf() {
    if (!list) {
      return;
    }

    setIsExportingPdf(true);

    try {
      await downloadWhatsappListPdf(list.id, list.name);
      notifySuccess('PDF download started');
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to export list'));
    } finally {
      setIsExportingPdf(false);
    }
  }

  async function handleRemoveContact(member: WhatsappContactListMember) {
    setActionError(null);

    try {
      await removeMember(member.id);
      notifySuccess('Contact removed');
      await refreshAll();
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to remove contact'));
    }
  }

  if (listError) {
    return (
      <Alert severity="error" className="rounded-2xl">
        {getApiErrorMessage(listError, 'Unable to load list')}
      </Alert>
    );
  }

  const fieldSchema = list?.fieldSchema;

  return (
    <Stack spacing={3}>
      <ListDetailHeader
        name={list?.name ?? null}
        isLoading={isListLoading}
        backHref={toOrgPath('/whatsapp/contacts')}
        backLabel="Back to contacts"
      />

      {importBanner ? (
        <Alert severity="success" className="rounded-2xl">
          {importBanner}
        </Alert>
      ) : null}

      {actionError ? (
        <Alert severity="error" className="rounded-2xl">
          {actionError}
        </Alert>
      ) : null}

      {list ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          className="items-start justify-between sm:items-center"
        >
          <Stack direction="row" spacing={1} className="flex-wrap">
            <Chip
              label={
                list.visibility === 'org' ? 'Organization list' : 'Private list'
              }
              size="small"
              variant="outlined"
              className="rounded-lg"
            />
            <Chip
              label={`${list.contactCount.toLocaleString()} contacts`}
              size="small"
              className="rounded-lg"
            />
          </Stack>
          {canRead ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PictureAsPdfOutlinedIcon />}
              disabled={isExportingPdf}
              onClick={() => void handleExportPdf()}
              className="rounded-xl"
            >
              {isExportingPdf ? 'Exporting…' : 'Export PDF'}
            </Button>
          ) : null}
        </Stack>
      ) : null}

      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="p-4 md:p-6">
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              className="items-start justify-between"
            >
              <TextField
                size="small"
                placeholder="Search contacts..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="min-w-[220px] rounded-xl"
              />
              {canUpdate ? (
                <Stack direction="row" spacing={1} className="flex-wrap">
                  {canImportFromCrm ? (
                    <Button
                      variant="outlined"
                      startIcon={<PeopleOutlinedIcon />}
                      onClick={() => setCrmOpen(true)}
                      className="rounded-xl"
                    >
                      From CRM
                    </Button>
                  ) : null}
                  <Button
                    variant="outlined"
                    startIcon={<UploadFileOutlinedIcon />}
                    onClick={() => setBulkOpen(true)}
                    className="rounded-xl"
                  >
                    Bulk upload
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddOpen(true)}
                    className="rounded-xl shadow-primary-soft"
                  >
                    Add contact
                  </Button>
                </Stack>
              ) : null}
            </Stack>

            {fieldSchema ? (
              <WhatsappContactListMembersTable
                members={membersPage?.items ?? []}
                fieldSchema={fieldSchema}
                isLoading={isMembersLoading || isListLoading}
                canDelete={canUpdate}
                onDeleteMember={(member) => void handleRemoveContact(member)}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Loading list fields...
              </Typography>
            )}

            {membersPage && membersPage.total > pageSize ? (
              <Box className="flex justify-end gap-2">
                <Button
                  size="small"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="small"
                  disabled={page * pageSize >= membersPage.total}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </Box>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      {fieldSchema ? (
        <>
          <AddWhatsappContactDialog
            open={addOpen}
            fieldSchema={fieldSchema}
            isSubmitting={isAddingMember}
            isSubmittingFromCrm={isAppendingFromProspects}
            showCrmTab={canImportFromCrm}
            error={actionError}
            onClose={() => {
              setAddOpen(false);
              setActionError(null);
            }}
            onSubmit={handleAddContact}
            onSubmitFromCrm={async ({ prospectIds }) => {
              setActionError(null);

              try {
                const result = await appendFromProspects({ prospectIds });
                setAddOpen(false);
                notifySuccess(
                  `Added ${result.importedCount.toLocaleString()} contacts` +
                    (result.skippedCount > 0
                      ? ` (${result.skippedCount.toLocaleString()} skipped)`
                      : ''),
                );
                await refreshAll();
              } catch (error) {
                setActionError(
                  getApiErrorMessage(error, 'Unable to add from CRM'),
                );
              }
            }}
          />

          <WhatsappCrmProspectImportDialog
            open={crmOpen}
            mode="append"
            isSubmitting={isAppendingFromProspects}
            error={actionError}
            onClose={() => {
              setCrmOpen(false);
              setActionError(null);
            }}
            onSubmitCreate={async () => undefined}
            onSubmitAppend={async ({ prospectIds }) => {
              setActionError(null);

              try {
                const result = await appendFromProspects({ prospectIds });
                setCrmOpen(false);
                notifySuccess(
                  `Added ${result.importedCount.toLocaleString()} contacts` +
                    (result.skippedCount > 0
                      ? ` (${result.skippedCount.toLocaleString()} skipped)`
                      : ''),
                );
                await refreshAll();
              } catch (error) {
                setActionError(
                  getApiErrorMessage(error, 'Unable to add from CRM'),
                );
              }
            }}
          />

          <AppendWhatsappImportDialog
            open={bulkOpen}
            listId={listId}
            fieldSchema={fieldSchema}
            isSubmitting={isAppendingImport}
            onClose={() => setBulkOpen(false)}
            onComplete={async (result) => {
              notifySuccess(
                `Added ${result.importedCount.toLocaleString()} contacts` +
                  (result.skippedCount > 0
                    ? ` (${result.skippedCount.toLocaleString()} skipped)`
                    : ''),
              );
              await refreshAll();
            }}
          />
        </>
      ) : null}
    </Stack>
  );
}
