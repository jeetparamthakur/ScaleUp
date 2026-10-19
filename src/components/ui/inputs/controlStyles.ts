import { cn } from '@/lib/cn';

export function controlShellClass(
  invalid?: boolean,
  disabled?: boolean,
  className?: string,
) {
  return cn(
    'control-base',
    invalid && 'border-[var(--control-border-error)]',
    className,
  );
}

export function controlShellDataAttrs(invalid?: boolean, disabled?: boolean) {
  return {
    'data-invalid': invalid ? 'true' : undefined,
    'data-disabled': disabled ? 'true' : undefined,
  } as const;
}

/** Above MUI Dialog (`theme.zIndex.modal` = 1300); matches snackbars in NotificationProvider. */
export const popoverContentClass = cn(
  'z-[1400] w-[var(--radix-popover-trigger-width)] min-w-[16rem] rounded-[var(--control-radius)] border border-[var(--control-border)] bg-[var(--surface)] p-2 shadow-lg outline-none',
);

export const listOptionClass = cn(
  'cursor-pointer rounded-md px-3 py-2 text-sm text-[var(--foreground)] outline-none',
  'data-[highlighted=true]:bg-primary-soft data-[highlighted=true]:text-primary',
  'data-[selected=true]:font-semibold',
);
