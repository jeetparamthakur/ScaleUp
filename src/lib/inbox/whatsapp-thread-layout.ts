import type { WhatsappMessage } from '@/lib/inbox/whatsapp-types';

export type WhatsappThreadRow =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'cluster'; key: string; messages: WhatsappMessage[] };

function calendarDayKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toDateString();
}

function sameClusterGroup(a: WhatsappMessage, b: WhatsappMessage): boolean {
  return (
    a.fromMe === b.fromMe &&
    calendarDayKey(a.sentAt) === calendarDayKey(b.sentAt)
  );
}

/** Flat messages → day dividers and consecutive bubble clusters (same sender, same day). */
export function buildWhatsappThreadRows(messages: WhatsappMessage[]): WhatsappThreadRow[] {
  const rows: WhatsappThreadRow[] = [];
  let lastDayKey = '';

  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index];
    const dayKey = calendarDayKey(message.sentAt);

    if (dayKey !== lastDayKey) {
      lastDayKey = dayKey;
      rows.push({
        kind: 'day',
        key: `day-${dayKey}-${message.id}`,
        label: formatThreadDayLabel(message.sentAt),
      });
    }

    const cluster: WhatsappMessage[] = [message];
    while (
      index + 1 < messages.length &&
      sameClusterGroup(message, messages[index + 1])
    ) {
      index += 1;
      cluster.push(messages[index]);
    }

    rows.push({
      kind: 'cluster',
      key: `cluster-${cluster[0].id}`,
      messages: cluster,
    });
  }

  return rows;
}

export function formatThreadDayLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000);

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export type BubbleGroupPosition = 'single' | 'first' | 'middle' | 'last';

export function bubbleGroupPosition(
  indexInCluster: number,
  clusterSize: number,
): BubbleGroupPosition {
  if (clusterSize <= 1) {
    return 'single';
  }
  if (indexInCluster === 0) {
    return 'first';
  }
  if (indexInCluster === clusterSize - 1) {
    return 'last';
  }
  return 'middle';
}

export function bubbleClusterSpacingClass(position: BubbleGroupPosition): string {
  switch (position) {
    case 'first':
    case 'middle':
      return 'mb-[3px]';
    case 'last':
    case 'single':
      return 'mb-0';
    default:
      return 'mb-0';
  }
}

export function bubbleShapeClass(
  fromMe: boolean,
  position: BubbleGroupPosition,
): string {
  if (fromMe) {
    switch (position) {
      case 'single':
        return 'rounded-lg rounded-br-sm';
      case 'first':
        return 'rounded-lg rounded-br-[4px]';
      case 'middle':
        return 'rounded-lg rounded-br-[4px] rounded-tr-[4px]';
      case 'last':
        return 'rounded-lg rounded-tr-[4px] rounded-br-sm';
      default:
        return 'rounded-lg rounded-br-sm';
    }
  }

  switch (position) {
    case 'single':
      return 'rounded-lg rounded-bl-sm';
    case 'first':
      return 'rounded-lg rounded-bl-[4px]';
    case 'middle':
      return 'rounded-lg rounded-bl-[4px] rounded-tl-[4px]';
    case 'last':
      return 'rounded-lg rounded-tl-[4px] rounded-bl-sm';
    default:
      return 'rounded-lg rounded-bl-sm';
  }
}
