import WhatsAppHubShell from '@/components/whatsapp/WhatsAppHubShell';
import WhatsappCreateTemplateButton from '@/components/whatsapp/templates/WhatsappCreateTemplateButton';
import WhatsappTemplateListContent from '@/components/whatsapp/templates/WhatsappTemplateListContent';
import { requireWhatsappModule } from '@/lib/whatsapp/require-whatsapp-module';

interface WhatsappTemplatesPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function WhatsappTemplatesPage({
  params,
}: WhatsappTemplatesPageProps) {
  const { orgSlug } = await params;
  await requireWhatsappModule(orgSlug);

  return (
    <WhatsAppHubShell actions={<WhatsappCreateTemplateButton />}>
      <WhatsappTemplateListContent />
    </WhatsAppHubShell>
  );
}
