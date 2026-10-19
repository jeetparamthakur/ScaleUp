'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Suspense } from 'react';
import WhatsappChatLayout from '@/components/inbox/whatsapp/WhatsappChatLayout';

export default function WhatsAppInboxContent() {
  return (
    <Box className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Suspense
        fallback={
          <Box className="flex justify-center py-16">
            <CircularProgress />
          </Box>
        }
      >
        <WhatsappChatLayout />
      </Suspense>
    </Box>
  );
}
