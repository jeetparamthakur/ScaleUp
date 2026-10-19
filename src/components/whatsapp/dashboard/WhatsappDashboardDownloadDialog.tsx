'use client';

import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { getApiErrorMessage } from '@/lib/api/client';
import { whatsappDashboardService } from '@/lib/api/services/whatsapp-dashboard.service';
import { formatWhatsappDashboardDateRangeLabel } from '@/lib/whatsapp/dashboard/date-range';
import { buildWhatsappDashboardReportFilename } from '@/lib/whatsapp/dashboard/report-filename';
import type {
  WhatsappDashboardQuery,
  WhatsappDashboardReportFormat,
} from '@/lib/whatsapp/dashboard/types';

interface WhatsappDashboardDownloadDialogProps {
  open: boolean;
  onClose: () => void;
  query: WhatsappDashboardQuery;
  campaignScopeLabel: string;
}

export default function WhatsappDashboardDownloadDialog({
  open,
  onClose,
  query,
  campaignScopeLabel,
}: WhatsappDashboardDownloadDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [downloadingFormat, setDownloadingFormat] =
    useState<WhatsappDashboardReportFormat | null>(null);

  const rangeLabel = formatWhatsappDashboardDateRangeLabel(
    query.dateFrom,
    query.dateTo,
  );

  async function handleDownload(format: WhatsappDashboardReportFormat) {
    setError(null);
    setDownloadingFormat(format);
    try {
      const filename = buildWhatsappDashboardReportFilename(
        query.dateFrom,
        query.dateTo,
        campaignScopeLabel,
        format,
      );
      await whatsappDashboardService.downloadReport(query, format, filename);
      onClose();
    } catch (downloadError) {
      setError(
        getApiErrorMessage(downloadError, 'Could not download the report.'),
      );
    } finally {
      setDownloadingFormat(null);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Download report</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {campaignScopeLabel} · {rangeLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-2">
          Includes summary KPIs, daily send trend, and campaign breakdown for the
          selected range.
        </Typography>
        {error ? (
          <Typography variant="body2" color="error" className="mt-3">
            {error}
          </Typography>
        ) : null}
        <Stack spacing={1.5} className="mt-4">
          <Button
            variant="outlined"
            startIcon={<TableChartOutlinedIcon />}
            onClick={() => void handleDownload('csv')}
            disabled={downloadingFormat !== null}
            className="justify-start rounded-2xl py-2.5"
          >
            {downloadingFormat === 'csv' ? 'Downloading…' : 'CSV spreadsheet'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfOutlinedIcon />}
            onClick={() => void handleDownload('pdf')}
            disabled={downloadingFormat !== null}
            className="justify-start rounded-2xl py-2.5"
          >
            {downloadingFormat === 'pdf' ? 'Downloading…' : 'PDF document'}
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={downloadingFormat !== null}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
