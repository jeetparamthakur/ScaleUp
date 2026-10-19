export type Meridiem = 'AM' | 'PM';

export interface TimeHmParts {
  hour24: number;
  minute: number;
}

export function parseTimeHmString(value: string): TimeHmParts | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const [hourPart, minutePart] = trimmed.split(':');
  const hour24 = Number.parseInt(hourPart, 10);
  const minute = Number.parseInt(minutePart, 10);
  if (
    !Number.isFinite(hour24) ||
    !Number.isFinite(minute) ||
    hour24 < 0 ||
    hour24 > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return { hour24, minute };
}

export function partsToTimeHm(hour24: number, minute: number): string {
  const hour = Math.min(23, Math.max(0, hour24));
  const min = Math.min(59, Math.max(0, minute));
  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export function to12Hour(hour24: number): { hour12: number; meridiem: Meridiem } {
  const meridiem: Meridiem = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, meridiem };
}

export function from12Hour(hour12: number, meridiem: Meridiem): number {
  if (meridiem === 'AM') {
    return hour12 === 12 ? 0 : hour12;
  }

  return hour12 === 12 ? 12 : hour12 + 12;
}

export function formatTimeHmDisplay(value: string): string {
  const parts = parseTimeHmString(value);
  if (!parts) {
    return '';
  }

  const { hour12, meridiem } = to12Hour(parts.hour24);
  return `${String(hour12).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')} ${meridiem}`;
}

export function stepSecondsToMinuteStep(stepSeconds: number): number {
  const minutes = Math.max(1, Math.round(stepSeconds / 60));
  return Math.min(60, minutes);
}

export function buildMinuteOptions(minuteStep: number): number[] {
  const step = Math.max(1, minuteStep);
  const options: number[] = [];
  for (let minute = 0; minute < 60; minute += step) {
    options.push(minute);
  }
  return options;
}

export function snapMinuteToStep(minute: number, minuteStep: number): number {
  const step = Math.max(1, minuteStep);
  const snapped = Math.round(minute / step) * step;
  return Math.min(59, Math.max(0, snapped));
}

export const HOUR_12_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

export const MERIDIEM_OPTIONS: Meridiem[] = ['AM', 'PM'];
