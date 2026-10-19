'use client';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import WhatsappCrmProspectImportDialog from '@/components/whatsapp/contacts/crm/WhatsappCrmProspectImportDialog';
import WhatsappListImportFlow, {
  type WhatsappListImportSuccessResult,
} from '@/components/whatsapp/contacts/import/WhatsappListImportFlow';
import { useCanWhatsappImportFromCrm } from '@/hooks/useCanWhatsappImportFromCrm';
import { useWhatsappContactLists } from '@/hooks/useWhatsappContactLists';
import { getApiErrorMessage } from '@/lib/api';

interface WhatsappListImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (result: WhatsappListImportSuccessResult) => void;
}

type ImportSourceTab = 'file' | 'crm';

export default function WhatsappListImportDialog({
  open,
  onClose,
  onSuccess,
}: WhatsappListImportDialogProps) {
  const canImportFromCrm = useCanWhatsappImportFromCrm();
  const [tab, setTab] = useState<ImportSourceTab>('file');
  const [crmError, setCrmError] = useState<string | null>(null);
  const { importFromProspects, isImportingFromProspects } =
    useWhatsappContactLists();

  function handleClose() {
    setTab('file');
    setCrmError(null);
    onClose();
  }

  async function handleCrmCreate(input: {
    name: string;
    visibility: 'org' | 'private';
    prospectIds: string[];
  }) {
    setCrmError(null);

    try {
      const result = await importFromProspects(input);
      handleClose();
      onSuccess({
        id: result.list.id,
        name: result.list.name,
        count: result.importedCount,
        skipped: result.skippedCount,
      });
    } catch (error) {
      setCrmError(getApiErrorMessage(error, 'Unable to import from CRM'));
    }
  }

  const showTabs = canImportFromCrm;
  const isCrmTab = showTabs && tab === 'crm';
  const maxWidth = isCrmTab ? 'lg' : 'sm';

  if (isCrmTab) {
    return (
      <WhatsappCrmProspectImportDialog
        open={open}
        mode="create"
        isSubmitting={isImportingFromProspects}
        error={crmError}
        onClose={handleClose}
        onSubmitCreate={handleCrmCreate}
        onSubmitAppend={async () => undefined}
      />
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={maxWidth}
      scroll="paper"
      slotProps={{
        paper: {
          className: 'rounded-2xl',
          sx: { width: '100%', maxWidth: showTabs ? undefined : 520 },
        },
      }}
    >
      <DialogTitle
        sx={{ py: 2, px: 2.5 }}
        className="flex flex-col items-stretch gap-2"
      >
        <div className="flex items-start justify-between gap-2">
          <Typography variant="subtitle1" component="span" className="font-bold">
            Import WhatsApp list
          </Typography>
          <IconButton
            aria-label="Close import dialog"
            onClick={handleClose}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
        {showTabs ? (
          <Tabs
            value={tab}
            onChange={(_event, value: ImportSourceTab) => setTab(value)}
            aria-label="Import source"
          >
            <Tab label="Upload file" value="file" />
            <Tab label="From CRM" value="crm" />
          </Tabs>
        ) : null}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'visible',
        }}
      >
        <WhatsappListImportFlow
          embedded
          onCancel={handleClose}
          onSuccess={(result) => {
            handleClose();
            onSuccess(result);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
