import Box from '@mui/material/Box';

interface DashboardContentProps {
  children: React.ReactNode;
  /** Fill the dashboard main area so nested editors can use flex + internal scroll. */
  viewportFill?: boolean;
}

export default function DashboardContent({
  children,
  viewportFill = false,
}: DashboardContentProps) {
  return (
    <Box
      className={
        viewportFill
          ? 'dashboard-content flex h-full min-h-0 w-full flex-col overflow-x-hidden overflow-y-hidden px-4 pb-4 pt-5 sm:px-6 lg:px-8 xl:px-10'
          : 'dashboard-content w-full px-4 py-6 sm:px-6 md:py-8 lg:px-8 xl:px-10'
      }
    >
      {children}
    </Box>
  );
}
