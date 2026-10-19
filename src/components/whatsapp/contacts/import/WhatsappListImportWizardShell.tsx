'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import WhatsappListImportFlow from '@/components/whatsapp/contacts/import/WhatsappListImportFlow';
import SettingsNavButton from '@/components/settings/SettingsNavButton';
import { useConfirm } from '@/hooks/useConfirm';
import { useOrgPath } from '@/hooks/useOrgPath';

export default function WhatsappListImportWizardShell() {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const confirm = useConfirm();

  async function handleExit() {
    const shouldLeave = await confirm({
      title: 'Discard list import?',
      description:
        'You have unsaved changes. Leaving now will discard your progress.',
      variant: 'warning',
      confirmLabel: 'Discard',
      cancelLabel: 'Keep editing',
    });

    if (shouldLeave) {
      router.push(toOrgPath('/whatsapp/contacts'));
    }
  }

  function handleSuccess(result: { id: string; count: number; skipped: number }) {
    const params = new URLSearchParams({
      imported: String(result.count),
    });

    if (result.skipped > 0) {
      params.set('skipped', String(result.skipped));
    }

    router.push(
      toOrgPath(`/whatsapp/contacts/${result.id}?${params.toString()}`),
    );
  }

  return (
    <Stack spacing={3}>
      <SettingsNavButton
        href="/whatsapp/contacts"
        label="Back to contacts"
        onClick={(event) => {
          event.preventDefault();
          void handleExit();
        }}
      />

      <Card className="dashboard-panel rounded-2xl shadow-none">
        <CardContent className="p-4 md:p-6">
          <Stack spacing={4}>
            <Typography variant="h5" className="font-bold">
              Import WhatsApp list
            </Typography>

            <WhatsappListImportFlow
              onCancel={() => void handleExit()}
              onSuccess={handleSuccess}
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
