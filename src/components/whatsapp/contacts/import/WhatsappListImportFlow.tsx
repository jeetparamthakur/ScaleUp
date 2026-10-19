'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import {
  FormProvider,
  useForm,
  useWatch,
  type FieldErrors,
} from 'react-hook-form';
import ListImportStepper from '@/components/email/lists/import/ListImportStepper';
import ListColumnMappingStep from '@/components/email/lists/import/steps/ListColumnMappingStep';
import ReviewStep from '@/components/email/lists/import/steps/ReviewStep';
import WhatsappListUploadStep from '@/components/whatsapp/contacts/import/steps/WhatsappListUploadStep';
import { useWhatsappContactLists } from '@/hooks/useWhatsappContactLists';
import { useFormSchema } from '@/hooks/useForms';
import { useNotify } from '@/hooks/useNotify';
import { getApiErrorMessage, whatsappContactListsService } from '@/lib/api';
import {
  buildMappingsFromTableColumns,
  buildWhatsappFieldMappingFromTableColumnMappings,
} from '@/lib/whatsapp/lists/list-column-mapping-utils';
import type { WhatsappListImportPreview } from '@/lib/whatsapp/lists/types';
import type { FormTableColumnDefinition } from '@/lib/forms/types';
import {
  WHATSAPP_LIST_IMPORT_WIZARD_DEFAULT_VALUES,
  WHATSAPP_LIST_IMPORT_WIZARD_STEPS,
  createWhatsappListImportWizardSchema,
  whatsappListImportStep1Schema,
  type WhatsappListImportWizardFormValues,
} from '@/lib/schemas/whatsapp-list-import';
import { WHATSAPP_LIST_IMPORT_FORM_KEY } from '@/lib/forms/crm-form-keys';
import { toListColumnMappingTargets } from '@/lib/schemas/list-column-mapping';

export interface WhatsappListImportSuccessResult {
  id: string;
  name: string;
  count: number;
  skipped: number;
}

interface WhatsappListImportFlowProps {
  embedded?: boolean;
  onCancel: () => void;
  onSuccess: (result: WhatsappListImportSuccessResult) => void;
}

interface WhatsappListImportFlowLoadedProps
  extends WhatsappListImportFlowProps {
  tableColumns: FormTableColumnDefinition[];
}

function resolveImportFormError(
  errors: FieldErrors<WhatsappListImportWizardFormValues>,
): string {
  if (errors.name?.message) {
    return String(errors.name.message);
  }

  const columnMappingsError = errors.columnMappings;

  if (Array.isArray(columnMappingsError)) {
    for (const rowError of columnMappingsError) {
      if (rowError?.sourceColumn?.message) {
        return String(rowError.sourceColumn.message);
      }
    }
  }

  if (
    columnMappingsError &&
    typeof columnMappingsError === 'object' &&
    'message' in columnMappingsError &&
    columnMappingsError.message
  ) {
    return String(columnMappingsError.message);
  }

  return 'Complete all required fields before continuing.';
}

export default function WhatsappListImportFlow(props: WhatsappListImportFlowProps) {
  const { data: importSchema, isLoading: isSchemaLoading } = useFormSchema(
    WHATSAPP_LIST_IMPORT_FORM_KEY,
  );
  const tableColumns = useMemo(
    () => importSchema?.tableColumns ?? [],
    [importSchema?.tableColumns],
  );

  if (isSchemaLoading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading import column settings...
      </Typography>
    );
  }

  if (tableColumns.length === 0) {
    return (
      <Alert severity="warning" className="rounded-2xl">
        No import columns are configured. Ask an admin to set up table columns
        in Manage Forms before importing a WhatsApp list.
      </Alert>
    );
  }

  return (
    <WhatsappListImportFlowLoaded {...props} tableColumns={tableColumns} />
  );
}

