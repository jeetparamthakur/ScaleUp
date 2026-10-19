import { redirect } from 'next/navigation';
import { requireWhatsappModule } from '@/lib/whatsapp/require-whatsapp-module';
import { orgPath } from '@/lib/org-path';

interface WhatsappPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function WhatsappPage({ params }: WhatsappPageProps) {
  const { orgSlug } = await params;
  await requireWhatsappModule(orgSlug);
  redirect(orgPath(orgSlug, '/whatsapp/dashboard'));
}
