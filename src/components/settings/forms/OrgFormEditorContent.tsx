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
import { useFormMutations, useFormRegistry, useFormSchema } from '@/hooks/useForms';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOrgPath } from '@/hooks/useOrgPath';
import { getApiErrorMessage } from '@/lib/api';
import {
  formKeyShowsTablesEditorTab,
  isWhatsappListImportFormKey,
} from '@/lib/forms/crm-form-keys';
import { getDefaultFormModulesEditorTab } from '@/lib/forms/form-modules-editor-tab';
import {
  editorFieldsFromTableColumns,
  tableColumnsFromEditorFields,
} from '@/lib/forms/table-columns-form-editor.adapter';
import type { UpdateFormSchemaInput } from '@/lib/forms/types';

interface OrgFormEditorContentProps {
  formKey: string;
}

export default function OrgFormEditorContent({ formKey }: OrgFormEditorContentProps) {
  const router = useRouter();
  const toOrgPath = useOrgPath();
  const { notifyError, notifySuccess } = useNotify();
  const canUpdate = useHasPermission('forms:update');
  const { data, isLoading, error, refetch } = useFormSchema(formKey);
  const { data: registryData } = useFormRegistry();
  const { updateOrgSchema, isUpdatingOrg } = useFormMutations(formKey);

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

  async function handleSave(input: UpdateFormSchemaInput) {
    const payload: UpdateFormSchemaInput = isWhatsappImportForm
      ? {
          fields: [],
          tableColumns: tableColumnsFromEditorFields(input.fields),
          version: input.version,
        }
      : input;

    try {
      await updateOrgSchema(payload);
      await refetch();
      notifySuccess(
        activeTab === 'tables' || isWhatsappImportForm
          ? 'Table columns saved'
          : 'Form layout saved',
      );
    } catch (saveError) {
      notifyError(getApiErrorMessage(saveError, 'Unable to save form extensions'));
    }
  }

  function handleShellSave() {
    if (!editorState) {
      return;
    }
    void editorState.save();
  }

  function handleShellDiscard() {
    editorState?.discard();
  }

  function handleNavigateToFormKey(nextFormKey: string) {
    router.push(toOrgPath(`/settings/forms/${encodeURIComponent(nextFormKey)}`));
  }

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
      activeTab={resolvedActiveTab}
      onTabChange={setActiveTab}
      showTablesEditorTab={showTablesEditorTab}
      hasUnsavedChanges={editorState?.hasChanges ?? false}
      readOnly={!canUpdate}
      isSubmitting={isUpdatingOrg}
      onNavigateToFormKey={handleNavigateToFormKey}
      onDiscard={handleShellDiscard}
      onSave={handleShellSave}
    >
      {resolvedActiveTab === 'tables' && showTablesEditorTab ? (
        <FormTableColumnsEditor
          key={`tables-${formKey}-${data.version ?? 0}`}
          formKey={formKey}
          fields={data.fields}
          tableColumns={data.tableColumns ?? []}
          mode="org"
          readOnly={!canUpdate}
          version={data.version}
          isSubmitting={isUpdatingOrg}
          hideSaveBar
          onEditorStateChange={handleEditorStateChange}
          onCancel={() => router.push(toOrgPath('/settings/forms'))}
          onSubmit={handleSave}
        />
      ) : (
        <FormSchemaEditor
          key={`fields-${formKey}-${data.version ?? 0}-${isWhatsappImportForm ? (data.tableColumns?.length ?? 0) : data.fields.length}`}
          formKey={formKey}
          fields={editorFields}
          fieldKeysInUse={data.fieldKeysInUse}
          mode="org"
          readOnly={!canUpdate}
          layoutMode="modules"
          view={schemaView}
          isSubmitting={isUpdatingOrg}
          hideSaveBar
          onEditorStateChange={handleEditorStateChange}
          onCancel={() => router.push(toOrgPath('/settings/forms'))}
          onSubmit={handleSave}
        />
      )}
    </FormModulesEditorShell>
  );
}
