'use client';

import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import WhatsappCampaignConfigurationSection from '@/components/whatsapp/campaigns/WhatsappCampaignConfigurationSection';
import WhatsappCampaignDetailsStep from '@/components/whatsapp/campaigns/WhatsappCampaignDetailsStep';
import WhatsappCampaignWizardStepper from '@/components/whatsapp/campaigns/WhatsappCampaignWizardStepper';
import WhatsappCampaignSequenceStep from '@/components/whatsapp/campaigns/sequence/WhatsappCampaignSequenceStep';
import {
  useCreateWhatsappCampaign,
  useScheduleWhatsappCampaign,
} from '@/hooks/useWhatsappCampaigns';
import { useWhatsappContactLists } from '@/hooks/useWhatsappContactLists';
import { useWhatsappSenderConnections } from '@/hooks/useWhatsappSenderConnections';
import {
  getDefaultTimezone,
  getTodayDateInputValue,
} from '@/lib/email/campaigns/schedule-utils';
import {
  WHATSAPP_CAMPAIGN_CREATE_STEP_COUNT,
  WHATSAPP_CAMPAIGN_CREATE_STEPS,
} from '@/lib/whatsapp/campaigns/create-wizard-steps';
import { SearchSelect } from '@/components/ui/inputs';
import { WHATSAPP_CAMPAIGN_WIZARD_SECTION_CARD } from '@/lib/whatsapp/campaigns/wizard-ui';
import type { WhatsappCampaignFollowUpDraft } from '@/lib/whatsapp/campaigns/sequence-types';
import {
  buildWhatsappCampaignSteps,
  canProceedWhatsappSequenceStep,
  formatWhatsappStepDelayLabel,
} from '@/lib/whatsapp/campaigns/whatsapp-campaign-wizard-payload';
import {
  buildLaunchAtIso,
  formatLaunchScheduleReview,
  getDefaultLaunchEndTimeHm,
  getDefaultLaunchTimeHm,
  isScheduledLaunchInFuture,
  resolveSendingWindowPayload,
  validateSendingWindowEnd,
  type WhatsappCampaignScheduleMode,
} from '@/lib/whatsapp/campaigns/launch-schedule';
import {
  getSuggestedWhatsappDailyBatchSize,
  isWhatsappDailyBatchWithinSenderLimits,
} from '@/lib/whatsapp/campaigns/sender-capacity';
import { renderWhatsappFormattedMessage } from '@/lib/whatsapp/format-whatsapp-message';

interface CreateWhatsappCampaignDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const stepEnterSx = {
  animation: 'signupStepIn 0.26s cubic-bezier(0.22, 1, 0.36, 1)',
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
};

