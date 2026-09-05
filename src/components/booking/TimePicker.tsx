import { Icon } from '@/components/ui/Icon';
import { useI18n } from '@/i18n';
import { useClinic } from '@/store/clinic';

export function TimePicker({
  date,
  value,
  onChange,
}: {
  date: string;
  value: string | null;
  onChange: (slot: string) => void;
}) {
  const { t } = useI18n();
  const { slotsForDate, isBookableDay } = useClinic();

  if (!isBookableDay(date)) {
    return (
      <div className="rounded-lg border border-dashed border-shell-400 bg-shell-50 px-4 py-8 text-center">
        <Icon name="clock" size={22} className="mx-auto text-stone-400" />
        <p className="mt-2.5 text-[0.875rem] font-medium text-navy-900">{t('booking.closedDay')}</p>
      </div>
    );
  }

  const slots = slotsForDate(date);

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-shell-400 bg-shell-50 px-4 py-8 text-center">
        <Icon name="clock" size={22} className="mx-auto text-stone-400" />
        <p className="mt-2.5 text-[0.875rem] font-medium text-navy-900">
          {t('booking.noSlotsTitle')}
        </p>
        <p className="mt-1 text-[0.8125rem] text-stone-500">{t('booking.noSlotsBody')}</p>
      </div>
    );
  }

  return (
    <div>
      <ul
        role="listbox"
        aria-label={t('booking.chooseTime')}
        className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5"
      >
        {slots.map((slot) => {
          const full = slot.remaining === 0;
          const selected = slot.time === value;
          return (
            <li key={slot.time}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                disabled={full}
                onClick={() => onChange(slot.time)}
                className={`num flex h-12 w-full flex-col items-center justify-center rounded-md border text-[0.9375rem] font-semibold transition-colors ${
                  selected
                    ? 'border-navy-800 bg-navy-800 text-shell-50'
                    : full
                      ? 'cursor-not-allowed border-shell-300 bg-shell-100 text-shell-400'
                      : 'border-shell-400 bg-white text-navy-800 hover:border-sage-400 hover:bg-sage-50'
                }`}
              >
                {slot.time}
                <span
                  className={`text-[0.625rem] font-medium ${
                    selected ? 'text-shell-200' : full ? 'text-shell-400' : 'text-stone-400'
                  }`}
                >
                  {full ? t('booking.fullSlot') : t('booking.slotsLeft', { n: slot.remaining })}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[0.75rem] leading-relaxed text-stone-500">
        {t('services.durationNote')}
      </p>
    </div>
  );
}
