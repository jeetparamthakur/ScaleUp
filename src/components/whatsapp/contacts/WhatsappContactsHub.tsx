'use client';

import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import WhatsappContactsContent from '@/components/whatsapp/contacts/WhatsappContactsContent';
import WhatsappListImportDialog from '@/components/whatsapp/contacts/import/WhatsappListImportDialog';
import WhatsAppHubShell from '@/components/whatsapp/WhatsAppHubShell';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useNotify } from '@/hooks/useNotify';
import { useOrgPath } from '@/hooks/useOrgPath';

export default function WhatsappContactsHub() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const canCreate = useHasPermission('whatsapp-lists:create');
  const { notifySuccess } = useNotify();
  const [importOpen, setImportOpen] = useState(false);

  function handleImportSuccess(result: {
    id: string;
    count: number;
    skipped: number;
  }) {
    setImportOpen(false);
    notifySuccess(
      `Imported ${result.count.toLocaleString()} contacts` +
        (result.skipped > 0
          ? ` (${result.skipped.toLocaleString()} rows skipped)`
          : ''),
    );
    router.push(toOrgPath(`/whatsapp/contacts/${result.id}`));
  }

  return (
    <WhatsAppHubShell
      actions={
        canCreate ? (
          <Button
            variant="contained"
            startIcon={<UploadFileOutlinedIcon />}
            onClick={() => setImportOpen(true)}
            className="rounded-2xl px-5 py-2.5 shadow-primary-soft"
          >
            Import list
          </Button>
        ) : null
      }
    >
      <WhatsappContactsContent onOpenImport={() => setImportOpen(true)} />
      <WhatsappListImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </WhatsAppHubShell>
  );
}
