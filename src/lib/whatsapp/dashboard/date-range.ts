export const WHATSAPP_DASHBOARD_MAX_RANGE_DAYS = 90;

function formatUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDateKey(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  if (formatUtcDateKey(parsed) !== value) {
    return null;
  }
  return parsed;
}

function addUtcDays(dateKey: string, days: number): string {
  const parsed = parseDateKey(dateKey);
  if (!parsed) {
    return dateKey;
  }
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return formatUtcDateKey(parsed);
}

function daysBetweenInclusive(dateFrom: string, dateTo: string): number {
  const from = parseDateKey(dateFrom);
  const to = parseDateKey(dateTo);
  if (!from || !to) {
    return 0;
  }
  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
}

export interface WhatsappDashboardDateRange {
  dateFrom: string;
  dateTo: string;
}

export function getDefaultWhatsappDashboardDateRange(
  now: Date = new Date(),
): WhatsappDashboardDateRange {
  const end = new Date(now);
  end.setUTCHours(0, 0, 0, 0);
  const dateTo = formatUtcDateKey(end);
  const dateFrom = addUtcDays(dateTo, -29);
  return { dateFrom, dateTo };
}

export function clampWhatsappDashboardDateRange(
  range: WhatsappDashboardDateRange,
): WhatsappDashboardDateRange {
  let { dateFrom, dateTo } = range;

  if (!parseDateKey(dateFrom) || !parseDateKey(dateTo)) {
    return getDefaultWhatsappDashboardDateRange();
  }

  if (dateFrom > dateTo) {
    [dateFrom, dateTo] = [dateTo, dateFrom];
  }

  const span = daysBetweenInclusive(dateFrom, dateTo);
  if (span > WHATSAPP_DASHBOARD_MAX_RANGE_DAYS) {
    dateFrom = addUtcDays(dateTo, -(WHATSAPP_DASHBOARD_MAX_RANGE_DAYS - 1));
  }

  return { dateFrom, dateTo };
}

export function formatWhatsappDashboardDateRangeLabel(
  dateFrom: string,
  dateTo: string,
): string {
  const fromLabel = formatTrendDisplayDate(dateFrom);
  const toLabel = formatTrendDisplayDate(dateTo);
  if (dateFrom === dateTo) {
    return fromLabel;
  }
  return `${fromLabel} – ${toLabel}`;
}

function formatTrendDisplayDate(isoDate: string): string {
  const parsed = parseDateKey(isoDate);
  if (!parsed) {
    return isoDate;
  }
  // Fixed locale so SSR (Node) and the browser render the same label (avoids hydration mismatch).
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
