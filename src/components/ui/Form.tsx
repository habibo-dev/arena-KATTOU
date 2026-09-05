import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { Icon, type IconName } from './Icon';

/** Form primitives with consistent labelling, help text and error display. */

const CONTROL =
  'block w-full rounded-md border bg-white px-3.5 text-[0.9375rem] text-navy-900 placeholder:text-stone-400 transition-[border-color,box-shadow] duration-150 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/25 disabled:cursor-not-allowed disabled:bg-shell-100 disabled:text-stone-400';

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className = '',
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[0.8125rem] font-medium text-navy-800"
      >
        {label}
        {required ? (
          <span className="ms-1 text-[#A8433C]" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1.5 text-[0.75rem] leading-relaxed text-stone-500">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1.5 flex items-start gap-1.5 text-[0.75rem] font-medium text-[#8E3730]">
          <Icon name="alert" size={14} className="mt-px shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  icon?: IconName;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, icon, className = '', ...rest },
  ref,
) {
  return (
    <span className="relative block">
      {icon ? (
        <span className="pointer-events-none absolute inset-y-0 start-3 grid place-items-center text-stone-400">
          <Icon name={icon} size={17} />
        </span>
      ) : null}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={`${CONTROL} h-11 min-h-11 ${icon ? 'ps-10' : ''} ${
          invalid ? 'border-[#C9867F] ring-1 ring-inset ring-[#C9867F]' : 'border-shell-400'
        } ${className}`}
        {...rest}
      />
    </span>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = '', ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={`${CONTROL} min-h-24 border-shell-400 py-2.5 leading-relaxed ${className}`}
        {...rest}
      />
    );
  },
);

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(function Select({ invalid = false, className = '', children, ...rest }, ref) {
  return (
    <span className="relative block">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={`${CONTROL} h-11 min-h-11 appearance-none border-shell-400 pe-10 ${
          invalid ? 'border-[#C9867F] ring-1 ring-inset ring-[#C9867F]' : ''
        } ${className}`}
        {...rest}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 end-3 grid place-items-center text-stone-400">
        <Icon name="chevronDown" size={16} />
      </span>
    </span>
  );
});

/** Segmented control — used for waiting mode, role filters, day pickers. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
  className = '',
}: {
  options: { value: T; label: string; icon?: IconName }[];
  value: T | null;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`inline-flex w-full gap-1 rounded-lg bg-shell-200 p-1 ${className}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md font-medium transition-colors duration-150 ${
              size === 'sm' ? 'h-8 px-2.5 text-[0.75rem]' : 'h-10 px-3 text-[0.8125rem]'
            } ${
              active
                ? 'bg-white text-navy-900 shadow-[0_1px_2px_rgba(16,41,60,0.12)]'
                : 'text-stone-600 hover:text-navy-800'
            }`}
          >
            {option.icon ? <Icon name={option.icon} size={15} /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Accessible checkbox / switch row. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-[0.875rem] font-medium text-navy-800">
          {label}
        </label>
        {description ? (
          <p className="mt-1 text-[0.75rem] leading-relaxed text-stone-500">{description}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-150 disabled:opacity-50 ${
          checked ? 'bg-sage-600' : 'bg-shell-400'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-150 ${
            checked ? 'start-[1.375rem]' : 'start-0.5'
          }`}
        />
      </button>
    </div>
  );
}

/** Inline validation message block used by multi-step forms. */
export function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-[#EBD0CD] bg-[#FBEEED] px-3.5 py-3 text-[0.8125rem] text-[#8E3730]"
    >
      <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function InfoNote({
  children,
  tone = 'info',
  icon = 'info',
}: {
  children: ReactNode;
  tone?: 'info' | 'warn' | 'success';
  icon?: IconName;
}) {
  const tones = {
    info: 'border-navy-100 bg-navy-50/70 text-navy-700',
    warn: 'border-clay-100 bg-clay-50/70 text-clay-700',
    success: 'border-sage-100 bg-sage-50/70 text-sage-700',
  } as const;
  return (
    <div className={`flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-[0.8125rem] leading-relaxed ${tones[tone]}`}>
      <Icon name={icon} size={16} className="mt-0.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
