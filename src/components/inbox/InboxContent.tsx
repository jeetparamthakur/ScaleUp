'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { inboxChannels } from '@/lib/inbox/channels';
import { orgPath } from '@/lib/org-path';

export default function InboxContent() {
  const params = useParams<{ orgSlug: string }>();

  return (
    <Stack spacing={3}>
      <Box className="dashboard-hero surface-panel rounded-2xl p-6 md:p-8">
        <Box className="max-w-3xl">
          <Typography
            variant="overline"
            className="font-semibold tracking-[0.1em] text-primary"
          >
            Social
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            className="mt-2 text-3xl font-bold text-foreground md:text-4xl"
          >
            Inbox
          </Typography>
          <Typography variant="body1" color="text.secondary" className="mt-3 max-w-2xl">
            Choose a channel to view conversations. Connect accounts and workflows
            will be available here soon.
          </Typography>
        </Box>
      </Box>

      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {inboxChannels.map(({ id, label, description, icon: Icon }) => {
          const href =
            id === 'whatsapp' ? orgPath(params.orgSlug, '/whatsapp/inbox') : null;

          const card = (
          <Box
            className={`settings-hub-card surface-panel flex h-full flex-col rounded-2xl p-5 md:p-6 ${
              href ? 'transition-shadow hover:shadow-md' : ''
            }`}
          >
            <Stack spacing={2.5} className="flex-1">
              <Box className="settings-hub-card-icon">
                <Icon sx={{ fontSize: 22 }} aria-hidden />
              </Box>
              <Box className="min-w-0">
                <Typography variant="subtitle1" component="h2" className="font-semibold text-foreground">
                  {label}
                </Typography>
                <Typography variant="body2" className="mt-1.5 line-clamp-2 text-pretty text-muted">
                  {description}
                </Typography>
              </Box>
            </Stack>
          </Box>
          );

          if (href) {
            return (
              <Link key={id} href={href} className="block no-underline text-inherit">
                {card}
              </Link>
            );
          }

          return <Box key={id}>{card}</Box>;
        })}
      </Box>
    </Stack>
  );
}
