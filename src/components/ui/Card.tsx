import type { ReactNode } from 'react';
import type { StatusTone } from '@/lib/status';
import { Icon, type IconName } from './Icon';

export function Card({
  children,
  className = '',
  as: Tag = 'div',
  interactive = false,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
  interactive?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={`card ${
        interactive
          ? 'transition-shadow duration-150 hover:shadow-lift hover:border-shell-400'
          : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className = '',
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 border-b border-shell-300 px-4 py-3.5 sm:px-5 ${className}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-sage-50 text-sage-600">
            <Icon name={icon} size={17} />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="truncate text-[0.95rem] font-semibold text-navy-900 sm:text-base">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-stone-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-4 py-4 sm:px-5 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 border-t border-shell-300 bg-shell-50/70 px-4 py-3 sm:px-5 ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */

const TONES: Record<StatusTone, string> = {
  neutral: 'bg-shell-200 text-stone-700 ring-shell-300',
  info: 'bg-navy-50 text-navy-700 ring-navy-100',
  success: 'bg-sage-50 text-sage-700 ring-sage-100',
  warn: 'bg-clay-50 text-clay-700 ring-clay-100',
  danger: 'bg-[#FBEEED] text-[#8E3730] ring-[#F1D3D0]',
  accent: 'bg-sage-100 text-sage-800 ring-sage-200',
};

const SOLID_TONES: Record<StatusTone, string> = {
  neutral: 'bg-stone-600 text-white ring-stone-600',
  info: 'bg-navy-700 text-white ring-navy-700',
  success: 'bg-sage-600 text-white ring-sage-600',
  warn: 'bg-clay-600 text-white ring-clay-600',
  danger: 'bg-[#A8433C] text-white ring-[#A8433C]',
  accent: 'bg-sage-700 text-white ring-sage-700',
};

export function Badge({
  children,
  tone = 'neutral',
  solid = false,
  icon,
  size = 'md',
  className = '',
}: {
  children: ReactNode;
  tone?: StatusTone;
  solid?: boolean;
  icon?: IconName;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded font-medium ring-1 ring-inset ${
        solid ? SOLID_TONES[tone] : TONES[tone]
      } ${size === 'sm' ? 'px-1.5 py-0.5 text-[0.6875rem]' : 'px-2 py-1 text-[0.75rem]'} ${className}`}
    >
      {icon ? <Icon name={icon} size={size === 'sm' ? 12 : 14} strokeWidth={1.8} /> : null}
      {children}
    </span>
  );
}

export function LiveDot({ className = '' }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-2 w-2 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage-400 opacity-60 motion-reduce:hidden" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-sage-500" />
    </span>
  );
}

/** Metric tile used across dashboards and analytics. */
export function Stat({
  label,
  value,
  hint,
  icon,
  tone = 'neutral',
  className = '',
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: IconName;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <div className={`card px-4 py-3.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.75rem] font-medium text-stone-500">{label}</span>
        {icon ? (
          <span
            className={`grid h-6 w-6 place-items-center rounded ${
              tone === 'danger'
                ? 'bg-[#FBEEED] text-[#8E3730]'
                : tone === 'success'
                  ? 'bg-sage-50 text-sage-600'
                  : tone === 'warn'
                    ? 'bg-clay-50 text-clay-700'
                    : 'bg-navy-50 text-navy-600'
            }`}
          >
            <Icon name={icon} size={14} />
          </span>
        ) : null}
      </div>
      <p className="num mt-1.5 text-2xl font-semibold leading-none text-navy-900">{value}</p>
      {hint ? <p className="mt-1.5 text-[0.75rem] text-stone-500">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  icon = 'info',
  title,
  body,
  action,
  className = '',
}: {
  icon?: IconName;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center px-6 py-10 text-center ${className}`}>
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-shell-200 text-stone-400">
        <Icon name={icon} size={20} />
      </span>
      <h3 className="mt-3.5 text-[0.9375rem] font-semibold text-navy-900">{title}</h3>
      {body ? (
        <p className="mt-1.5 max-w-sm text-[0.8125rem] leading-relaxed text-stone-500">{body}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse-soft rounded bg-shell-200 motion-reduce:animate-none ${className}`}
      aria-hidden="true"
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = 'start',
  tone = 'light',
  className = '',
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: 'start' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const isDark = tone === 'dark';
  return (
    <div
      className={`${align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}
    >
      {eyebrow ? (
        <p
          className={`text-[0.6875rem] font-semibold uppercase tracking-[0.18em] ${
            isDark ? 'text-sage-300' : 'text-sage-600'
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`mt-2.5 text-[1.6rem] leading-[1.25] font-semibold sm:text-[1.9rem] ${
          isDark ? 'text-shell-50' : 'text-navy-900'
        }`}
      >
        {title}
      </h2>
      {body ? (
        <p
          className={`mt-3 text-[0.9375rem] leading-[1.75] sm:text-base ${
            isDark ? 'text-shell-200/80' : 'text-stone-600'
          }`}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
