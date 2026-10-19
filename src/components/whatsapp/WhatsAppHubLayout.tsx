'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { usePathname } from 'next/navigation';
import { getWhatsappTabByHref } from '@/lib/whatsapp/navigation';

interface WhatsAppHubLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  hideHeader?: boolean;
  viewportFill?: boolean;
}

export default function WhatsAppHubLayout({
  children,
  actions,
  hideHeader = false,
  viewportFill = false,
}: WhatsAppHubLayoutProps) {
  const pathname = usePathname();
  const activeTab = getWhatsappTabByHref(pathname);

  return (
    <Stack
      spacing={viewportFill ? 0 : 3}
      className={
        viewportFill ? 'flex h-full min-h-0 flex-1 flex-col overflow-hidden' : undefined
      }
    >
      {hideHeader ? null : (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h4" component="h1" className="font-bold">
              {activeTab?.label ?? 'WhatsApp'}
            </Typography>
            {activeTab?.description ? (
              <Typography variant="body1" color="text.secondary" className="mt-1">
                {activeTab.description}
              </Typography>
            ) : null}
          </Box>
          {actions ? <Box className="shrink-0">{actions}</Box> : null}
        </Stack>
      )}

      <Box
        className={
          viewportFill ? 'flex min-h-0 flex-1 flex-col overflow-hidden' : undefined
        }
      >
        {children}
      </Box>
    </Stack>
  );
}
