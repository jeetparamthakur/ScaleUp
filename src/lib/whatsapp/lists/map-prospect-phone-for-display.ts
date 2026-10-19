import type { FieldStoredValue } from '@/lib/crm/location/types';
import type { ProspectFieldDefinition } from '@/lib/crm/prospects/types';

function fieldValueToString(value: FieldStoredValue | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    return '';
  }

  return String(value).trim();
}

export function resolveProspectPhoneDisplay(
  values: Record<string, FieldStoredValue>,
  fields: ProspectFieldDefinition[],
): string {
  const phoneFieldKeys = fields
    .filter((field) => field.type === 'phone')
    .map((field) => field.key);

  for (const key of phoneFieldKeys) {
    const raw = fieldValueToString(values[key]);
    if (raw) {
      return raw;
    }
  }

  return '';
}

const MIN_PHONE_DIGITS = 8;
const MAX_PHONE_DIGITS = 15;

export function isImportableProspectPhone(
  values: Record<string, FieldStoredValue>,
  fields: ProspectFieldDefinition[],
): boolean {
  const raw = resolveProspectPhoneDisplay(values, fields);
  if (!raw) {
    return false;
  }

  const digits = raw.replace(/\D/g, '');
  return digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_PHONE_DIGITS;
}
