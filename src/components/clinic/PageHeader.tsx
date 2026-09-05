import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

export function PageHeader({
  eyebrow,
  title,
  body,
  action,
  backTo,
  backLabel,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: ReactNode;
  backTo?: string;
  backLabel?: string;
  compact?: boolean;
}) {
  return (
    <section className="border-b border-shell-300 surface-quiet">
      <div className={`container-page ${compact ? 'py-6 sm:py-8' : 'py-9 sm:py-12'}`}>
        {backTo && backLabel ? (
          <a
            href={backTo}
            className="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-stone-500 transition-colors hover:text-navy-800"
          >
            <Icon name="arrowRight" size={15} />
            {backLabel}
          </a>
        ) : null}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            {eyebrow ? (
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-sage-600">
                {eyebrow}
              </p>
            ) : null}
            <h1
              className={`mt-2 font-semibold tracking-tightish text-navy-900 ${
                compact ? 'text-[1.4rem]' : 'text-[1.75rem] sm:text-[2.15rem]'
              }`}
            >
              {title}
            </h1>
            {body ? (
              <p className="mt-3 text-[0.9375rem] leading-[1.8] text-stone-600">{body}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}
