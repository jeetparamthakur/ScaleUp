'use client';

import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEditorState } from '@/components/forms/form-editor-state';
import FormModulesEditorShell, {
  type FormModulesEditorTab,
} from '@/components/forms/FormModulesEditorShell';
import FormSchemaEditor from '@/components/forms/FormSchemaEditor';
import FormTableColumnsEditor from '@/components/forms/FormTableColumnsEditor';
import { useNotify } from '@/hooks/useNotify';
import {
  useFormMutations,
  usePlatformFormRegistry,
  usePlatformFormSchema,
} from '@/hooks/useForms';
import { getApiErrorMessage } from '@/lib/api';
import {
  formKeyShowsTablesEditorTab,
  isWhatsappListImportFormKey,
} from '@/lib/forms/crm-form-keys';
import { getDefaultFormModulesEditorTab } from '@/lib/forms/form-modules-editor-tab';
import {
  areFormSchemasEqual,
  areTableColumnsEqual,
} from '@/lib/forms/schema-compare';
import {
  editorFieldsFromTableColumns,
  tableColumnsFromEditorFields,
} from '@/lib/forms/table-columns-form-editor.adapter';
import type { UpdateFormSchemaInput } from '@/lib/forms/types';

interface PlatformFormEditorContentProps {
  formKey: string;
}

export default function PlatformFormEditorContent({
  formKey,
}: PlatformFormEditorContentProps) {
  const router = useRouter();
  const { notifyError, notifySuccess } = useNotify();
  const { data, isLoading, error } = usePlatformFormSchema(formKey);
  const { data: registryData } = usePlatformFormRegistry();
  const {
    updatePlatformSchema,
    publishPlatformSchema,
    isUpdatingPlatform,
    isPublishingPlatform,
  } = useFormMutations(formKey);

  const isWhatsappImportForm = isWhatsappListImportFormKey(formKey);

  const registryItem = useMemo(
    () => registryData?.forms.find((form) => form.key === formKey),
    [formKey, registryData?.forms],
  );

  const supportsTableColumns = registryItem?.supportsTableColumns ?? false;
  const showTablesEditorTab =
    supportsTableColumns && formKeyShowsTablesEditorTab(formKey);
  const [activeTab, setActiveTab] = useState<FormModulesEditorTab>('layout');
  const [editorState, setEditorState] = useState<FormEditorState | null>(null);
  const tabInitializedForFormKey = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading || !data) {
      return;
    }

    if (tabInitializedForFormKey.current === formKey) {
      return;
    }

    tabInitializedForFormKey.current = formKey;
    const fieldCount = isWhatsappImportForm
      ? (data.tableColumns?.length ?? 0)
      : data.fields.length;

    setActiveTab(
      getDefaultFormModulesEditorTab(
        supportsTableColumns,
        fieldCount,
        showTablesEditorTab,
      ),
    );
  }, [
    data,
    formKey,
    isLoading,
    isWhatsappImportForm,
    showTablesEditorTab,
    supportsTableColumns,
  ]);

  const handleEditorStateChange = useCallback((state: FormEditorState | null) => {
    setEditorState(state);
  }, []);

  async function handleSaveDraft(input: UpdateFormSchemaInput) {
    const payload: UpdateFormSchemaInput = isWhatsappImportForm
      ? {
          fields: [],
          tableColumns: tableColumnsFromEditorFields(input.fields),
          version: input.version,
        }
      : input;

    try {
      await updatePlatformSchema(payload);
      notifySuccess(
        activeTab === 'tables' || isWhatsappImportForm
          ? 'Draft table columns saved'
          : 'Draft layout saved — publish when ready for organizations',
      );
    } catch (saveError) {
      notifyError(getApiErrorMessage(saveError, 'Unable to save draft'));
    }
  }

  async function handlePublish() {
    try {
      if (editorState?.hasChanges) {
        await editorState.save();
      }

      await publishPlatformSchema();
      notifySuccess('Form published — organizations will see this layout');
    } catch (publishError) {
      notifyError(getApiErrorMessage(publishError, 'Unable to publish form'));
    }
  }

  function handleShellSaveDraft() {
    if (!editorState) {
      return;
    }
    void editorState.save();
  }

  function handleShellDiscard() {
    editorState?.discard();
  }

  function handleNavigateToFormKey(nextFormKey: string) {
    router.push(`/platform/forms/${encodeURIComponent(nextFormKey)}`);
  }

  const hasUnpublishedDraft = useMemo(() => {
    if (!data) {
      return false;
    }

    if (data.hasUnpublishedChanges) {
      return true;
    }

    if (data.publishedFields?.length) {
      if (!areFormSchemasEqual(data.fields, data.publishedFields)) {
        return true;
      }
    }

    if (supportsTableColumns && data.publishedTableColumns) {
      if (
        !areTableColumnsEqual(
          data.tableColumns ?? [],
          data.publishedTableColumns,
        )
      ) {
        return true;
      }
    }

    return false;
  }, [data, supportsTableColumns]);

  if (isLoading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading form schema...
      </Typography>
    );
  }

  if (error || !data) {
    return (
      <Alert severity="error" className="rounded-2xl">
        Unable to load form schema.
      </Alert>
    );
  }

  const resolvedActiveTab =
    !showTablesEditorTab && activeTab === 'tables' ? 'layout' : activeTab;

  const schemaView =
    resolvedActiveTab === 'summary' ? ('summary' as const) : ('layout' as const);

  const editorFields = isWhatsappImportForm
    ? editorFieldsFromTableColumns(data.tableColumns ?? [])
    : data.fields;

  return (
    <FormModulesEditorShell
      formKey={formKey}
      scope="platform"
      activeTab={resolvedActiveTab}
      onTabChange={setActiveTab}
      showTablesEditorTab={showTablesEditorTab}
      hasUnsavedChanges={editorState?.hasChanges ?? false}
      hasUnpublishedDraft={hasUnpublishedDraft}
      isSubmitting={isUpdatingPlatform}
      isPublishing={isPublishingPlatform}
      onNavigateToFormKey={handleNavigateToFormKey}
      onDiscard={handleShellDiscard}
      onSave={handleShellSaveDraft}
      onPublish={() => void handlePublish()}
    >
      {resolvedActiveTab === 'tables' && showTablesEditorTab ? (
        <FormTableColumnsEditor
          key={`tables-${formKey}-${data.version ?? 0}-${data.publishedVersion ?? 0}`}
          formKey={formKey}
          fields={data.fields}
          tableColumns={data.tableColumns ?? []}
          mode="platform"
          version={data.version}
          isSubmitting={isUpdatingPlatform}
          hideSaveBar
          onEditorStateChange={handleEditorStateChange}
          onCancel={() => router.push('/platform/forms')}
          onSubmit={handleSaveDraft}
        />
      ) : (
        <FormSchemaEditor
          key={`fields-${formKey}-${data.version ?? 0}-${data.publishedVersion ?? 0}-${isWhatsappImportForm ? (data.tableColumns?.length ?? 0) : data.fields.length}`}
          formKey={formKey}
          fields={editorFields}
          mode="platform"
          schemaVersion={data.version}
          layoutMode="modules"
          view={schemaView}
          isSubmitting={isUpdatingPlatform}
          hideSaveBar
          onEditorStateChange={handleEditorStateChange}
          onCancel={() => router.push('/platform/forms')}
          onSubmit={handleSaveDraft}
        />
      )}
    </FormModulesEditorShell>
  );
}
