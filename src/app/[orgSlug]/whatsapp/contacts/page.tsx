import WhatsappContactsHub from '@/components/whatsapp/contacts/WhatsappContactsHub';
import { requireWhatsappModule } from '@/lib/whatsapp/require-whatsapp-module';

interface WhatsappContactsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function WhatsappContactsPage({
  params,
}: WhatsappContactsPageProps) {
  const { orgSlug } = await params;
  await requireWhatsappModule(orgSlug);

  return <WhatsappContactsHub />;
}
