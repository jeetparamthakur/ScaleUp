'use client';

import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useImpersonation } from '@/contexts/impersonation';
import { useSession } from '@/hooks/useAuth';

interface SidebarFooterProps {
  isExpanded: boolean;
}

export default function SidebarFooter({ isExpanded }: SidebarFooterProps) {
  const { data: session } = useSession();
  const { organization: impersonatedOrganization, isImpersonating } =
    useImpersonation();
  const workspaceLabel =
    impersonatedOrganization?.name ?? session?.organization?.name ?? 'Workspace';
  const workspaceHint = isImpersonating
    ? 'Platform admin tenant view.'
    : 'Your organization workspace.';

  return (
    <Box className="sidebar-footer mt-auto border-t border-surface-border/80 px-3 py-4">
      {isExpanded ? (
        <Box
          className="sidebar-footer-expanded rounded-2xl border border-surface-border px-3 py-2.5"
          sx={{ background: 'var(--chrome-sidebar-rail-bg)' }}
        >
          <Typography variant="caption" className="block font-semibold text-primary">
            {workspaceLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary" className="mt-0.5 block leading-snug">
            {workspaceHint}
          </Typography>
        </Box>
      ) : (
        <Box className="flex flex-col items-center gap-1 text-muted" title="Hover to expand">
          <ChevronRightRoundedIcon sx={{ fontSize: 18 }} className="sidebar-footer-chevron" aria-hidden />
        </Box>
      )}
    </Box>
  );
}
