import WhatsAppHubShell from '@/components/whatsapp/WhatsAppHubShell';
import WhatsappTemplateFormContent from '@/components/whatsapp/templates/WhatsappTemplateFormContent';
import { requireWhatsappModule } from '@/lib/whatsapp/require-whatsapp-module';

interface EditWhatsappTemplatePageProps {
  params: Promise<{ orgSlug: string; id: string }>;
}

export default async function EditWhatsappTemplatePage({
  params,
}: EditWhatsappTemplatePageProps) {
  const { orgSlug, id } = await params;
  await requireWhatsappModule(orgSlug);

  return (
    <WhatsAppHubShell hideHeader>
      <WhatsappTemplateFormContent mode="edit" templateId={id} />
    </WhatsAppHubShell>
  );
}
