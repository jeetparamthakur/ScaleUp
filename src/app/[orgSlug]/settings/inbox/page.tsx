import { redirect } from 'next/navigation';
import DashboardContent from '@/components/dashboard/DashboardContent';
import InboxConnectSettingsContent from '@/components/settings/inbox/InboxConnectSettingsContent';
import { getSession } from '@/lib/auth/session';
import { isPlatformOwner } from '@/lib/api/types/auth.types';
import { isOrgModuleEnabled } from '@/lib/org-entitlements/workspace-access';
import { resolveWorkspaceHomePath } from '@/lib/workspace-navigation';
import { orgPath } from '@/lib/org-path';

interface InboxSettingsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function InboxSettingsPage({ params }: InboxSettingsPageProps) {
  const { orgSlug } = await params;
  const session = await getSession();
  const enabledModules = session?.organization?.enabledModules;

  if (!isOrgModuleEnabled(enabledModules, 'inbox')) {
    redirect(
      orgPath(
        orgSlug,
        resolveWorkspaceHomePath(
          enabledModules,
          session?.permissions ?? [],
          isPlatformOwner(session),
        ),
      ),
    );
  }

  return (
    <DashboardContent>
      <InboxConnectSettingsContent />
    </DashboardContent>
  );
}
