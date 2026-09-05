import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useI18n } from '@/i18n';

const FAQ_KEYS = [
  'needApp',
  'howKnowTurn',
  'walkIn',
  'doctorLate',
  'emergencyCase',
  'leaveClinic',
  'multiDoctor',
  'dataPrivacy',
] as const;

type FaqKey = (typeof FAQ_KEYS)[number];

/** Accessible accordion — native <details> semantics with a styled summary. */
export function FaqList({ limit, className = '' }: { limit?: number; className?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState<FaqKey | null>(FAQ_KEYS[0]);
  const keys = limit ? FAQ_KEYS.slice(0, limit) : FAQ_KEYS;

  return (
    <dl className={`divide-y divide-shell-300 border-y border-shell-300 ${className}`}>
      {keys.map((key) => {
        const isOpen = open === key;
        const question = t(`faq.${key}.q` as 'faq.needApp.q');
        const answer = t(`faq.${key}.a` as 'faq.needApp.a');
        return (
          <div key={key}>
            <dt>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : key)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${key}`}
                id={`faq-button-${key}`}
                className="flex w-full items-start justify-between gap-4 py-4 text-start transition-colors hover:text-sage-700"
              >
                <span className="text-[0.9375rem] font-medium text-navy-900">{question}</span>
                <span
                  className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded text-stone-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-sage-600' : ''
                  }`}
                >
                  <Icon name="chevronDown" size={16} />
                </span>
              </button>
            </dt>
            <dd
              id={`faq-panel-${key}`}
              role="region"
              aria-labelledby={`faq-button-${key}`}
              hidden={!isOpen}
              className="pb-4 text-[0.875rem] leading-[1.8] text-stone-600"
            >
              {answer}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
