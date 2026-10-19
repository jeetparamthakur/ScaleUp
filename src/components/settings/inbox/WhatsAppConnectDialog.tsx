'use client';

import WhatsappConnectDialog from '@/components/whatsapp/connect/WhatsappConnectDialog';
import { useWhatsappQr } from '@/hooks/useWhatsappInbox';

interface WhatsAppConnectDialogProps {
  open: boolean;
  onClose: () => void;
  onConnected: () => void;
  onDisconnect: () => Promise<void>;
  isDisconnecting: boolean;
}

export default function WhatsAppConnectDialog({
  open,
  onClose,
  onConnected,
  onDisconnect,
  isDisconnecting,
}: WhatsAppConnectDialogProps) {
  const qrQuery = useWhatsappQr(open);

  return (
    <WhatsappConnectDialog
      open={open}
      onClose={onClose}
      onConnected={onConnected}
      onDisconnect={onDisconnect}
      isDisconnecting={isDisconnecting}
      qrQuery={{
        data: qrQuery.data ?? undefined,
        error: qrQuery.error,
        isLoading: qrQuery.isLoading,
        isFetching: qrQuery.isFetching,
      }}
      connectedHelperText="Messages from this number will sync to your workspace inbox."
    />
  );
}
