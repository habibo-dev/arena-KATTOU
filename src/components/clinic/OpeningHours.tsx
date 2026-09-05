import { Icon } from '@/components/ui/Icon';
import { useI18n } from '@/i18n';
import { useClinic } from '@/store/clinic';

/**
 * Opening hours are NOT confirmed. Until the clinic fills them in Settings,
 * every surface renders "Horaires à confirmer" — never an invented schedule.
 */
export function OpeningHours({
  tone = 'light',
  compact = false,
  showHint = false,
}: {
  tone?: 'light' | 'dark';
  compact?: boolean;
  showHint?: boolean;
}) {
  const { t, weekdayName } = useI18n();
  const { settings } = useClinic();

  const configured = Object.values(settings.openingHours).some(
    (day) => day && day.open && day.close,
  );

  if (!configured) {
    return (
      <div className="min-w-0">
        <p
          className={`text-[0.8125rem] font-medium ${
            tone === 'dark' ? 'text-shell-100' : 'text-navy-800'
          }`}
          lang="fr"
        >
          {t('home.hoursUnconfirmed')}
        </p>
        {showHint ? (
          <p
            className={`mt-1 text-[0.75rem] leading-relaxed ${
              tone === 'dark' ? 'text-shell-200/60' : 'text-stone-500'
            }`}
          >
            {t('home.hoursUnconfirmedHint')}
          </p>
        ) : null}
      </div>
    );
  }

  const days = [1, 2, 3, 4, 5, 6, 0]
    .map((index) => ({ index, day: settings.openingHours[index] }))
    .filter((row) => row.day && row.day.open);

  return (
    <dl className={`space-y-1 ${compact ? 'text-[0.8125rem]' : 'text-[0.875rem]'}`}>
      {days.map(({ index, day }) => (
        <div key={index} className="flex items-baseline justify-between gap-4">
          <dt className={tone === 'dark' ? 'text-shell-200/70' : 'text-stone-600'}>
            {weekdayName(index)}
          </dt>
          <dd
            className={`num shrink-0 ${tone === 'dark' ? 'text-shell-100' : 'text-navy-800'}`}
            dir="ltr"
          >
            {day?.open} – {day?.close}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function HoursBadge({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[0.75rem] font-medium ring-1 ring-inset ${
        tone === 'dark'
          ? 'bg-shell-50/5 text-shell-200/80 ring-shell-50/15'
          : 'bg-shell-100 text-stone-600 ring-shell-300'
      }`}
      lang="fr"
    >
      <Icon name="clock" size={13} />
      {t('home.hoursUnconfirmed')}
    </span>
  );
}
