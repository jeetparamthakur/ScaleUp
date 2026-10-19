'use client';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  buildWhatsappCampaignSteps,
  formatWhatsappStepDelayLabel,
} from '@/lib/whatsapp/campaigns/whatsapp-campaign-wizard-payload';
import type { WhatsappCampaignFollowUpDraft } from '@/lib/whatsapp/campaigns/sequence-types';
import { renderWhatsappFormattedMessage } from '@/lib/whatsapp/format-whatsapp-message';

interface WhatsappSequenceTemplatePreviewProps {
  templateName: string;
  initialBody: string;
  followUps: WhatsappCampaignFollowUpDraft[];
  onCustomize: () => void;
}

export default function WhatsappSequenceTemplatePreview({
  templateName,
  initialBody,
  followUps,
  onCustomize,
}: WhatsappSequenceTemplatePreviewProps) {
  const steps = buildWhatsappCampaignSteps(initialBody, followUps);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.75}>
        <Typography variant="h6" component="h2" className="font-bold">
          Review your sequence
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Messages from <strong>{templateName}</strong>. Customize if needed.
        </Typography>
      </Stack>

      <Stack spacing={2.5}>
        {steps.map((step) => (
          <Box key={step.stepOrder}>
            <Typography variant="body2" color="text.secondary" className="mb-1.5">
              Step {step.stepOrder} · {formatWhatsappStepDelayLabel(step)}
            </Typography>
            <Box
              className="ml-auto max-w-[92%] rounded-2xl rounded-tr-md bg-primary/12 px-3 py-2 text-[15px] leading-relaxed shadow-sm"
            >
              <Typography
                component="div"
                variant="body2"
                className="whitespace-pre-wrap break-words"
              >
                {renderWhatsappFormattedMessage(step.body)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'flex-start' }}>
        <Button
          variant="outlined"
          startIcon={<EditOutlinedIcon />}
          onClick={onCustomize}
          className="rounded-2xl px-4"
        >
          Customize
        </Button>
      </Stack>
    </Stack>
  );
}
