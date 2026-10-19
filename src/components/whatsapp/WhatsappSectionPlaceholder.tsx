'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface WhatsappSectionPlaceholderProps {
  title: string;
  description?: string;
}

export default function WhatsappSectionPlaceholder({
  title,
  description = 'Coming soon — this section is under development.',
}: WhatsappSectionPlaceholderProps) {
  return (
    <Card className="dashboard-panel rounded-2xl shadow-none">
      <CardContent className="px-6 py-14 text-center">
        <Typography variant="h6" className="font-bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
