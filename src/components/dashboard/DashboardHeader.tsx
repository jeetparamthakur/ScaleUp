'use client';

import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import ColorModeToggle from '@/components/ColorModeToggle';
import NotificationBell from '@/components/dashboard/NotificationBell';
import ProfileMenu from '@/components/dashboard/ProfileMenu';
import { env } from '@/config/env';
import { useImpersonation } from '@/contexts/impersonation';
import { useSession } from '@/hooks/useAuth';
import { useOrgPath } from '@/hooks/useOrgPath';
import { useResolvedEnabledModules } from '@/hooks/useResolvedEnabledModules';
import { isPlatformOwner } from '@/lib/api/types/auth.types';
import { getOrgSlugFromPathname } from '@/lib/org-path';
import {
  getActiveWorkspaceModuleItem,
  getPageTitle,
  mapVisibleWorkspaceNavItems,
  workspaceNavItems,
} from '@/lib/workspace-navigation';

interface DashboardHeaderProps {
  onOpenMobileNav: () => void;
}

export default function DashboardHeader({ onOpenMobileNav }: DashboardHeaderProps) {
  const theme = useTheme();
  const isMobileNav = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const orgSlug = getOrgSlugFromPathname(pathname) ?? '';
  const toOrgPath = useOrgPath();
  const { data: session } = useSession();
  const { organization: impersonatedOrganization } = useImpersonation();
  const resolvedEnabledModules = useResolvedEnabledModules();
  const isSuperAdmin = isPlatformOwner(session);

  const permissions = useMemo(
    () => session?.permissions ?? [],
    [session?.permissions],
  );

  const navItems = useMemo(
    () =>
      mapVisibleWorkspaceNavItems(
        workspaceNavItems,
        resolvedEnabledModules,
        permissions,
        isSuperAdmin,
      ).map((item) => ({
        ...item,
        href: toOrgPath(item.href === '/' ? '' : item.href),
        children: item.children?.map((child) => ({
          ...child,
          href: toOrgPath(child.href),
        })),
      })),
    [isSuperAdmin, permissions, resolvedEnabledModules, toOrgPath],
  );

  const activeModule = useMemo(
    () => getActiveWorkspaceModuleItem(pathname, orgSlug, navItems),
    [navItems, orgSlug, pathname],
  );

  const pageTitle = getPageTitle(pathname);
  const moduleLabel = activeModule?.label ?? null;
  const contextLine = useMemo(() => {
    if (moduleLabel && pageTitle !== moduleLabel) {
      return `${moduleLabel} · ${pageTitle}`;
    }

    return moduleLabel ?? pageTitle;
  }, [moduleLabel, pageTitle]);

  const organizationName =
    impersonatedOrganization?.name ??
    session?.organization?.name ??
    session?.email ??
    env.brandName;

  const ModuleIcon = activeModule?.icon ?? WorkspacePremiumOutlinedIcon;

  return (
    <Box
      component="header"
      className="dashboard-command-bar dashboard-command-bar-intense"
      role="banner"
    >
      <Box className="dashboard-command-haze" aria-hidden="true" />
      <Box className="dashboard-command-accent" aria-hidden="true" />

      <Stack
        direction="row"
        spacing={1.5}
        className="dashboard-command-leading min-w-0 flex-1 items-center"
      >
        {isMobileNav ? (
          <IconButton
            aria-label="Open navigation"
            onClick={onOpenMobileNav}
            size="small"
            className="chrome-header-action shrink-0"
          >
            <MenuRoundedIcon fontSize="small" />
          </IconButton>
        ) : null}

        <Box className="dashboard-module-orb-wrap shrink-0">
          <Box className="dashboard-module-orb-ring" aria-hidden="true" />
          <Box className="dashboard-module-orb" aria-hidden="true">
            <ModuleIcon sx={{ fontSize: 22 }} />
          </Box>
        </Box>

        <Box className="min-w-0">
          <Typography
            component="h1"
            className="dashboard-command-title truncate"
          >
            {organizationName}
          </Typography>
          <Typography component="p" className="dashboard-command-context truncate">
            {contextLine}
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        className="dashboard-command-actions shrink-0"
        sx={{ alignItems: 'center' }}
      >
        <NotificationBell />
        <ColorModeToggle size="small" />
        <ProfileMenu />
      </Stack>
    </Box>
  );
}
