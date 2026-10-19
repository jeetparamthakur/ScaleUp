import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { isOrgModuleEnabled } from '@/lib/org-entitlements/workspace-access';
import { orgPath } from '@/lib/org-path';

interface WhatsappInboxRedirectPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function WhatsappInboxRedirectPage({
  params,
}: WhatsappInboxRedirectPageProps) {
  const { orgSlug } = await params;
  const session = await getSession();
  const enabledModules = session?.organization?.enabledModules;

  if (isOrgModuleEnabled(enabledModules, 'whatsapp')) {
    redirect(orgPath(orgSlug, '/whatsapp/inbox'));
  }

  redirect(orgPath(orgSlug, '/inbox'));
}
