'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import AppText from '@/components/ui/AppText';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { typographyScale, type TypographyRole } from '@/theme/typography';
import {
  DatePicker,
  DateRangePicker,
  Input,
  SearchSelect,
  Textarea,
} from '@/components/ui/inputs';

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time', keywords: 'ET NYC' },
  { value: 'America/Chicago', label: 'Central Time', keywords: 'CT' },
  { value: 'Europe/London', label: 'London', keywords: 'GMT BST' },
  { value: 'Asia/Kolkata', label: 'India', keywords: 'IST' },
];

export default function PlatformDesignSystemContent() {
  const [text, setText] = useState('Sample value');
  const [select, setSelect] = useState('America/New_York');
  const [date, setDate] = useState('2026-10-16');
  const [range, setRange] = useState({ from: '2026-10-01', to: '2026-10-16' });
  const [notes, setNotes] = useState('');

  return (
    <Box className="mx-auto max-w-3xl p-6 md:p-10">
      <Stack spacing={1} className="mb-8">
        <Stack
          direction="row"
          className="items-center justify-between gap-4"
        >
          <Typography variant="h4" component="h1" className="font-bold">
            Design system — inputs
          </Typography>
          <ThemeToggle />
        </Stack>
        <Typography variant="body2" className="text-muted">
          Theme tokens, typography, and control primitives. Toggle light/dark to
          verify colors.
        </Typography>
      </Stack>

      <Stack spacing={4}>
        <section className="surface-panel p-6">
          <AppText variant="subtitle" className="mb-4">
            Typography scale
          </AppText>
          <Stack spacing={2}>
            {(
              [
                'display',
                'h1',
                'h2',
                'h3',
                'h4',
                'subheading',
                'subtitle',
                'body',
                'body-sm',
                'caption',
                'overline',
                'label',
              ] as TypographyRole[]
            ).map((role) => (
              <Stack
                key={role}
                direction="row"
                className="items-baseline justify-between gap-4 border-b border-[var(--surface-border)] pb-2 last:border-0"
              >
                <AppText variant={role} as="span">
                  {role === 'overline' ? 'Section label' : 'The quick brown fox'}
                </AppText>
                <Typography
                  variant="caption"
                  component="span"
                  className="text-muted shrink-0 font-mono"
                >
                  {typographyScale[role].fontSize} / {typographyScale[role].fontWeight}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </section>

        <section>
          <Typography variant="subtitle2" className="mb-3 font-semibold">
            Text input
          </Typography>
          <Stack spacing={3}>
            <Input
              id="ds-default"
              label="Default"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type here"
            />
            <Input
              id="ds-error"
              label="With error"
              value=""
              onChange={() => undefined}
              error="This field is required"
            />
            <Input
              id="ds-disabled"
              label="Disabled"
              value="Read only"
              onChange={() => undefined}
              disabled
            />
          </Stack>
        </section>

        <section>
          <Typography variant="subtitle2" className="mb-3 font-semibold">
            Search select
          </Typography>
          <SearchSelect
            id="ds-search-select"
            label="Timezone"
            value={select}
            onChange={setSelect}
            options={TIMEZONE_OPTIONS}
            searchPlaceholder="Filter timezones"
          />
        </section>

        <section>
          <Typography variant="subtitle2" className="mb-3 font-semibold">
            Date picker
          </Typography>
          <DatePicker
            id="ds-date"
            label="Launch date"
            value={date}
            onChange={setDate}
          />
        </section>

        <section>
          <Typography variant="subtitle2" className="mb-3 font-semibold">
            Date range picker
          </Typography>
          <DateRangePicker
            id="ds-range"
            label="Reporting window"
            value={range}
            onChange={setRange}
          />
        </section>

        <section>
          <Typography variant="subtitle2" className="mb-3 font-semibold">
            Textarea
          </Typography>
          <Textarea
            id="ds-textarea"
            label="Notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Multi-line content"
          />
        </section>
      </Stack>
    </Box>
  );
}
