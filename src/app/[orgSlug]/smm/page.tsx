import { redirect } from 'next/navigation';
import DashboardContent from '@/components/dashboard/DashboardContent';
import SmmContent from '@/components/smm/SmmContent';
import { getSession } from '@/lib/auth/session';
import { isPlatformOwner } from '@/lib/api/types/auth.types';
import { isOrgModuleEnabled } from '@/lib/org-entitlements/workspace-access';
import { resolveWorkspaceHomePath } from '@/lib/workspace-navigation';
import { orgPath } from '@/lib/org-path';

interface SmmPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function SmmPage({ params }: SmmPageProps) {
  const { orgSlug } = await params;
  const session = await getSession();
  const enabledModules = session?.organization?.enabledModules;

  if (!isOrgModuleEnabled(enabledModules, 'smm')) {
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
      <SmmContent />
    </DashboardContent>
  );
}
