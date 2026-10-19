'use client';

import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { useOrgPath } from '@/hooks/useOrgPath';
import { whatsappTemplateMeta } from '@/lib/whatsapp/navigation';

export default function WhatsappCreateTemplateButton() {
  const toOrgPath = useOrgPath();

  return (
    <Button
      component={Link}
      href={toOrgPath(`${whatsappTemplateMeta.href}/new`)}
      variant="contained"
      startIcon={<AddIcon />}
      className="shrink-0 rounded-2xl px-5 py-2.5 shadow-primary-soft"
    >
      Create template
    </Button>
  );
}
