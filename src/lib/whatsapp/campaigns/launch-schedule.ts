import { DateTime } from 'luxon';
import {
  DEFAULT_SENDING_WINDOW_END_MINUTES,
  formatSendingWindowDuration,
} from '@/lib/email/campaigns/schedule-utils';

export type WhatsappCampaignScheduleMode = 'immediate' | 'scheduled';

export function timeHmToMinutes(timeHm: string): number | null {
  if (!timeHm.trim()) {
    return null;
  }

  const [hour, minute] = timeHm.split(':').map((part) => Number.parseInt(part, 10));
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

/** Parse `HH:mm` (24h) into a Luxon time on today's local calendar date. */
export function parseTimeHm(timeHm: string): DateTime | null {
  const totalMinutes = timeHmToMinutes(timeHm);
  if (totalMinutes === null) {
    return null;
  }

  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  if (hour > 23 || minute > 59) {
    return null;
  }

  const parsed = DateTime.local().set({
    hour,
    minute,
    second: 0,
    millisecond: 0,
  });
  return parsed.isValid ? parsed : null;
}

/** Format a Luxon value as `HH:mm` for campaign APIs and validation. */
export function formatTimeHm(value: DateTime | null): string {
  if (!value?.isValid) {
    return '';
  }

  return value.toFormat('HH:mm');
}

export function minutesToTimeHm(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function getDefaultLaunchEndTimeHm(): string {
  return minutesToTimeHm(DEFAULT_SENDING_WINDOW_END_MINUTES);
}

export function getDefaultLaunchTimeHm(timezone: string): string {
  const now = DateTime.now().setZone(timezone);
  const rounded = now.plus({
    minutes: 15 - (now.minute % 15 || 15),
  });
  return rounded.toFormat('HH:mm');
}

export function buildLaunchAtIso(
  dateKey: string,
  timeHm: string,
  timezone: string,
): string | null {
  if (!dateKey.trim() || !timeHm.trim()) {
    return null;
  }

  const [hour, minute] = timeHm.split(':').map((part) => Number.parseInt(part, 10));
  const [year, month, day] = dateKey.split('-').map((part) => Number.parseInt(part, 10));

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }

  const zoned = DateTime.fromObject(
    { year, month, day, hour, minute },
    { zone: timezone },
  );

  if (!zoned.isValid) {
    return null;
  }

  return zoned.toUTC().toISO();
}

export function isScheduledLaunchInFuture(
  dateKey: string,
  timeHm: string,
  timezone: string,
): boolean {
  const iso = buildLaunchAtIso(dateKey, timeHm, timezone);
  if (!iso) {
    return false;
  }

  return DateTime.fromISO(iso).toMillis() > DateTime.now().toMillis();
}

export function validateSendingWindowEnd(
  mode: WhatsappCampaignScheduleMode,
  startTimeHm: string,
  endTimeHm: string,
  timezone: string,
): string | null {
  const endMinutes = timeHmToMinutes(endTimeHm);
  if (endMinutes == null) {
    return 'Choose a valid end time';
  }

  if (mode === 'scheduled') {
    const startMinutes = timeHmToMinutes(startTimeHm);
    if (startMinutes == null) {
      return null;
    }
    if (endMinutes <= startMinutes) {
      return 'End time must be after start time';
    }
    return null;
  }

  const now = DateTime.now().setZone(timezone);
  const nowMinutes = now.hour * 60 + now.minute;
  if (endMinutes <= nowMinutes) {
    return 'End time must be later today';
  }

  return null;
}

export function formatLaunchScheduleReview(
  mode: WhatsappCampaignScheduleMode,
  dateKey: string,
  timeHm: string,
  endTimeHm: string,
  timezone: string,
): string {
  const endMinutes = timeHmToMinutes(endTimeHm);
  const windowLabel =
    endMinutes != null
      ? formatSendingWindowDuration(
          mode === 'scheduled'
            ? (timeHmToMinutes(timeHm) ?? 0)
            : DateTime.now().setZone(timezone).hour * 60 +
              DateTime.now().setZone(timezone).minute,
          endMinutes,
        )
      : null;

  if (mode === 'immediate') {
    return windowLabel
      ? `Starts immediately · ${windowLabel}`
      : 'Starts immediately when you run the campaign';
  }

  const iso = buildLaunchAtIso(dateKey, timeHm, timezone);
  if (!iso) {
    return 'Set a valid date and time';
  }

  const launchLabel = DateTime.fromISO(iso)
    .setZone(timezone)
    .toLocaleString(DateTime.DATETIME_MED);

  return windowLabel ? `${launchLabel} · ${windowLabel}` : launchLabel;
}

export function resolveSendingWindowPayload(
  mode: WhatsappCampaignScheduleMode,
  launchAtIso: string,
  launchTimeHm: string,
  endTimeHm: string,
  timezone: string,
): {
  sendingWindowStartMinutes: number;
  sendingWindowEndMinutes: number;
} | null {
  const endMinutes = timeHmToMinutes(endTimeHm);
  if (endMinutes == null) {
    return null;
  }

  if (mode === 'scheduled') {
    const startMinutes = timeHmToMinutes(launchTimeHm);
    if (startMinutes == null) {
      return null;
    }

    return {
      sendingWindowStartMinutes: startMinutes,
      sendingWindowEndMinutes: endMinutes,
    };
  }

  const launchAt = DateTime.fromISO(launchAtIso).setZone(timezone);
  if (!launchAt.isValid) {
    return null;
  }

  return {
    sendingWindowStartMinutes: launchAt.hour * 60 + launchAt.minute,
    sendingWindowEndMinutes: endMinutes,
  };
}
