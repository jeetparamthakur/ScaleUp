import WhatsappSettingsContent from '@/components/whatsapp/settings/WhatsappSettingsContent';
import WhatsAppHubShell from '@/components/whatsapp/WhatsAppHubShell';
import { requireWhatsappModule } from '@/lib/whatsapp/require-whatsapp-module';

interface WhatsappSettingsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function WhatsappSettingsPage({ params }: WhatsappSettingsPageProps) {
  const { orgSlug } = await params;
  await requireWhatsappModule(orgSlug);

  return (
    <WhatsAppHubShell>
      <WhatsappSettingsContent />
    </WhatsAppHubShell>
  );
}
