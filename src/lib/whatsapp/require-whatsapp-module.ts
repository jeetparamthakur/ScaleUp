import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { isPlatformOwner } from '@/lib/api/types/auth.types';
import { isOrgModuleEnabled } from '@/lib/org-entitlements/workspace-access';
import { resolveWorkspaceHomePath } from '@/lib/workspace-navigation';
import { orgPath } from '@/lib/org-path';

export async function requireWhatsappModule(orgSlug: string): Promise<void> {
  const session = await getSession();
  const enabledModules = session?.organization?.enabledModules;

  if (!isOrgModuleEnabled(enabledModules, 'whatsapp')) {
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
}
