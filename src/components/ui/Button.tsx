import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Icon, type IconName } from './Icon';

/**
 * Button — one component for `<button>`, `<a>` and `<Link>` so spacing,
 * radius and focus rings stay identical everywhere.
 * Minimum touch target 44px on mobile (WCAG 2.5.5).
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-navy-800 text-shell-50 hover:bg-navy-700 active:bg-navy-900 shadow-[0_1px_2px_rgba(16,41,60,0.25)] disabled:bg-navy-300',
  secondary:
    'bg-white text-navy-800 ring-1 ring-inset ring-shell-300 hover:bg-shell-50 hover:ring-shell-400 active:bg-shell-100',
  success:
    'bg-sage-600 text-white hover:bg-sage-500 active:bg-sage-700 shadow-[0_1px_2px_rgba(38,79,67,0.25)] disabled:bg-sage-200',
  danger:
    'bg-[#A8433C] text-white hover:bg-[#94392f] active:bg-[#7f312a] disabled:bg-[#d9b3af]',
  ghost: 'bg-transparent text-navy-700 hover:bg-navy-800/[0.06] active:bg-navy-800/[0.1]',
  quiet: 'bg-shell-200 text-navy-800 hover:bg-shell-300 active:bg-shell-400/70',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 min-h-9 px-3 text-[0.8125rem] gap-1.5',
  md: 'h-11 min-h-11 px-4 text-[0.9375rem] gap-2',
  lg: 'h-12 min-h-12 px-5 text-base gap-2.5',
};

const BASE =
  'inline-flex items-center justify-center rounded-md font-medium transition-[background-color,color,box-shadow,transform] duration-150 ease-smooth disabled:cursor-not-allowed disabled:opacity-90 select-none whitespace-nowrap active:translate-y-px';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  block?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    icon,
    iconRight,
    loading = false,
    block = false,
    className = '',
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${block ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={size === 'sm' ? 14 : 16} /> : icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} /> : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} size={size === 'sm' ? 16 : 18} /> : null}
    </button>
  );
});

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  block = false,
  className = '',
  children,
  ...rest
}: {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  block?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<LinkProps, 'to' | 'className' | 'children'>) {
  return (
    <Link
      to={to}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={size === 'sm' ? 16 : 18} /> : null}
    </Link>
  );
}

export function AnchorButton({
  href,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  block = false,
  className = '',
  children,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  block?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>) {
  return (
    <a
      href={href}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={size === 'sm' ? 16 : 18} /> : null}
    </a>
  );
}

export function Spinner({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`animate-spin ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
