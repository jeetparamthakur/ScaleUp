'use client';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { Input } from '@/components/ui/inputs';
import WizardFormSection from '@/components/email/campaigns/create/WizardFormSection';
import { useOrgPath } from '@/hooks/useOrgPath';
import type { WhatsappSenderConnection } from '@/lib/whatsapp/connections/types';
import {
  WHATSAPP_CAMPAIGN_WIZARD_BORDER_SECTION,
  WHATSAPP_CAMPAIGN_WIZARD_ITEM_CARD,
  WHATSAPP_CAMPAIGN_WIZARD_ITEM_CARD_SELECTED,
  WHATSAPP_CAMPAIGN_WIZARD_SECTION_CARD,
} from '@/lib/whatsapp/campaigns/wizard-ui';

interface WhatsappCampaignDetailsStepProps {
  name: string;
  onNameChange: (value: string) => void;
  showValidation: boolean;
  readySenders: WhatsappSenderConnection[];
  selectedSenderIds: string[];
  onToggleSender: (id: string) => void;
}

function formatSenderPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 10) {
    return phone;
  }
  return `+${digits}`;
}

function getSenderLabel(sender: WhatsappSenderConnection): string {
  return (
    sender.displayName ??
    sender.pushName ??
    sender.phone ??
    'WhatsApp number'
  );
}

export default function WhatsappCampaignDetailsStep({
  name,
  onNameChange,
  showValidation,
  readySenders,
  selectedSenderIds,
  onToggleSender,
}: WhatsappCampaignDetailsStepProps) {
  const toOrgPath = useOrgPath();
  const settingsHref = toOrgPath('/whatsapp/settings');

  const trimmedName = name.trim();
  const nameError =
    showValidation && !trimmedName ? 'Enter a campaign name to continue.' : null;
  const sendersError =
    showValidation && readySenders.length > 0 && selectedSenderIds.length === 0
      ? 'Select at least one sender.'
      : null;

  return (
    <Stack spacing={3}>
      <Box className={WHATSAPP_CAMPAIGN_WIZARD_BORDER_SECTION}>
        <WizardFormSection>
          <Input
            id="whatsapp-campaign-name"
            label="Campaign name"
            required
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            autoFocus
            autoComplete="off"
            placeholder="e.g. March product launch"
            error={nameError ?? undefined}
          />
        </WizardFormSection>
      </Box>

      <Box className={WHATSAPP_CAMPAIGN_WIZARD_SECTION_CARD}>
        <WizardFormSection
          title="WhatsApp senders"
          headerAction={
          readySenders.length > 0 ? (
            <Chip
              size="small"
              label={`${selectedSenderIds.length} selected`}
              color={selectedSenderIds.length > 0 ? 'primary' : 'default'}
              variant="filled"
              className="rounded-lg font-medium tabular-nums"
            />
          ) : null
        }
      >
        {readySenders.length === 0 ? (
          <Alert severity="info" className="rounded-xl">
            <Stack spacing={1.5}>
              <Typography variant="body2">
                Connect at least one WhatsApp number before you can send a
                campaign.
              </Typography>
              <Button
                component={Link}
                href={settingsHref}
                variant="outlined"
                size="small"
                className="w-fit rounded-lg normal-case"
              >
                Open WhatsApp settings
              </Button>
            </Stack>
          </Alert>
        ) : (
          <Stack spacing={1.25}>
            {sendersError ? (
              <Typography variant="caption" color="error" role="alert">
                {sendersError}
              </Typography>
            ) : null}
            <Stack
              component="div"
              role="group"
              aria-label="WhatsApp senders"
              spacing={1}
            >
              {readySenders.map((sender) => {
                const label = getSenderLabel(sender);
                const selected = selectedSenderIds.includes(sender.id);
                const phoneLabel = sender.phone
                  ? formatSenderPhone(sender.phone)
                  : null;

                return (
                  <Box
                    key={sender.id}
                    component="button"
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onToggleSender(sender.id)}
                    className={`group flex w-full items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      selected
                        ? WHATSAPP_CAMPAIGN_WIZARD_ITEM_CARD_SELECTED
                        : WHATSAPP_CAMPAIGN_WIZARD_ITEM_CARD
                    }`}
                  >
                    <Box
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        selected
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted/40 text-text-secondary group-hover:text-foreground/80'
                      }`}
                    >
                      <PhoneIphoneOutlinedIcon sx={{ fontSize: 22 }} aria-hidden />
                    </Box>
                    <Stack spacing={0.25} className="min-w-0 flex-1">
                      <Typography
                        variant="body2"
                        className="truncate font-semibold text-foreground"
                      >
                        {label}
                      </Typography>
                      {phoneLabel && label !== phoneLabel ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          className="truncate tabular-nums"
                        >
                          {phoneLabel}
                        </Typography>
                      ) : null}
                    </Stack>
                    <Box
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                        selected
                          ? 'bg-primary text-white'
                          : 'bg-background/80 ring-2 ring-surface-border group-hover:ring-primary/30'
                      }`}
                      aria-hidden
                    >
                      {selected ? (
                        <CheckRoundedIcon sx={{ fontSize: 16 }} />
                      ) : null}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Stack>
        )}
        </WizardFormSection>
      </Box>
    </Stack>
  );
}
