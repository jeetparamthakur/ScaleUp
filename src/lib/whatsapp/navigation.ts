import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import { getOrgSlugFromPathname, stripOrgPrefix } from '@/lib/org-path';

export const WHATSAPP_TEMPLATES_HREF = '/whatsapp/templates';

export const whatsappTemplateMeta = {
  label: 'WhatsApp template',
  pluralLabel: 'Templates',
  description:
    'Reusable WhatsApp messages and follow-up sequences for campaigns.',
  href: WHATSAPP_TEMPLATES_HREF,
  icon: DescriptionOutlinedIcon,
};

export interface WhatsappTab {
  label: string;
  href: string;
  icon: SvgIconComponent;
  description?: string;
  requiredPermission?: string;
  requiredAnyPermissions?: string[];
}

export const whatsappPrimaryTabs: WhatsappTab[] = [
  {
    label: 'Dashboard',
    href: '/whatsapp/dashboard',
    icon: BarChartOutlinedIcon,
    description: 'Delivery, read rates, and engagement trends.',
  },
  {
    label: 'Inbox',
    href: '/whatsapp/inbox',
    icon: InboxOutlinedIcon,
    description: 'Chats and replies from your connected WhatsApp senders.',
    requiredPermission: 'whatsapp:read',
  },
  {
    label: 'W Campaign',
    href: '/whatsapp/campaigns',
    icon: CampaignOutlinedIcon,
    description: 'Create, schedule, and manage WhatsApp broadcast campaigns.',
  },
  {
    label: 'Contacts',
    href: '/whatsapp/contacts',
    icon: ContactsOutlinedIcon,
    description: 'WhatsApp audience, opt-in lists, and contact segments.',
  },
  {
    label: whatsappTemplateMeta.pluralLabel,
    href: whatsappTemplateMeta.href,
    icon: whatsappTemplateMeta.icon,
    description: whatsappTemplateMeta.description,
    requiredPermission: 'whatsapp-templates:read',
  },
];

export const whatsappSecondaryTabs: WhatsappTab[] = [
  {
    label: 'Settings',
    href: '/whatsapp/settings',
    icon: TuneOutlinedIcon,
    description: 'Connection, message templates, and compliance settings.',
  },
];

export const whatsappTabs: WhatsappTab[] = [
  ...whatsappPrimaryTabs,
  ...whatsappSecondaryTabs,
];

function toOrgRelativePath(pathname: string): string {
  const orgSlug = getOrgSlugFromPathname(pathname);
  return orgSlug ? stripOrgPrefix(pathname, orgSlug) : pathname;
}

export function getWhatsappTabByHref(pathname: string): WhatsappTab | undefined {
  const relativePath = toOrgRelativePath(pathname);

  if (relativePath.startsWith('/whatsapp/settings')) {
    return whatsappTabs.find((tab) => tab.href === '/whatsapp/settings');
  }

  if (relativePath.startsWith('/whatsapp/contacts')) {
    return whatsappTabs.find((tab) => tab.href === '/whatsapp/contacts');
  }

  if (relativePath.startsWith('/whatsapp/inbox')) {
    return whatsappTabs.find((tab) => tab.href === '/whatsapp/inbox');
  }

  if (relativePath.startsWith('/whatsapp/templates')) {
    return whatsappTabs.find((tab) => tab.href === whatsappTemplateMeta.href);
  }

  return whatsappTabs.find((tab) => relativePath.startsWith(tab.href));
}

export function getWhatsappPageTitle(pathname: string): string | null {
  const relativePath = toOrgRelativePath(pathname);

  if (relativePath.startsWith('/whatsapp/settings')) {
    return 'Settings';
  }

  if (relativePath === '/whatsapp/templates/new') {
    return 'Create WhatsApp template';
  }

  if (/^\/whatsapp\/templates\/[^/]+$/.test(relativePath)) {
    return 'Edit WhatsApp template';
  }

  const whatsappTab = getWhatsappTabByHref(pathname);
  return whatsappTab?.label ?? null;
}
