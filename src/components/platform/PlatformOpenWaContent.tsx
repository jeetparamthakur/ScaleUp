'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import PlatformPageHeader from '@/components/platform/PlatformPageHeader';
import { FormTextField, SubmitButton } from '@/components/ui';
import { usePlatformOpenWa } from '@/hooks/usePlatformOpenWa';

export default function PlatformOpenWaContent() {
  const {
    settings,
    isLoading,
    error,
    display,
    setDraft,
    save,
    isSaving,
    testConnection,
    isTesting,
  } = usePlatformOpenWa();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateDraft(partial: Partial<typeof display>) {
    setDraft({ ...display, ...partial });
  }

  async function handleSave() {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await save();
      setSuccessMessage('OpenWA settings saved.');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to save settings',
      );
    }
  }

  async function handleTest() {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await testConnection();
      setSuccessMessage('Connected to OpenWA successfully.');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Connection test failed',
      );
    }
  }

  return (
    <Stack spacing={3}>
      <PlatformPageHeader
        overline="Integrations"
        title="WhatsApp / OpenWA"
        description="Configure the platform-wide OpenWA gateway used for tenant WhatsApp inbox connections."
      />

      {error ? <Alert severity="error">{error}</Alert> : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

      <Card className="surface-panel">
        <CardContent>
          <Stack spacing={2.5}>
            <Typography variant="subtitle1" className="font-semibold text-foreground">
              Gateway
            </Typography>
            <Typography variant="body2" color="text.secondary">
              API base URL should include the OpenWA `/api` prefix, for example
              `http://localhost:2785/api`. The API key must have permission to create
              sessions and webhooks.
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={display.enabled}
                  onChange={(event) =>
                    updateDraft({ enabled: event.target.checked })
                  }
                  disabled={isLoading}
                />
              }
              label="Enable OpenWA for all tenants"
            />

            <FormTextField
              label="Base URL"
              value={display.baseUrl}
              onChange={(event) => updateDraft({ baseUrl: event.target.value })}
              placeholder="http://localhost:2785/api"
              disabled={isLoading}
            />

            <FormTextField
              label="API key"
              type="password"
              value={display.apiKey}
              onChange={(event) => updateDraft({ apiKey: event.target.value })}
              placeholder={
                settings?.configured ? 'Leave blank to keep existing key' : 'Admin or operator key'
              }
              disabled={isLoading}
            />

            <Box className="flex flex-wrap gap-2">
              <SubmitButton
                label="Save"
                onClick={() => void handleSave()}
                loading={isSaving}
                disabled={isLoading}
              />
              <Button
                variant="outlined"
                onClick={() => void handleTest()}
                disabled={isLoading || isSaving || isTesting}
              >
                {isTesting ? 'Testing…' : 'Save and test'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
