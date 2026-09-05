import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Card';
import { useI18n } from '@/i18n';
import { STATUS_META, TYPE_META } from '@/lib/status';
import type { QueueEntry } from '@/lib/types';
import { firstNameOnly } from '@/lib/privacy';
import { humanDuration } from '@/lib/time';

/**
 * Queue ticket — the single most important number a patient sees.
 * Rendered large, tabular, and always LTR so digits never mirror in RTL.
 */
export function QueueTicket({
  number,
  label,
  hint,
  size = 'lg',
}: {
  number: number | null;
  label: string;
  hint?: string;
  size?: 'md' | 'lg' | 'xl';
}) {
  const sizes = {
    md: 'text-4xl',
    lg: 'text-6xl sm:text-7xl',
    xl: 'text-7xl sm:text-8xl',
  };
  return (
    <div className="text-center">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
        {label}
      </p>
      <p
        className={`num mt-2 font-semibold leading-none text-navy-900 ${sizes[size]}`}
        aria-live="polite"
      >
        {number === null ? '—' : `#${number}`}
      </p>
      {hint ? <p className="mt-2 text-[0.8125rem] text-stone-500">{hint}</p> : null}
    </div>
  );
}

export function StatusBadge({
  status,
  size = 'md',
}: {
  status: keyof typeof STATUS_META;
  size?: 'sm' | 'md';
}) {
  const { lang } = useI18n();
  const meta = STATUS_META[status];
  return (
    <Badge tone={meta.tone} solid={meta.solid} size={size}>
      {lang === 'ar' ? meta.ar : lang === 'fr' ? meta.fr : meta.en}
    </Badge>
  );
}

export function TypeBadge({ type, size = 'sm' }: { type: keyof typeof TYPE_META; size?: 'sm' | 'md' }) {
  const { lang } = useI18n();
  const meta = TYPE_META[type];
  return (
    <Badge tone={meta.tone} size={size}>
      {lang === 'ar' ? meta.ar : lang === 'fr' ? meta.fr : meta.en}
    </Badge>
  );
}

/**
 * The signature queue visualisation:
 *   #18 قيد العلاج ↓ #19 انتظار ↓ #20 انتظار ↓ #21 أنت
 *
 * `variant="public"` redacts to first names only, so a shared patient link
 * never leaks other patients' identity.
 */
export function QueueVisual({
  entries,
  current,
  highlightId,
  variant = 'public',
  compact = false,
  showPhone = false,
}: {
  entries: QueueEntry[];
  current: QueueEntry | null;
  highlightId?: string | null;
  variant?: 'public' | 'staff';
  compact?: boolean;
  showPhone?: boolean;
}) {
  const { t } = useI18n();

  if (entries.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-[0.8125rem] text-stone-500">
        {t('queue.noQueueToday')}
      </p>
    );
  }

  return (
    <ol className="space-y-1.5" aria-label={t('a11y.queueProgress')}>
      {entries.map((entry, index) => {
        const isCurrent =
          entry.status === 'in_consultation' || current?.appointmentId === entry.appointmentId;
        const isYou = highlightId === entry.appointmentId;
        const isStaff = variant === 'staff';

        return (
          <li key={entry.appointmentId}>
            <div
              className={`relative flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                isYou
                  ? 'border-sage-500 bg-sage-50 ring-1 ring-sage-500/40'
                  : isCurrent
                    ? 'border-navy-200 bg-navy-50/60'
                    : 'border-shell-300 bg-white'
              }`}
            >
              <span
                className={`num grid h-11 w-11 shrink-0 place-items-center rounded-md text-[0.9375rem] font-semibold ${
                  isYou
                    ? 'bg-sage-600 text-white'
                    : isCurrent
                      ? 'bg-navy-800 text-shell-50'
                      : 'bg-shell-200 text-navy-700'
                }`}
              >
                {entry.queueNumber}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="truncate text-[0.875rem] font-medium text-navy-900">
                    {isStaff ? entry.patientName : firstNameOnly(entry.patientName)}
                  </span>
                  {isYou ? (
                    <Badge tone="success" solid size="sm">
                      {t('queue.you')}
                    </Badge>
                  ) : null}
                  {entry.type === 'emergency' ? (
                    <Badge tone="danger" solid size="sm">
                      {t('reception.typeEmergency')}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.75rem] text-stone-500">
                  <span>
                    {isCurrent
                      ? t('queue.inTreatment')
                      : entry.waitingMinutes > 0
                        ? `${t('reception.waitingFor')} ${humanDuration(entry.waitingMinutes)}`
                        : t('queue.waiting')}
                  </span>
                  {isStaff && showPhone ? (
                    <span className="num" dir="ltr">
                      · {entry.patientPhone.replace('+213', '0')}
                    </span>
                  ) : null}
                </p>
              </div>

              {isCurrent ? (
                <span className="shrink-0 text-navy-600">
                  <Icon name="activity" size={17} />
                </span>
              ) : null}

              {/* Position marker so "you" is obvious even at a glance */}
              {isYou ? (
                <span
                  className="absolute -start-1.5 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-sage-600"
                  aria-hidden="true"
                />
              ) : null}
            </div>

            {!compact && index < entries.length - 1 ? (
              <div className="flex justify-center py-0.5" aria-hidden="true">
                <Icon name="arrowDown" size={14} className="text-shell-400" />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/** Compact single-row progress strip used on dashboards. */
export function QueueStrip({
  entries,
  highlightId,
}: {
  entries: QueueEntry[];
  highlightId?: string | null;
}) {
  const { t } = useI18n();
  if (entries.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar" aria-label={t('a11y.queueProgress')}>
      {entries.map((entry) => {
        const isYou = highlightId === entry.appointmentId;
        const isCurrent = entry.status === 'in_consultation';
        return (
          <span
            key={entry.appointmentId}
            title={firstNameOnly(entry.patientName)}
            className={`num grid h-8 w-9 shrink-0 place-items-center rounded text-[0.75rem] font-semibold ${
              isYou
                ? 'bg-sage-600 text-white ring-2 ring-sage-300'
                : isCurrent
                  ? 'bg-navy-800 text-shell-50'
                  : 'bg-shell-200 text-navy-700'
            }`}
          >
            {entry.queueNumber}
          </span>
        );
      })}
    </div>
  );
}