function WhatsappListImportFlowLoaded({
  embedded = false,
  onCancel,
  onSuccess,
  tableColumns,
}: WhatsappListImportFlowLoadedProps) {
  const { notify } = useNotify();
  const { importList } = useWhatsappContactLists();
  const targetColumns = useMemo(
    () => toListColumnMappingTargets(tableColumns),
    [tableColumns],
  );

  const wizardSchema = useMemo(
    () => createWhatsappListImportWizardSchema(tableColumns),
    [tableColumns],
  );

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<WhatsappListImportPreview | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<WhatsappListImportWizardFormValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: WHATSAPP_LIST_IMPORT_WIZARD_DEFAULT_VALUES,
    mode: 'onTouched',
  });

  const activeStep = WHATSAPP_LIST_IMPORT_WIZARD_STEPS[activeStepIndex];
  const isFirstStep = activeStepIndex === 0;
  const isLastStep =
    activeStepIndex === WHATSAPP_LIST_IMPORT_WIZARD_STEPS.length - 1;

  async function handleFileSelect(file: File) {
    setSaveError(null);

    const isNameValid = await form.trigger(['name', 'visibility']);
    if (!isNameValid) {
      notify('Please enter a list name before uploading your file.', {
        variant: 'warning',
      });
      setSaveError(resolveImportFormError(form.formState.errors));
      return;
    }

    setSelectedFile(file);
    setIsPreviewLoading(true);

    try {
      const previewResult = await whatsappContactListsService.previewImport(file);
      setPreview(previewResult);

      form.setValue(
        'columnMappings',
        buildMappingsFromTableColumns(tableColumns, previewResult.columns),
      );

      if (activeStepIndex === 0) {
        setActiveStepIndex(1);
      }
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Unable to preview file'));
      setPreview(null);
    } finally {
      setIsPreviewLoading(false);
    }
  }

  async function handleNext() {
    setSaveError(null);

    if (isFirstStep) {
      const isValid = await form.trigger(['name', 'visibility']);

      if (!isValid) {
        setSaveError(resolveImportFormError(form.formState.errors));
        return;
      }

      if (!selectedFile || !preview) {
        setSaveError('Upload a file to continue.');
        return;
      }

      setActiveStepIndex(1);
      return;
    }

    if (activeStep.id === 'mapping') {
      const isValid = await form.trigger(['name', 'visibility', 'columnMappings']);

      if (!isValid) {
        setSaveError(resolveImportFormError(form.formState.errors));
        return;
      }

      setActiveStepIndex(2);
    }
  }

  function handleBack() {
    setSaveError(null);
    setActiveStepIndex((current) => Math.max(current - 1, 0));
  }

  async function handleImport() {
    setSaveError(null);

    if (!selectedFile || !preview) {
      setSaveError('Upload a file before importing.');
      return;
    }

    const isValid = await form.trigger();

    if (!isValid) {
      setSaveError(resolveImportFormError(form.formState.errors));
      return;
    }

    setIsSaving(true);

    try {
      const values = form.getValues();
      const result = await importList(selectedFile, {
        name: values.name.trim(),
        visibility: values.visibility,
        fieldMapping: buildWhatsappFieldMappingFromTableColumnMappings(
          tableColumns,
          values.columnMappings,
        ),
      });

      onSuccess({
        id: result.list.id,
        name: result.list.name,
        count: result.importedCount,
        skipped: result.skippedCount,
      });
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Unable to import list'));
    } finally {
      setIsSaving(false);
    }
  }

  const watchedName = useWatch({ control: form.control, name: 'name' }) ?? '';

  const step1Valid = whatsappListImportStep1Schema.safeParse({
    name: watchedName,
    visibility: form.getValues('visibility'),
  }).success;

  const reviewValues = form.getValues();

  return (
    <Stack spacing={embedded ? 2 : 4}>
      <ListImportStepper
        activeStepIndex={activeStepIndex}
        compact={embedded}
      />

      <Box sx={embedded ? { pt: 0.5 } : undefined}>
        <FormProvider {...form}>
          {activeStep.id === 'upload' ? (
            <WhatsappListUploadStep
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              isPreviewLoading={isPreviewLoading}
              compact={embedded}
            />
          ) : null}

          {activeStep.id === 'mapping' && preview ? (
            <ListColumnMappingStep
              targetColumns={targetColumns}
              fileColumns={preview.columns}
              compact={embedded}
            />
          ) : null}

          {activeStep.id === 'review' && preview && selectedFile ? (
            <ReviewStep
              preview={preview}
              selectedFile={selectedFile}
              values={reviewValues}
              targetColumns={targetColumns}
            />
          ) : null}
        </FormProvider>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          ...(embedded
            ? {
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                pt: 2,
              }
            : undefined),
        }}
      >
        {saveError ? (
          <Alert severity="error" className="mb-2 rounded-xl">
            {saveError}
          </Alert>
        ) : null}

        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          spacing={1.5}
          sx={{ justifyContent: 'space-between' }}
        >
        <Button
          type="button"
          variant="outlined"
          size={embedded ? 'small' : 'medium'}
          startIcon={<ArrowBackIcon />}
          onClick={isFirstStep ? onCancel : handleBack}
          className="rounded-xl"
        >
          {isFirstStep ? 'Cancel' : 'Back'}
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            variant="contained"
            size={embedded ? 'small' : 'medium'}
            onClick={() => void handleImport()}
            disabled={isSaving}
            className="rounded-xl px-4 shadow-primary-soft"
          >
            {isSaving ? 'Creating...' : 'Create list'}
          </Button>
        ) : (
          <Button
            type="button"
            variant="contained"
            size={embedded ? 'small' : 'medium'}
            endIcon={<ArrowForwardIcon />}
            onClick={() => void handleNext()}
            disabled={
              isFirstStep
                ? !step1Valid || !selectedFile || isPreviewLoading
                : false
            }
            className="rounded-xl px-4 shadow-primary-soft"
          >
            {activeStep.id === 'upload'
              ? 'Next: Match columns →'
              : 'Next: Review →'}
          </Button>
        )}
        </Stack>
      </Box>
    </Stack>
  );
}
