import { redirect } from 'next/navigation';
import { orgPath } from '@/lib/org-path';
import { requireWhatsappModule } from '@/lib/whatsapp/require-whatsapp-module';

interface WhatsappContactsNewPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function WhatsappContactsNewPage({
  params,
}: WhatsappContactsNewPageProps) {
  const { orgSlug } = await params;
  await requireWhatsappModule(orgSlug);

  redirect(orgPath(orgSlug, '/whatsapp/contacts'));
}
