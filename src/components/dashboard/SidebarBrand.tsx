'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { env } from '@/config/env';

interface SidebarBrandProps {
  isExpanded: boolean;
  orgSlug: string;
}

function getBrandInitial(brandName: string): string {
  const trimmed = brandName.trim();
  if (!trimmed) {
    return 'M';
  }

  return trimmed.charAt(0).toUpperCase();
}

export default function SidebarBrand({ isExpanded, orgSlug }: SidebarBrandProps) {
  const brandInitial = getBrandInitial(env.brandName);

  return (
    <Box
      className={`sidebar-brand-zone relative flex shrink-0 items-center px-3 ${
        isExpanded ? 'gap-3' : 'justify-center'
      }`}
    >
      <Box className="brand-mark sidebar-brand-mark flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-bold">
        {brandInitial}
      </Box>

      <Box
        className={`relative z-[1] min-w-0 overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? 'w-auto translate-x-0 opacity-100' : 'w-0 -translate-x-2 opacity-0'
        }`}
      >
        <Typography variant="subtitle1" className="truncate font-bold leading-none text-white">
          {env.brandName}
        </Typography>
        <Typography
          variant="caption"
          className="mt-1 block truncate font-mono text-[11px] text-white/70"
        >
          /{orgSlug}
        </Typography>
      </Box>
    </Box>
  );
}
