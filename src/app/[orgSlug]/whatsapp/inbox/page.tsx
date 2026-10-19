import WhatsAppInboxContent from '@/components/inbox/WhatsAppInboxContent';
import WhatsAppHubShell from '@/components/whatsapp/WhatsAppHubShell';
import { requireWhatsappModule } from '@/lib/whatsapp/require-whatsapp-module';

interface WhatsappInboxPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function WhatsappInboxPage({ params }: WhatsappInboxPageProps) {
  const { orgSlug } = await params;
  await requireWhatsappModule(orgSlug);

  return (
    <WhatsAppHubShell hideHeader viewportFill>
      <WhatsAppInboxContent />
    </WhatsAppHubShell>
  );
}
