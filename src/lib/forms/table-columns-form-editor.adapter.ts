import { isSectionFieldType } from '@/lib/crm/fields/section-field.utils';
import type {
  FormFieldDefinition,
  FormFieldType,
  FormTableColumnDefinition,
  FormTableColumnType,
} from '@/lib/forms/types';

const TABLE_COLUMN_TYPES = new Set<FormTableColumnType>([
  'text',
  'email',
  'phone',
  'number',
  'date',
]);

function fieldTypeToTableColumnType(type: FormFieldType): FormTableColumnType {
  if (TABLE_COLUMN_TYPES.has(type as FormTableColumnType)) {
    return type as FormTableColumnType;
  }

  return 'text';
}

export function editorFieldsFromTableColumns(
  columns: FormTableColumnDefinition[],
): FormFieldDefinition[] {
  return [...columns]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((column, index) => ({
      id: column.id,
      key: column.key,
      label: column.label,
      type: column.type as FormFieldType,
      required: column.required,
      sortOrder: index,
      system: column.system,
      source: column.source,
      showInForm: true,
      showInTable: true,
    }));
}

export function tableColumnsFromEditorFields(
  fields: FormFieldDefinition[],
): FormTableColumnDefinition[] {
  return fields
    .filter((field) => !isSectionFieldType(field.type))
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((field, index) => ({
      id: field.id,
      key: field.key,
      label: field.label,
      type: fieldTypeToTableColumnType(field.type),
      required: field.system ? true : Boolean(field.required),
      sortOrder: index,
      system: field.system,
      source: field.source,
    }));
}
