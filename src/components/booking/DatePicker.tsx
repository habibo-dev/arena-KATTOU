import { useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useI18n } from '@/i18n';
import { addDays, pad2, toISODate, todayISO, weekdayOf } from '@/lib/time';
import { useClinic } from '@/store/clinic';

/**
 * Month calendar tuned for RTL and for a clinic booking window.
 * Days that are closed or outside the horizon are `disabled`, not hidden —
 * the patient always sees a complete, predictable month.
 */
export function DatePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (iso: string) => void;
}) {
  const { t, lang, weekdayName } = useI18n();
  const { isBookableDay, settings } = useClinic();

  const today = todayISO();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const maxDate = useMemo(() => addDays(today, settings.bookingWindow.horizonDays), [
    today,
    settings.bookingWindow.horizonDays,
  ]);

  const firstWeekday = new Date(month.year, month.month, 1).getDay();
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();

  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      toISODate(new Date(month.year, month.month, i + 1)),
    ),
  ];

  const currentMonthISO = toISODate(new Date(month.year, month.month, 1));
  const todayMonthISO = toISODate(new Date());
  const maxMonthISO = maxDate;
  const canGoPrev = currentMonthISO > todayMonthISO;
  const canGoNext = currentMonthISO < maxMonthISO;

  const shift = (delta: number) => {
    setMonth((m) => {
      const d = new Date(m.year, m.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  // Sunday-first grid matches JS getDay and reads naturally in RTL.
  const weekdayOrder = [0, 1, 2, 3, 4, 5, 6];
  const monthLabel = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-DZ' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(month.year, month.month, 1));

  return (
    <div className="card p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={!canGoPrev}
          aria-label={t('cta.back')}
          className="grid h-9 w-9 place-items-center rounded-md text-navy-700 transition-colors hover:bg-shell-200 disabled:cursor-not-allowed disabled:text-shell-400"
        >
          <Icon name="chevronRight" size={18} />
        </button>
        <p className="text-[0.9375rem] font-semibold text-navy-900" aria-live="polite">
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={!canGoNext}
          aria-label={t('cta.next')}
          className="grid h-9 w-9 place-items-center rounded-md text-navy-700 transition-colors hover:bg-shell-200 disabled:cursor-not-allowed disabled:text-shell-400"
        >
          <Icon name="chevronLeft" size={18} />
        </button>
      </div>

      <table className="mt-3 w-full table-fixed border-collapse">
        <caption className="sr-only">{t('booking.chooseDate')}</caption>
        <thead>
          <tr>
            {weekdayOrder.map((w) => (
              <th
                key={w}
                scope="col"
                className="py-1.5 text-center text-[0.6875rem] font-medium text-stone-400"
              >
                <span aria-hidden="true">{weekdayName(w).slice(0, 2)}</span>
                <span className="sr-only">{weekdayName(w)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(cells.length / 7) }, (_, row) => (
            <tr key={row}>
              {cells.slice(row * 7, row * 7 + 7).map((iso, i) => {
                if (!iso) return <td key={`e${i}`} />;
                const day = Number(iso.slice(-2));
                const isToday = iso === today;
                const isPast = iso < today;
                const beyondHorizon = iso > maxDate;
                const closed = !isBookableDay(iso);
                const disabled = isPast || beyondHorizon || closed;
                const selected = iso === value;

                return (
                  <td key={iso} className="p-0.5">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onChange(iso)}
                      aria-pressed={selected}
                      aria-current={isToday ? 'date' : undefined}
                      className={`num grid h-10 w-full place-items-center rounded-md text-[0.875rem] font-medium transition-colors sm:h-11 ${
                        selected
                          ? 'bg-navy-800 text-shell-50'
                          : disabled
                            ? 'cursor-not-allowed text-shell-400 line-through decoration-shell-300'
                            : isToday
                              ? 'bg-sage-50 text-sage-700 ring-1 ring-inset ring-sage-200 hover:bg-sage-100'
                              : 'text-navy-800 hover:bg-shell-200'
                      }`}
                    >
                      {day}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-shell-200 pt-3 text-[0.6875rem] text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-sage-100 ring-1 ring-inset ring-sage-300" />
          {t('booking.today')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-shell-200" />
          {t('booking.closedDay')}
        </span>
        <span className="num ms-auto" dir="ltr">
          {pad2(new Date().getDate())}/{pad2(new Date().getMonth() + 1)}
        </span>
        <span className="sr-only">{weekdayOf(today)}</span>
      </div>
    </div>
  );
}
