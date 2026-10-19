import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import XIcon from '@mui/icons-material/X';
import type { SvgIconComponent } from '@mui/icons-material';

export type InboxChannelId =
  | 'linkedin'
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'x';

export interface InboxChannelDefinition {
  id: InboxChannelId;
  label: string;
  description: string;
  icon: SvgIconComponent;
}

export const inboxChannels: InboxChannelDefinition[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    description: 'Messages and connection requests from LinkedIn.',
    icon: LinkedInIcon,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Business chats and customer conversations on WhatsApp.',
    icon: WhatsAppIcon,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    description: 'Page messages and comments from Facebook.',
    icon: FacebookIcon,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    description: 'Direct messages and engagement from Instagram.',
    icon: InstagramIcon,
  },
  {
    id: 'x',
    label: 'X',
    description: 'Direct messages and mentions on X.',
    icon: XIcon,
  },
];
