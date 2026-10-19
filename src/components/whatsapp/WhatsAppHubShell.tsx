import DashboardContent from '@/components/dashboard/DashboardContent';
import WhatsAppHubLayout from '@/components/whatsapp/WhatsAppHubLayout';

interface WhatsAppHubShellProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  hideHeader?: boolean;
  /** Fill dashboard main area; nested inbox panes scroll internally. */
  viewportFill?: boolean;
}

export default function WhatsAppHubShell({
  children,
  actions,
  hideHeader = false,
  viewportFill = false,
}: WhatsAppHubShellProps) {
  return (
    <DashboardContent viewportFill={viewportFill}>
      <WhatsAppHubLayout
        actions={actions}
        hideHeader={hideHeader}
        viewportFill={viewportFill}
      >
        {children}
      </WhatsAppHubLayout>
    </DashboardContent>
  );
}
