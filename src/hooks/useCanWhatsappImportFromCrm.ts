'use client';

import { useHasPermission } from '@/hooks/useHasPermission';
import { useResolvedEnabledModules } from '@/hooks/useResolvedEnabledModules';
import { isOrgModuleEnabled } from '@/lib/org-entitlements/workspace-access';

export function useCanWhatsappImportFromCrm(): boolean {
  const enabledModules = useResolvedEnabledModules();
  const canReadProspects = useHasPermission('prospects:read');

  return isOrgModuleEnabled(enabledModules, 'crm') && canReadProspects;
}
