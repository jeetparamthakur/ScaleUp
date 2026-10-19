import WhatsappCampaignsPageContent from '@/components/whatsapp/campaigns/WhatsappCampaignsPageContent';
import { requireWhatsappModule } from '@/lib/whatsapp/require-whatsapp-module';

interface WhatsappCampaignsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function WhatsappCampaignsPage({ params }: WhatsappCampaignsPageProps) {
  const { orgSlug } = await params;
  await requireWhatsappModule(orgSlug);

  return <WhatsappCampaignsPageContent />;
}
