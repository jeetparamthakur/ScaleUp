'use client';

import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/cn';

export interface InputButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export default function InputButton({
  className,
  type = 'button',
  asChild = false,
  ...props
}: InputButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center px-2 text-muted transition-colors',
        'hover:text-[var(--foreground)] focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
