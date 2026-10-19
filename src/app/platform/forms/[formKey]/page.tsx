import { redirect } from 'next/navigation';
import PlatformFormEditorContent from '@/components/platform/PlatformFormEditorContent';
import Box from '@mui/material/Box';
import {
  CRM_PROSPECT_CREATE_FORM_KEY,
  isManageableFormKey,
} from '@/lib/forms/crm-form-keys';

interface PlatformFormEditorPageProps {
  params: Promise<{ formKey: string }>;
}

export default async function PlatformFormEditorPage({
  params,
}: PlatformFormEditorPageProps) {
  const { formKey } = await params;
  const decodedFormKey = decodeURIComponent(formKey);

  if (!isManageableFormKey(decodedFormKey)) {
    redirect(
      `/platform/forms/${encodeURIComponent(CRM_PROSPECT_CREATE_FORM_KEY)}`,
    );
  }

  return (
    <Box
      className="platform-chrome dashboard-chrome-x flex h-full min-h-0 w-full flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-8 xl:px-10"
    >
      <PlatformFormEditorContent formKey={decodedFormKey} />
    </Box>
  );
}
