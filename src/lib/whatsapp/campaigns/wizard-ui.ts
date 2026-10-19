/** 45px tall MUI OutlinedInput / Select roots in the WhatsApp campaign create modal. */
const WHATSAPP_CAMPAIGN_WIZARD_OUTLINED_INPUT_HEIGHT = [
  '[&_.MuiOutlinedInput-root]:flex [&_.MuiOutlinedInput-root]:h-[45px] [&_.MuiOutlinedInput-root]:max-h-[45px] [&_.MuiOutlinedInput-root]:min-h-[45px] [&_.MuiOutlinedInput-root]:items-center',
  '[&.MuiOutlinedInput-root]:flex [&.MuiOutlinedInput-root]:h-[45px] [&.MuiOutlinedInput-root]:max-h-[45px] [&.MuiOutlinedInput-root]:min-h-[45px] [&.MuiOutlinedInput-root]:items-center',
  '[&_.MuiOutlinedInput-input]:box-border [&_.MuiOutlinedInput-input]:h-full [&_.MuiOutlinedInput-input]:py-0',
  '[&.MuiOutlinedInput-root_.MuiOutlinedInput-input]:box-border [&.MuiOutlinedInput-root_.MuiOutlinedInput-input]:h-full [&.MuiOutlinedInput-root_.MuiOutlinedInput-input]:py-0',
].join(' ');

/** 45px tall MUI X DatePicker field root in the create modal. */
const WHATSAPP_CAMPAIGN_WIZARD_PICKERS_INPUT_HEIGHT =
  '[&_.MuiPickersInputBase-root]:flex [&_.MuiPickersInputBase-root]:h-[45px] [&_.MuiPickersInputBase-root]:max-h-[45px] [&_.MuiPickersInputBase-root]:min-h-[45px] [&_.MuiPickersInputBase-root]:items-center';

export const WHATSAPP_CAMPAIGN_WIZARD_FIELD_CLASS = [
  WHATSAPP_CAMPAIGN_WIZARD_OUTLINED_INPUT_HEIGHT,
  '[&_.MuiOutlinedInput-root]:rounded-xl [&_.MuiOutlinedInput-root]:bg-background',
  '[&.MuiOutlinedInput-root]:rounded-xl [&.MuiOutlinedInput-root]:bg-background',
].join(' ');

export const WHATSAPP_CAMPAIGN_WIZARD_FIELD_MUTED_CLASS = [
  WHATSAPP_CAMPAIGN_WIZARD_OUTLINED_INPUT_HEIGHT,
  '[&_.MuiOutlinedInput-root]:rounded-xl',
  '[&_.MuiOutlinedInput-root]:bg-muted/30',
  '[&_.MuiOutlinedInput-notchedOutline]:border-surface-border',
  '[&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-[color-mix(in_srgb,var(--color-secondary)_35%,var(--surface-border))]',
  '[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary/45',
].join(' ');

export const WHATSAPP_CAMPAIGN_WIZARD_DATE_FIELD_CLASS = [
  WHATSAPP_CAMPAIGN_WIZARD_PICKERS_INPUT_HEIGHT,
  'rounded-xl',
  '[&_.MuiPickersInputBase-root]:rounded-xl',
  '[&_.MuiPickersInputBase-root]:bg-background',
].join(' ');

/** Bordered section (no shadow) for lightweight fields in the create modal. */
export const WHATSAPP_CAMPAIGN_WIZARD_BORDER_SECTION =
  'rounded-2xl border border-surface-border p-4 md:p-5';

/** Grey elevated surfaces for the WhatsApp campaign create modal (no stroke borders). */
export const WHATSAPP_CAMPAIGN_WIZARD_SECTION_CARD =
  'rounded-2xl bg-muted/40 p-4 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.22),0_4px_12px_-4px_rgba(15,23,42,0.14)] md:p-5 dark:bg-muted/25 dark:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.45),0_4px_12px_-4px_rgba(0,0,0,0.35)]';

export const WHATSAPP_CAMPAIGN_WIZARD_ITEM_CARD =
  'rounded-xl bg-background p-3.5 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.16)] transition-[box-shadow,background-color] hover:shadow-[0_8px_24px_-6px_rgba(15,23,42,0.2)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)]';

export const WHATSAPP_CAMPAIGN_WIZARD_ITEM_CARD_SELECTED =
  'rounded-xl bg-background p-3.5 shadow-[0_10px_28px_-6px_rgba(15,23,42,0.24)] ring-1 ring-primary/25 dark:shadow-[0_10px_28px_-6px_rgba(0,0,0,0.5)]';