export default function CreateWhatsappCampaignDialog({
  open,
  onClose,
  onCreated,
}: CreateWhatsappCampaignDialogProps) {
  const { lists } = useWhatsappContactLists();
  const { data: senders } = useWhatsappSenderConnections();
  const { createCampaign, isCreating } = useCreateWhatsappCampaign();
  const { scheduleCampaign, isScheduling } = useScheduleWhatsappCampaign();

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [name, setName] = useState('');
  const [initialBody, setInitialBody] = useState('');
  const [followUps, setFollowUps] = useState<WhatsappCampaignFollowUpDraft[]>(
    [],
  );
  const [contactListId, setContactListId] = useState('');
  const [selectedSenderIds, setSelectedSenderIds] = useState<string[]>([]);
  const [dailyBatchSize, setDailyBatchSize] = useState(50);
  const [sendIntervalSeconds, setSendIntervalSeconds] = useState('');
  const [distributeRecipientsEqually, setDistributeRecipientsEqually] =
    useState(false);
  const [scheduleMode, setScheduleMode] =
    useState<WhatsappCampaignScheduleMode>('immediate');
  const [launchDate, setLaunchDate] = useState(() =>
    getTodayDateInputValue(getDefaultTimezone()),
  );
  const [launchTime, setLaunchTime] = useState(() =>
    getDefaultLaunchTimeHm(getDefaultTimezone()),
  );
  const [launchEndTime, setLaunchEndTime] = useState(() =>
    getDefaultLaunchEndTimeHm(),
  );
  const [timezone, setTimezone] = useState(() => getDefaultTimezone());
  const [error, setError] = useState<string | null>(null);
  const [sequenceCanContinue, setSequenceCanContinue] = useState(false);
  const [detailsShowValidation, setDetailsShowValidation] = useState(false);

  const activeStep = WHATSAPP_CAMPAIGN_CREATE_STEPS[activeStepIndex];
  const isFirstStep = activeStepIndex === 0;
  const isLastStep =
    activeStepIndex === WHATSAPP_CAMPAIGN_CREATE_STEPS.length - 1;

  const readySenders = useMemo(
    () => (senders ?? []).filter((row) => row.status === 'ready'),
    [senders],
  );

  const selectedList = useMemo(
    () => (lists ?? []).find((list) => list.id === contactListId),
    [contactListId, lists],
  );

  const selectedListName = selectedList?.name;

  const contactListOptions = useMemo(
    () =>
      (lists ?? []).map((list) => ({
        value: list.id,
        label:
          list.contactCount > 0
            ? `${list.name} (${list.contactCount.toLocaleString()})`
            : list.name,
        keywords: list.name,
      })),
    [lists],
  );

  const parsedSendInterval = useMemo(() => {
    const trimmed = sendIntervalSeconds.trim();
    if (trimmed === '') {
      return null;
    }
    const value = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(value) || value < 1 || value > 3600) {
      return undefined;
    }
    return value;
  }, [sendIntervalSeconds]);

  const selectedSendersForReview = useMemo(
    () =>
      readySenders.filter((sender) => selectedSenderIds.includes(sender.id)),
    [readySenders, selectedSenderIds],
  );

  function resetForm() {
    setActiveStepIndex(0);
    setName('');
    setInitialBody('');
    setFollowUps([]);
    setContactListId('');
    setSelectedSenderIds([]);
    setDailyBatchSize(50);
    setSendIntervalSeconds('');
    setDistributeRecipientsEqually(false);
    setScheduleMode('immediate');
    setLaunchDate(getTodayDateInputValue(getDefaultTimezone()));
    setLaunchTime(getDefaultLaunchTimeHm(getDefaultTimezone()));
    setLaunchEndTime(getDefaultLaunchEndTimeHm());
    setTimezone(getDefaultTimezone());
    setError(null);
    setDetailsShowValidation(false);
  }

  function handleClose() {
    if (isCreating || isScheduling) {
      return;
    }
    resetForm();
    onClose();
  }

  function toggleSender(id: string) {
    const nextIds = selectedSenderIds.includes(id)
      ? selectedSenderIds.filter((value) => value !== id)
      : [...selectedSenderIds, id];
    setSelectedSenderIds(nextIds);

    const nextSenders = readySenders.filter((sender) =>
      nextIds.includes(sender.id),
    );
    const suggestedMax = getSuggestedWhatsappDailyBatchSize(nextSenders);
    setDailyBatchSize((current) =>
      current > suggestedMax ? suggestedMax : current,
    );
  }

  async function handleSubmit(mode: 'draft' | 'run') {
    setError(null);
    try {
      let launchAt: string | undefined;
      let sendingWindowStartMinutes: number | undefined;
      let sendingWindowEndMinutes: number | undefined;

      if (mode === 'run') {
        const windowError = validateSendingWindowEnd(
          scheduleMode,
          launchTime,
          launchEndTime,
          timezone,
        );
        if (windowError) {
          setError(windowError);
          return;
        }

        if (scheduleMode === 'immediate') {
          launchAt = new Date().toISOString();
        } else {
          const scheduledIso = buildLaunchAtIso(
            launchDate,
            launchTime,
            timezone,
          );
          if (!scheduledIso) {
            setError('Choose a valid start date and time');
            return;
          }
          launchAt = scheduledIso;
        }

        const windowPayload = resolveSendingWindowPayload(
          scheduleMode,
          launchAt,
          launchTime,
          launchEndTime,
          timezone,
        );
        if (!windowPayload) {
          setError('Choose a valid sending window');
          return;
        }

        sendingWindowStartMinutes = windowPayload.sendingWindowStartMinutes;
        sendingWindowEndMinutes = windowPayload.sendingWindowEndMinutes;
      }

      const steps = buildWhatsappCampaignSteps(initialBody, followUps);

      const created = await createCampaign({
        name,
        steps,
        contactListId,
        senderConnectionIds: selectedSenderIds,
        launchAt,
        timezone: mode === 'run' ? timezone : undefined,
        sendingWindowStartMinutes,
        sendingWindowEndMinutes,
        dailyBatchSize,
        sendIntervalSeconds: parsedSendInterval,
        distributeRecipientsEqually:
          selectedSenderIds.length > 1 && distributeRecipientsEqually,
      });

      if (mode === 'run') {
        await scheduleCampaign(created.id);
      }

      onCreated();
      resetForm();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create campaign',
      );
    }
  }

  const canProceedFromStep = useMemo(() => {
    switch (activeStep.id) {
      case 'details':
        return (
          Boolean(name.trim()) &&
          selectedSenderIds.length > 0 &&
          readySenders.length > 0
        );
      case 'sequence':
        return sequenceCanContinue;
      case 'audience':
        return (
          Boolean(contactListId) &&
          dailyBatchSize >= 1 &&
          isWhatsappDailyBatchWithinSenderLimits(
            dailyBatchSize,
            selectedSendersForReview,
          ) &&
          parsedSendInterval !== undefined &&
          (scheduleMode === 'immediate' ||
            isScheduledLaunchInFuture(launchDate, launchTime, timezone)) &&
          !validateSendingWindowEnd(
            scheduleMode,
            launchTime,
            launchEndTime,
            timezone,
          )
        );
      case 'review':
        return (
          Boolean(name.trim()) &&
          canProceedWhatsappSequenceStep(initialBody, followUps) &&
          Boolean(contactListId) &&
          selectedSenderIds.length > 0
        );
      default:
        return false;
    }
  }, [
    activeStep.id,
    contactListId,
    followUps,
    initialBody,
    sequenceCanContinue,
    name,
    readySenders.length,
    selectedSenderIds.length,
    dailyBatchSize,
    parsedSendInterval,
    selectedSendersForReview,
    scheduleMode,
    launchDate,
    launchTime,
    launchEndTime,
    timezone,
  ]);

  const scheduleReviewLabel = useMemo(
    () =>
      formatLaunchScheduleReview(
        scheduleMode,
        launchDate,
        launchTime,
        launchEndTime,
        timezone,
      ),
    [launchDate, launchEndTime, launchTime, scheduleMode, timezone],
  );

  const scheduleStepError = useMemo(() => {
    const windowError = validateSendingWindowEnd(
      scheduleMode,
      launchTime,
      launchEndTime,
      timezone,
    );
    if (windowError) {
      return windowError;
    }

    if (scheduleMode !== 'scheduled') {
      return null;
    }
    if (!launchDate || !launchTime) {
      return 'Date and time are required';
    }
    if (!isScheduledLaunchInFuture(launchDate, launchTime, timezone)) {
      return 'Start time must be in the future';
    }
    return null;
  }, [launchDate, launchEndTime, launchTime, scheduleMode, timezone]);

  const spacingReviewLabel = useMemo(() => {
    if (parsedSendInterval != null && parsedSendInterval > 0) {
      return `Fixed ${parsedSendInterval}s between messages`;
    }
    if (sendIntervalSeconds.trim() !== '' && parsedSendInterval === undefined) {
      return 'Enter a valid interval (1–3600 seconds) or leave empty';
    }
    return 'Random 1–3 min between messages';
  }, [parsedSendInterval, sendIntervalSeconds]);

  const sequenceStepsForReview = useMemo(
    () => buildWhatsappCampaignSteps(initialBody, followUps),
    [followUps, initialBody],
  );

  const isBusy = isCreating || isScheduling;

  function handleNext() {
    if (isLastStep) {
      return;
    }
    if (activeStep.id === 'details' && !canProceedFromStep) {
      setDetailsShowValidation(true);
      return;
    }
    if (!canProceedFromStep) {
      return;
    }
    setError(null);
    setDetailsShowValidation(false);
    setActiveStepIndex((index) =>
      Math.min(index + 1, WHATSAPP_CAMPAIGN_CREATE_STEPS.length - 1),
    );
  }

  function handleBack() {
    setError(null);
    setDetailsShowValidation(false);
    setActiveStepIndex((index) => Math.max(index - 1, 0));
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          className: 'surface-panel rounded-2xl shadow-xl',
        },
      }}
    >
      <Box className="px-6 pb-4 pt-5">
        <Stack direction="row" className="items-start justify-between gap-3">
          <Stack spacing={0.75} className="min-w-0">
            <Stack direction="row" spacing={1.25} className="items-center">
              <CampaignOutlinedIcon
                className="shrink-0 text-primary"
                fontSize="small"
                aria-hidden
              />
              <Typography variant="h6" className="font-semibold leading-tight">
                New WhatsApp campaign
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" className="block">
              Step {activeStepIndex + 1} of {WHATSAPP_CAMPAIGN_CREATE_STEP_COUNT}
              <span className="hidden sm:inline">
                {' '}
                · {activeStep.label}
              </span>
            </Typography>
          </Stack>
          <IconButton
            aria-label="Close"
            onClick={handleClose}
            disabled={isBusy}
            className="shrink-0 -mr-1 rounded-xl hover:bg-muted/50"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Box className="mt-4">
          <WhatsappCampaignWizardStepper activeStepIndex={activeStepIndex} />
        </Box>
      </Box>

      <DialogContent className="overflow-visible px-6 pb-4 pt-4">
        <Stack spacing={2.5}>
          {error ? (
            <Alert severity="error" className="rounded-xl">
              {error}
            </Alert>
          ) : null}

          <Box key={activeStep.id} sx={stepEnterSx}>
            {activeStep.id === 'details' ? (
              <WhatsappCampaignDetailsStep
                name={name}
                onNameChange={setName}
                showValidation={detailsShowValidation}
                readySenders={readySenders}
                selectedSenderIds={selectedSenderIds}
                onToggleSender={toggleSender}
              />
            ) : null}

            {activeStep.id === 'sequence' ? (
              <WhatsappCampaignSequenceStep
                initialBody={initialBody}
                onInitialBodyChange={setInitialBody}
                followUps={followUps}
                onFollowUpsChange={setFollowUps}
                disabled={isBusy}
                onCanContinueChange={setSequenceCanContinue}
              />
            ) : null}

            {activeStep.id === 'audience' ? (
              <Stack spacing={3}>
                <Box className={WHATSAPP_CAMPAIGN_WIZARD_SECTION_CARD}>
                  <SearchSelect
                    id="whatsapp-campaign-list"
                    label="Contact list"
                    required
                    value={contactListId}
                    onChange={setContactListId}
                    options={contactListOptions}
                    placeholder="Select a contact list"
                    searchPlaceholder="Search lists"
                  />
                </Box>

                {contactListId ? (
                  <Box className={WHATSAPP_CAMPAIGN_WIZARD_SECTION_CARD}>
                    <WhatsappCampaignConfigurationSection
                      dailyBatchSize={dailyBatchSize}
                      onDailyBatchSizeChange={setDailyBatchSize}
                      sendIntervalSeconds={sendIntervalSeconds}
                      onSendIntervalSecondsChange={setSendIntervalSeconds}
                      distributeRecipientsEqually={distributeRecipientsEqually}
                      onDistributeRecipientsEquallyChange={
                        setDistributeRecipientsEqually
                      }
                      selectedSenders={selectedSendersForReview}
                      contactCount={selectedList?.contactCount ?? 0}
                      scheduleMode={scheduleMode}
                      onScheduleModeChange={setScheduleMode}
                      launchDate={launchDate}
                      onLaunchDateChange={setLaunchDate}
                      launchTime={launchTime}
                      onLaunchTimeChange={setLaunchTime}
                      launchEndTime={launchEndTime}
                      onLaunchEndTimeChange={setLaunchEndTime}
                      timezone={timezone}
                      onTimezoneChange={setTimezone}
                      scheduleError={scheduleStepError}
                      disabled={isBusy}
                    />
                  </Box>
                ) : null}
              </Stack>
            ) : null}

            {activeStep.id === 'review' ? (
              <Box className={WHATSAPP_CAMPAIGN_WIZARD_SECTION_CARD}>
                <Stack
                  divider={<Divider className="border-surface-border" flexItem />}
                  spacing={3}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      className="font-medium uppercase tracking-wide"
                    >
                      Campaign
                    </Typography>
                    <Typography variant="subtitle1" className="mt-1 font-semibold">
                      {name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      className="font-medium uppercase tracking-wide"
                    >
                      Sequence ({sequenceStepsForReview.length} step
                      {sequenceStepsForReview.length === 1 ? '' : 's'})
                    </Typography>
                    <Stack spacing={2.5} className="mt-3">
                      {sequenceStepsForReview.map((step) => (
                        <Box key={step.stepOrder}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            className="mb-1.5"
                          >
                            Step {step.stepOrder} ·{' '}
                            {formatWhatsappStepDelayLabel(step)}
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
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      className="font-medium uppercase tracking-wide"
                    >
                      Audience
                    </Typography>
                    <Typography variant="body2" className="mt-2 font-medium">
                      {selectedListName ?? '—'}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      className="mt-3 block font-medium uppercase tracking-wide"
                    >
                      Senders ({selectedSendersForReview.length})
                    </Typography>
                    <Stack direction="row" className="mt-2 flex-wrap gap-1.5">
                      {selectedSendersForReview.map((sender) => (
                        <Chip
                          key={sender.id}
                          size="small"
                          label={
                            sender.displayName ??
                            sender.phone ??
                            sender.pushName ??
                            'WhatsApp number'
                          }
                          className="rounded-lg bg-background"
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      className="font-medium uppercase tracking-wide"
                    >
                      Configuration
                    </Typography>
                    <Typography variant="body2" className="mt-2">
                      Start:{' '}
                      <span className="font-medium">{scheduleReviewLabel}</span>
                    </Typography>
                    <Typography variant="body2" className="mt-2">
                      Daily limit:{' '}
                      <span className="font-medium">
                        {dailyBatchSize.toLocaleString()} / day
                      </span>
                    </Typography>
                    <Typography variant="body2" className="mt-1">
                      Spacing:{' '}
                      <span className="font-medium">{spacingReviewLabel}</span>
                    </Typography>
                    {selectedSendersForReview.length > 1 ? (
                      <Typography variant="body2" className="mt-1">
                        Equal distribution:{' '}
                        <span className="font-medium">
                          {distributeRecipientsEqually ? 'On' : 'Off'}
                        </span>
                      </Typography>
                    ) : null}
                  </Box>
                </Stack>
              </Box>
            ) : null}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        className="flex-wrap gap-2 px-6 pb-5 pt-1 shadow-[0_-10px_28px_-14px_color-mix(in_srgb,var(--foreground)_14%,transparent)]"
      >
        <Button
          onClick={handleClose}
          disabled={isBusy}
          className="rounded-xl text-text-secondary"
        >
          Cancel
        </Button>
        <Box className="flex flex-1 flex-wrap justify-end gap-2">
          {!isFirstStep ? (
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={isBusy}
              className="rounded-xl border-surface-border"
            >
              Back
            </Button>
          ) : null}

          {!isLastStep ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isBusy}
              className="rounded-xl px-5 shadow-primary-soft"
            >
              Continue
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                disabled={!canProceedFromStep || isBusy}
                onClick={() => void handleSubmit('draft')}
                className="rounded-xl border-surface-border"
              >
                Save draft
              </Button>
              <Button
                variant="contained"
                disabled={
                  !canProceedFromStep || isBusy || readySenders.length === 0
                }
                onClick={() => void handleSubmit('run')}
                className="rounded-xl px-5 shadow-primary-soft"
              >
                {isBusy
                  ? 'Saving…'
                  : scheduleMode === 'scheduled'
                    ? 'Schedule campaign'
                    : 'Run campaign'}
              </Button>
            </>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
