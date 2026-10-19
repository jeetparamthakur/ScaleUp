'use client';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import WhatsappCampaignMessageEditor from '@/components/whatsapp/campaigns/WhatsappCampaignMessageEditor';
import WhatsappFollowUpTimingFields from '@/components/whatsapp/campaigns/sequence/WhatsappFollowUpTimingFields';
import { getTodayDateInputValue } from '@/lib/email/campaigns/schedule-utils';
import type { WhatsappCampaignFollowUpDraft } from '@/lib/whatsapp/campaigns/sequence-types';
import { WHATSAPP_CAMPAIGN_WIZARD_SECTION_CARD } from '@/lib/whatsapp/campaigns/wizard-ui';

interface WhatsappFollowUpCardProps {
  followUp: WhatsappCampaignFollowUpDraft;
  stepNumber: number;
  followUpIndex: number;
  minScheduleDate?: string;
  disabled?: boolean;
  onChange: (next: WhatsappCampaignFollowUpDraft) => void;
  onRemove: () => void;
}

export default function WhatsappFollowUpCard({
  followUp,
  stepNumber,
  followUpIndex,
  minScheduleDate,
  disabled = false,
  onChange,
  onRemove,
}: WhatsappFollowUpCardProps) {
  return (
    <Box className={WHATSAPP_CAMPAIGN_WIZARD_SECTION_CARD}>
      <Stack spacing={2.5}>
        <Stack
          direction="row"
          spacing={1.5}
          className="items-center justify-between flex-wrap gap-2"
        >
          <Typography variant="subtitle1" className="font-semibold">
            Step {stepNumber} — Follow-up {followUpIndex + 1}
          </Typography>
          <Tooltip title="Remove follow-up">
            <IconButton
              aria-label="Remove follow-up"
              onClick={onRemove}
              disabled={disabled}
              size="small"
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <WhatsappFollowUpTimingFields
          delayMode={followUp.delayMode}
          delayDays={followUp.delayDays}
          scheduledDate={followUp.scheduledDate}
          minDate={minScheduleDate ?? getTodayDateInputValue()}
          disabled={disabled}
          onDelayModeChange={(delayMode) =>
            onChange({ ...followUp, delayMode })
          }
          onDelayDaysChange={(delayDays) =>
            onChange({ ...followUp, delayDays })
          }
          onScheduledDateChange={(scheduledDate) =>
            onChange({ ...followUp, scheduledDate })
          }
        />

        <WhatsappCampaignMessageEditor
          value={followUp.body}
          onChange={(body) => onChange({ ...followUp, body })}
          disabled={disabled}
        />
      </Stack>
    </Box>
  );
}
