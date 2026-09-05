import type { ReactNode } from 'react';

/**
 * Table — semantic markup with a horizontally scrollable container on small
 * screens. Dashboards switch to card lists under `sm` instead of forcing a
 * patient or a receptionist to scroll a cramped grid.
 */

export function Table({
  children,
  caption,
  className = '',
}: {
  children: ReactNode;
  caption?: string;
  className?: string;
}) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <table className={`w-full min-w-[38rem] border-collapse text-start ${className}`}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-shell-300 bg-shell-50/80">{children}</tr>
    </thead>
  );
}

export function TH({
  children,
  align = 'start',
  className = '',
  scope = 'col',
}: {
  children?: ReactNode;
  align?: 'start' | 'end' | 'center';
  className?: string;
  scope?: 'col' | 'row';
}) {
  return (
    <th
      scope={scope}
      className={`whitespace-nowrap px-3 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-stone-500 ${
        align === 'end' ? 'text-end' : align === 'center' ? 'text-center' : 'text-start'
      } ${className}`}
    >
      {children}
    </th>
  );
}

export function TR({
  children,
  className = '',
  onClick,
  selected = false,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-shell-200 transition-colors last:border-0 ${
        onClick ? 'cursor-pointer hover:bg-shell-50' : ''
      } ${selected ? 'bg-sage-50/60' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TD({
  children,
  align = 'start',
  className = '',
  colSpan,
}: {
  children: ReactNode;
  align?: 'start' | 'end' | 'center';
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`px-3 py-3 text-[0.8125rem] text-navy-800 ${
        align === 'end' ? 'text-end' : align === 'center' ? 'text-center' : 'text-start'
      } ${className}`}
    >
      {children}
    </td>
  );
}

/** Tabs — used for status filters and the admin sections on tablet+. */
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel,
  className = '',
}: {
  tabs: { value: T; label: string; count?: number }[];
  active: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex gap-1 overflow-x-auto border-b border-shell-300 no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`relative -mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[0.8125rem] font-medium transition-colors ${
              isActive
                ? 'border-sage-600 text-navy-900'
                : 'border-transparent text-stone-500 hover:text-navy-700'
            }`}
          >
            {tab.label}
            {typeof tab.count === 'number' ? (
              <span
                className={`num rounded px-1.5 py-0.5 text-[0.6875rem] ${
                  isActive ? 'bg-sage-100 text-sage-800' : 'bg-shell-200 text-stone-600'
                }`}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
