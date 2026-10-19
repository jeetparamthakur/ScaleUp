import WhatsAppHubShell from '@/components/whatsapp/WhatsAppHubShell';
import WhatsappTemplateFormContent from '@/components/whatsapp/templates/WhatsappTemplateFormContent';
import { requireWhatsappModule } from '@/lib/whatsapp/require-whatsapp-module';

interface NewWhatsappTemplatePageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function NewWhatsappTemplatePage({
  params,
}: NewWhatsappTemplatePageProps) {
  const { orgSlug } = await params;
  await requireWhatsappModule(orgSlug);

  return (
    <WhatsAppHubShell hideHeader>
      <WhatsappTemplateFormContent mode="create" />
    </WhatsAppHubShell>
  );
}
