import WhatsappDashboardContent from '@/components/whatsapp/dashboard/WhatsappDashboardContent';
import WhatsAppHubShell from '@/components/whatsapp/WhatsAppHubShell';
import { requireWhatsappModule } from '@/lib/whatsapp/require-whatsapp-module';

interface WhatsappDashboardPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function WhatsappDashboardPage({ params }: WhatsappDashboardPageProps) {
  const { orgSlug } = await params;
  await requireWhatsappModule(orgSlug);

  return (
    <WhatsAppHubShell hideHeader>
      <WhatsappDashboardContent />
    </WhatsAppHubShell>
  );
}
