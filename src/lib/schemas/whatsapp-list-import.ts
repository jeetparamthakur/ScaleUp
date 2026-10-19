import { z } from 'zod';
import type { FormTableColumnDefinition } from '@/lib/forms/types';
import {
  createListColumnMappingsSchema,
  schemaColumnMappingRowSchema,
  type SchemaColumnMappingRowFormValues,
} from '@/lib/schemas/list-column-mapping';

export const whatsappListImportStep1Schema = z.object({
  name: z.string().trim().min(1, 'List name is required').max(255),
  visibility: z.enum(['org', 'private']),
});

export function createWhatsappListImportWizardSchema(
  tableColumns: FormTableColumnDefinition[],
) {
  return whatsappListImportStep1Schema.extend({
    columnMappings: createListColumnMappingsSchema(tableColumns),
  });
}

export type WhatsappListImportWizardFormValues = z.infer<
  ReturnType<typeof createWhatsappListImportWizardSchema>
>;

export const WHATSAPP_LIST_IMPORT_WIZARD_DEFAULT_VALUES: WhatsappListImportWizardFormValues =
  {
    name: '',
    visibility: 'org',
    columnMappings: [],
  };

export const WHATSAPP_LIST_IMPORT_WIZARD_STEPS = [
  { id: 'upload', label: 'Upload file' },
  { id: 'mapping', label: 'Match columns' },
  { id: 'review', label: 'Review & import' },
] as const;

export type WhatsappListImportWizardStepId =
  (typeof WHATSAPP_LIST_IMPORT_WIZARD_STEPS)[number]['id'];

export type { SchemaColumnMappingRowFormValues };
export { schemaColumnMappingRowSchema };
