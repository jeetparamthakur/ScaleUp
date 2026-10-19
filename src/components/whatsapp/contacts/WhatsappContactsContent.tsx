'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import DataTable from '@/components/data-table/DataTable';
import CreateWhatsappListDialog from '@/components/whatsapp/contacts/CreateWhatsappListDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useCanWhatsappImportFromCrm } from '@/hooks/useCanWhatsappImportFromCrm';
import { useWhatsappContactLists } from '@/hooks/useWhatsappContactLists';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import { downloadWhatsappListPdf } from '@/lib/whatsapp/lists/download-whatsapp-list-pdf';
import type { WhatsappContactList } from '@/lib/whatsapp/lists/types';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatVisibility(list: WhatsappContactList): string {
  return list.visibility === 'org' ? 'Organization' : 'Private';
}

function ListSectionHeading() {
  return (
    <Stack spacing={0.5}>
      <Typography variant="h6" className="font-bold">
        Contact lists
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Build WhatsApp audiences with manual entry or bulk import.
      </Typography>
    </Stack>
  );
}

interface WhatsappContactsContentProps {
  onOpenImport: () => void;
}

export default function WhatsappContactsContent({
  onOpenImport,
}: WhatsappContactsContentProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const canCreate = useHasPermission('whatsapp-lists:create');
  const canRead = useHasPermission('whatsapp-lists:read');
  const canUpdate = useHasPermission('whatsapp-lists:update');
  const canImportFromCrm = useCanWhatsappImportFromCrm();
  const { notifySuccess, notifyError } = useNotify();
  const {
    lists,
    isLoading,
    createList,
    importFromProspects,
    isCreating,
    isImportingFromProspects,
    deleteList,
    isDeleting,
  } = useWhatsappContactLists();
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [exportingListId, setExportingListId] = useState<string | null>(null);
  const [listToDelete, setListToDelete] = useState<WhatsappContactList | null>(
    null,
  );

  const rows = useMemo(() => lists, [lists]);

  async function handleCreateList(input: {
    name: string;
    visibility: WhatsappContactList['visibility'];
    prospectIds?: string[];
  }) {
    setCreateError(null);

    try {
      if (input.prospectIds && input.prospectIds.length > 0) {
        const result = await importFromProspects({
          name: input.name,
          visibility: input.visibility,
          prospectIds: input.prospectIds,
        });
        setCreateOpen(false);
        const params = new URLSearchParams({
          imported: String(result.importedCount),
        });
        if (result.skippedCount > 0) {
          params.set('skipped', String(result.skippedCount));
        }
        router.push(
          toOrgPath(
            `/whatsapp/contacts/${result.list.id}?${params.toString()}`,
          ),
        );
        return;
      }

      const list = await createList(input);
      setCreateOpen(false);
      router.push(toOrgPath(`/whatsapp/contacts/${list.id}`));
    } catch (error) {
      setCreateError(getApiErrorMessage(error, 'Unable to create list'));
    }
  }

  async function handleConfirmDeleteList() {
    if (!listToDelete) {
      return;
    }

    try {
      await deleteList(listToDelete.id);
      notifySuccess(`Deleted “${listToDelete.name}”`);
      setListToDelete(null);
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to delete list'));
    }
  }

  async function handleExportPdf(list: WhatsappContactList) {
    setExportingListId(list.id);

    try {
      await downloadWhatsappListPdf(list.id, list.name);
      notifySuccess('PDF download started');
    } catch (error) {
      notifyError(getApiErrorMessage(error, 'Unable to export list'));
    } finally {
      setExportingListId(null);
    }
  }

  return (
    <>
      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="p-4 md:p-6">
          <DataTable<WhatsappContactList>
            tableId="whatsapp-contact-lists"
            rows={rows}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            onRowClick={(row) => {
              router.push(toOrgPath(`/whatsapp/contacts/${row.id}`));
            }}
            includeFields={[
              'name',
              'visibility',
              'contactCount',
              'createdAt',
            ]}
            emptyMessage="No lists yet. Create a list or import contacts to get started."
            noResultsMessage="No lists match your search."
            searchPlaceholder="Search lists..."
            toolbarLeadingContent={
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                className="w-full items-start justify-between md:items-center"
              >
                <ListSectionHeading />
                {canCreate ? (
                  <Stack direction="row" spacing={1} className="shrink-0">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => setCreateOpen(true)}
                      className="rounded-xl"
                    >
                      New list
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<UploadFileOutlinedIcon />}
                      onClick={onOpenImport}
                      className="rounded-xl shadow-primary-soft"
                    >
                      Import
                    </Button>
                  </Stack>
                ) : null}
              </Stack>
            }
            columnOverrides={{
              name: { label: 'List name' },
              visibility: {
                label: 'Visibility',
                searchable: true,
                render: (row) => (
                  <Chip
                    label={formatVisibility(row)}
                    size="small"
                    variant="outlined"
                    className="rounded-lg"
                  />
                ),
              },
              contactCount: {
                label: 'Contacts',
                render: (row) => row.contactCount.toLocaleString(),
              },
              createdAt: {
                label: 'Created',
                render: (row) => formatDate(row.createdAt),
              },
            }}
            rowActions={
              canRead || canUpdate
                ? (row) => (
                    <>
                      {canRead ? (
                        <Tooltip title="Download PDF">
                          <span>
                            <IconButton
                              size="small"
                              aria-label={`Download ${row.name} as PDF`}
                              disabled={exportingListId === row.id}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleExportPdf(row);
                              }}
                            >
                              <PictureAsPdfOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : null}
                      {canUpdate ? (
                        <Tooltip title={`Delete ${row.name}`}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              aria-label={`Delete ${row.name}`}
                              disabled={isDeleting}
                              onClick={(event) => {
                                event.stopPropagation();
                                setListToDelete(row);
                              }}
                            >
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : null}
                    </>
                  )
                : undefined
            }
          />
        </CardContent>
      </Card>

      <CreateWhatsappListDialog
        open={createOpen}
        isSubmitting={isCreating || isImportingFromProspects}
        showCrmStep={canImportFromCrm}
        error={createError}
        onClose={() => {
          setCreateOpen(false);
          setCreateError(null);
        }}
        onSubmit={handleCreateList}
      />

      <ConfirmDialog
        open={listToDelete != null}
        variant="destructive"
        title="Delete contact list?"
        description={
          listToDelete ? (
            <>
              This permanently removes <strong>{listToDelete.name}</strong> and
              all {listToDelete.contactCount.toLocaleString()} contacts in it.
              Lists linked to WhatsApp campaigns cannot be deleted until those
              campaigns are updated.
            </>
          ) : null
        }
        confirmLabel="Delete list"
        isLoading={isDeleting}
        onClose={() => setListToDelete(null)}
        onConfirm={() => void handleConfirmDeleteList()}
      />
    </>
  );
}
