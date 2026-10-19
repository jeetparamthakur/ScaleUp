import type { WhatsappListFieldMapping } from '@/lib/whatsapp/lists/types';
import type { FormTableColumnDefinition } from '@/lib/forms/types';
import type { SchemaColumnMappingRowFormValues } from '@/lib/schemas/list-column-mapping';
import {
  autoMatchSourceColumn,
  buildMappingsFromTableColumns,
  buildPreviewRowsFromTableMappings,
  countAutoMatchedTableColumns,
  getPreviewColumnsFromTableMappings,
} from '@/lib/email/lists/list-column-mapping-utils';

export {
  autoMatchSourceColumn,
  buildMappingsFromTableColumns,
  buildPreviewRowsFromTableMappings,
  countAutoMatchedTableColumns,
  getPreviewColumnsFromTableMappings,
};

export function buildWhatsappFieldMappingFromTableColumnMappings(
  tableColumns: FormTableColumnDefinition[],
  mappings: SchemaColumnMappingRowFormValues[],
): WhatsappListFieldMapping {
  const phoneColumn = tableColumns.find((column) => column.type === 'phone');
  const phoneKey = phoneColumn?.key ?? 'phone';
  const phoneMapping = mappings.find(
    (mapping) => mapping.targetColumnKey === phoneKey,
  );

  return {
    phone: phoneMapping?.sourceColumn.trim() ?? '',
    additionalFields: mappings
      .filter(
        (mapping) =>
          mapping.targetColumnKey !== phoneKey && mapping.sourceColumn.trim(),
      )
      .map((mapping) => ({
        key: mapping.targetColumnKey,
        sourceColumn: mapping.sourceColumn.trim(),
      })),
  };
}
