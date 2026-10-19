import WhatsappContactListDetailContent from '@/components/whatsapp/contacts/detail/WhatsappContactListDetailContent';
import WhatsAppHubShell from '@/components/whatsapp/WhatsAppHubShell';
import { requireWhatsappModule } from '@/lib/whatsapp/require-whatsapp-module';

interface WhatsappContactListDetailPageProps {
  params: Promise<{ orgSlug: string; id: string }>;
}

export default async function WhatsappContactListDetailPage({
  params,
}: WhatsappContactListDetailPageProps) {
  const { orgSlug, id } = await params;
  await requireWhatsappModule(orgSlug);

  return (
    <WhatsAppHubShell hideHeader>
      <WhatsappContactListDetailContent listId={id} />
    </WhatsAppHubShell>
  );
}
