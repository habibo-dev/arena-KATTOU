import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { Button } from './Button';
import { useI18n } from '@/i18n';

/**
 * Modal — focus-trapped, Escape-closable, scroll-locked.
 * Rendered in a portal so it is never clipped by dashboard containers.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  tone = 'neutral',
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  tone?: 'neutral' | 'danger' | 'warn';
  size?: 'sm' | 'md' | 'lg';
}) {
  const { t, dir } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const node = panelRef.current;
    const focusables = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute('disabled'));

    // Focus the first control (or the panel itself) after mount.
    const first = focusables()[0];
    (first ?? node)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl' };
  const accents = {
    neutral: 'text-navy-800 bg-navy-50',
    warn: 'text-clay-700 bg-clay-50',
    danger: 'text-[#8E3730] bg-[#FBEEED]',
  };

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" dir={dir}>
      <button
        type="button"
        aria-label={t('a11y.closeDialog')}
        onClick={onClose}
        className="absolute inset-0 animate-fade-in cursor-default bg-navy-900/45 backdrop-blur-[1px]"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative w-full ${widths[size]} animate-slide-in rounded-t-xl border border-shell-300 bg-white shadow-lift outline-none sm:rounded-xl`}
      >
        <div className="flex items-start gap-3 border-b border-shell-300 px-4 py-3.5 sm:px-5">
          <span
            className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md ${accents[tone]}`}
          >
            <Icon
              name={tone === 'danger' ? 'alert' : tone === 'warn' ? 'info' : 'info'}
              size={17}
            />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[0.95rem] font-semibold text-navy-900">{title}</h2>
            {description ? (
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-stone-600">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('a11y.closeDialog')}
            className="-me-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-md text-stone-400 transition-colors hover:bg-shell-200 hover:text-navy-800"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {children ? (
          <div className="max-h-[65vh] overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
        ) : null}

        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-shell-300 bg-shell-50/70 px-4 py-3.5 sm:flex-row sm:justify-end sm:px-5">
            {footer}
          </div>
        ) : (
          <div className="flex justify-end border-t border-shell-300 bg-shell-50/70 px-4 py-3.5 sm:px-5">
            <Button variant="secondary" onClick={onClose}>
              {t('cta.close')}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Small dropdown used for row actions in the queue manager. */
export function Dropdown({
  trigger,
  children,
  align = 'end',
  label,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'start' | 'end';
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open ? (
        <div
          role="menu"
          aria-label={label}
          className={`absolute z-40 mt-1.5 min-w-44 animate-fade-up overflow-hidden rounded-md border border-shell-300 bg-white py-1 shadow-lift ${
            align === 'end' ? 'end-0' : 'start-0'
          }`}
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({
  children,
  icon,
  onClick,
  tone = 'neutral',
  disabled,
}: {
  children: ReactNode;
  icon?: Parameters<typeof Icon>[0]['name'];
  onClick: () => void;
  tone?: 'neutral' | 'danger' | 'success';
  disabled?: boolean;
}) {
  const tones = {
    neutral: 'text-navy-800 hover:bg-shell-100',
    danger: 'text-[#8E3730] hover:bg-[#FBEEED]',
    success: 'text-sage-700 hover:bg-sage-50',
  };
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-start text-[0.8125rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
    >
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </button>
  );
}


