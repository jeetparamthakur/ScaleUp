export const CRM_PROSPECT_CREATE_FORM_KEY = 'crm.prospect.create';
export const CRM_COMPANY_CREATE_FORM_KEY = 'crm.company.create';
export const WHATSAPP_LIST_IMPORT_FORM_KEY = 'whatsapp.list.contact.import';

/** Forms editable via org Settings → Manage Forms and Platform → Forms. */
export const MANAGEABLE_FORM_KEYS = [
  CRM_PROSPECT_CREATE_FORM_KEY,
  CRM_COMPANY_CREATE_FORM_KEY,
  'email.list.contact.add',
  WHATSAPP_LIST_IMPORT_FORM_KEY,
  'crm.meeting.create',
  'settings.bant',
  'crm.engagement.log',
] as const;

export type ManageableFormKey = (typeof MANAGEABLE_FORM_KEYS)[number];

const MANAGEABLE_FORM_KEY_SET = new Set<string>(MANAGEABLE_FORM_KEYS);

export function isManageableFormKey(formKey: string): boolean {
  return MANAGEABLE_FORM_KEY_SET.has(formKey);
}

export function isWhatsappListImportFormKey(formKey: string): boolean {
  return formKey === WHATSAPP_LIST_IMPORT_FORM_KEY;
}

/** WhatsApp list columns are edited on Layout (prospect-style); not a separate Tables tab. */
export function formKeyShowsTablesEditorTab(formKey: string): boolean {
  return !isWhatsappListImportFormKey(formKey);
}

