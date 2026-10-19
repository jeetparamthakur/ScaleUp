import type { ReactNode } from 'react';

type Segment =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'strike'; value: string }
  | { type: 'mono'; value: string };

function parseInlineSegments(input: string): Segment[] {
  const segments: Segment[] = [];
  let index = 0;

  while (index < input.length) {
    const monoStart = input.indexOf('```', index);
    const boldStart = input.indexOf('*', index);
    const italicStart = input.indexOf('_', index);
    const strikeStart = input.indexOf('~', index);

    const candidates = [
      monoStart >= 0 ? monoStart : Number.POSITIVE_INFINITY,
      boldStart >= 0 ? boldStart : Number.POSITIVE_INFINITY,
      italicStart >= 0 ? italicStart : Number.POSITIVE_INFINITY,
      strikeStart >= 0 ? strikeStart : Number.POSITIVE_INFINITY,
    ];
    const next = Math.min(...candidates);

    if (!Number.isFinite(next)) {
      segments.push({ type: 'text', value: input.slice(index) });
      break;
    }

    if (next > index) {
      segments.push({ type: 'text', value: input.slice(index, next) });
    }

    if (next === monoStart) {
      const end = input.indexOf('```', monoStart + 3);
      if (end === -1) {
        segments.push({ type: 'text', value: input.slice(monoStart) });
        break;
      }
      segments.push({ type: 'mono', value: input.slice(monoStart + 3, end) });
      index = end + 3;
      continue;
    }

    if (next === boldStart) {
      const end = input.indexOf('*', boldStart + 1);
      if (end === -1) {
        segments.push({ type: 'text', value: input.slice(boldStart) });
        break;
      }
      const inner = input.slice(boldStart + 1, end);
      if (inner.trim()) {
        segments.push({ type: 'bold', value: inner });
      } else {
        segments.push({ type: 'text', value: '**' });
      }
      index = end + 1;
      continue;
    }

    if (next === italicStart) {
      const end = input.indexOf('_', italicStart + 1);
      if (end === -1) {
        segments.push({ type: 'text', value: input.slice(italicStart) });
        break;
      }
      const inner = input.slice(italicStart + 1, end);
      if (inner.trim()) {
        segments.push({ type: 'italic', value: inner });
      } else {
        segments.push({ type: 'text', value: '__' });
      }
      index = end + 1;
      continue;
    }

    if (next === strikeStart) {
      const end = input.indexOf('~', strikeStart + 1);
      if (end === -1) {
        segments.push({ type: 'text', value: input.slice(strikeStart) });
        break;
      }
      const inner = input.slice(strikeStart + 1, end);
      if (inner.trim()) {
        segments.push({ type: 'strike', value: inner });
      } else {
        segments.push({ type: 'text', value: '~~' });
      }
      index = end + 1;
      continue;
    }
  }

  return segments;
}

function renderSegments(segments: Segment[]): ReactNode[] {
  return segments.map((segment, segmentIndex) => {
    if (segment.type === 'text') {
      return segment.value;
    }
    if (segment.type === 'bold') {
      return (
        <strong key={`b-${segmentIndex}`} className="font-semibold">
          {segment.value}
        </strong>
      );
    }
    if (segment.type === 'italic') {
      return <em key={`i-${segmentIndex}`}>{segment.value}</em>;
    }
    if (segment.type === 'strike') {
      return (
        <span key={`s-${segmentIndex}`} className="line-through">
          {segment.value}
        </span>
      );
    }
    return (
      <code
        key={`m-${segmentIndex}`}
        className="rounded bg-black/5 px-1 py-0.5 font-mono text-[0.92em]"
      >
        {segment.value}
      </code>
    );
  });
}

export function renderWhatsappFormattedMessage(text: string): ReactNode {
  if (!text) {
    return null;
  }

  const lines = text.split('\n');
  return lines.map((line, lineIndex) => (
    <span key={`line-${lineIndex}`}>
      {renderSegments(parseInlineSegments(line))}
      {lineIndex < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

export const WHATSAPP_MESSAGE_MAX_LENGTH = 4096;
