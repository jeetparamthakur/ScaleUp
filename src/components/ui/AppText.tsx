import type { ElementType, HTMLAttributes } from 'react';
import {
  typographyUtilityClass,
  type TypographyRole,
} from '@/theme/typography';
import { cn } from '@/lib/cn';

const defaultElement: Record<TypographyRole, ElementType> =
  {
    display: 'h1',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    subheading: 'p',
    subtitle: 'p',
    body: 'p',
    'body-sm': 'p',
    caption: 'span',
    overline: 'span',
    label: 'label',
  };

export interface AppTextProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyRole;
  as?: ElementType;
  muted?: boolean;
  balance?: boolean;
}

export default function AppText({
  variant = 'body',
  as,
  muted = false,
  balance = false,
  className,
  children,
  ...rest
}: AppTextProps) {
  const Component = as ?? defaultElement[variant];

  return (
    <Component
      className={cn(
        typographyUtilityClass[variant],
        muted && 'text-muted',
        balance && 'text-balance',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
