'use client';

import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useNotify } from '@/hooks/useNotify';
import type { WhatsappListImportWizardFormValues } from '@/lib/schemas/whatsapp-list-import';

const LIST_NAME_REQUIRED_MESSAGE =
  'Please enter a list name before uploading your file.';

const ACCEPTED_EXTENSIONS = '.csv,.xlsx,.xls,.json,.txt,.pdf';

interface WhatsappListUploadStepProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  isPreviewLoading: boolean;
  compact?: boolean;
}

export default function WhatsappListUploadStep({
  selectedFile,
  onFileSelect,
  isPreviewLoading,
  compact = false,
}: WhatsappListUploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { notify } = useNotify();
  const { control, getValues, setError, clearErrors } =
    useFormContext<WhatsappListImportWizardFormValues>();

  function hasListName(): boolean {
    return getValues('name').trim().length > 0;
  }

  function showListNameRequiredFeedback() {
    notify(LIST_NAME_REQUIRED_MESSAGE, { variant: 'warning' });
    setError('name', {
      type: 'manual',
      message: 'List name is required',
    });
  }

  function handleUploadClick() {
    if (isPreviewLoading) {
      return;
    }

    if (!hasListName()) {
      showListNameRequiredFeedback();
      return;
    }

    clearErrors('name');
    inputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!hasListName()) {
      showListNameRequiredFeedback();
      return;
    }

    clearErrors('name');
    onFileSelect(file);
  }

  return (
    <Stack spacing={compact ? 2 : 3}>
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) =>
          compact ? (
            <Stack spacing={0.75}>
              <Typography
                component="label"
                variant="caption"
                color="text.secondary"
                className="font-medium"
                htmlFor="whatsapp-list-import-name"
              >
                List name
              </Typography>
              <TextField
                {...field}
                id="whatsapp-list-import-name"
                placeholder="e.g. Q1 outreach"
                fullWidth
                size="small"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                slotProps={{
                  input: {
                    sx: {
                      minHeight: 40,
                      '& input': { py: 1 },
                    },
                  },
                }}
              />
            </Stack>
          ) : (
            <TextField
              {...field}
              label="List name"
              placeholder="e.g. Q1 outreach"
              fullWidth
              size="small"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )
        }
      />

      <Controller
        name="visibility"
        control={control}
        render={({ field }) => (
          <FormControl size="small" margin={compact ? 'dense' : 'none'}>
            <Typography variant="caption" color="text.secondary" className="mb-0.5 block">
              Who can access this list?
            </Typography>
            <RadioGroup row {...field} sx={{ mt: -0.5 }}>
              <FormControlLabel
                value="org"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Organization</Typography>}
              />
              <FormControlLabel
                value="private"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Only me</Typography>}
              />
            </RadioGroup>
          </FormControl>
        )}
      />

      <Box>
        <Box
          role="button"
          tabIndex={0}
          onClick={handleUploadClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleUploadClick();
            }
          }}
          className="cursor-pointer rounded-xl border border-dashed border-border bg-surface px-4 py-5 text-center transition-colors hover:border-primary/40"
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            className="hidden"
            onChange={handleFileChange}
          />
          <Box className="mx-auto mb-1.5 inline-flex rounded-xl bg-primary-soft p-2 text-primary">
            <CloudUploadOutlinedIcon fontSize="small" />
          </Box>
          <Typography variant="body2" className="font-semibold">
            {isPreviewLoading ? 'Reading file...' : 'Click to upload'}
          </Typography>
          <Typography variant="caption" color="text.secondary" className="mt-0.5 block">
            CSV, Excel, JSON, TXT, or PDF
          </Typography>
          {selectedFile ? (
            <Stack
              direction="row"
              spacing={1}
              className="mx-auto mt-2 inline-flex items-center rounded-lg border border-border bg-background px-2.5 py-1"
            >
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 16 }} color="primary" />
              <Typography variant="caption" className="font-medium">
                {selectedFile.name}
              </Typography>
            </Stack>
          ) : null}
        </Box>
      </Box>
    </Stack>
  );
}
