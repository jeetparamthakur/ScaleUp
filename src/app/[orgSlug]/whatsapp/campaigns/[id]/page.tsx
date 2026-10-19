import WhatsappCampaignDetailContent from '@/components/whatsapp/campaigns/detail/WhatsappCampaignDetailContent';
import WhatsAppHubShell from '@/components/whatsapp/WhatsAppHubShell';
import { requireWhatsappModule } from '@/lib/whatsapp/require-whatsapp-module';

interface WhatsappCampaignDetailPageProps {
  params: Promise<{ orgSlug: string; id: string }>;
}

export default async function WhatsappCampaignDetailPage({
  params,
}: WhatsappCampaignDetailPageProps) {
  const { orgSlug, id } = await params;
  await requireWhatsappModule(orgSlug);

  return (
    <WhatsAppHubShell hideHeader>
      <WhatsappCampaignDetailContent campaignId={id} />
    </WhatsAppHubShell>
  );
}
