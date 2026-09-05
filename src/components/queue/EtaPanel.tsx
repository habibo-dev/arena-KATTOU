import { Icon } from '@/components/ui/Icon';
import { useI18n } from '@/i18n';
import type { EtaResult } from '@/lib/types';

/**
 * The only place an ETA is rendered for a patient.
 * Always a range, always accompanied by the "may change" disclaimer.
 */
export function EtaPanel({
  eta,
  delayMinutes = 0,
  compact = false,
  tone = 'light',
}: {
  eta: EtaResult | null;
  delayMinutes?: number;
  compact?: boolean;
  tone?: 'light' | 'dark';
}) {
  const { t } = useI18n();

  if (!eta) {
    return (
      <div
        className={`rounded-lg border px-4 py-3.5 ${
          tone === 'dark' ? 'border-shell-50/15 bg-shell-50/5' : 'border-shell-300 bg-shell-50'
        }`}
      >
        <p className={`text-[0.8125rem] ${tone === 'dark' ? 'text-shell-200/80' : 'text-stone-600'}`}>
          {t('queue.notInQueue')}
        </p>
      </div>
    );
  }

  const isDark = tone === 'dark';

  return (
    <div
      className={`rounded-lg border ${
        isDark ? 'border-shell-50/15 bg-shell-50/5' : 'border-shell-300 bg-white'
      }`}
    >
      <div className={`flex items-start justify-between gap-3 px-4 ${compact ? 'py-3' : 'py-4'}`}>
        <div className="min-w-0">
          <p
            className={`flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] ${
              isDark ? 'text-shell-200/60' : 'text-stone-500'
            }`}
          >
            <Icon name="clock" size={13} />
            {t('queue.etaLabel')}
          </p>
          <p
            className={`num mt-1.5 font-semibold leading-none ${
              isDark ? 'text-shell-50' : 'text-navy-900'
            } ${compact ? 'text-xl' : 'text-[1.75rem] sm:text-[2rem]'}`}
          >
            {eta.fromTime}
            <span className={isDark ? 'text-shell-200/50' : 'text-stone-400'}> – </span>
            {eta.toTime}
          </p>
          <p
            className={`num mt-1.5 text-[0.8125rem] font-medium ${
              isDark ? 'text-sage-300' : 'text-sage-600'
            }`}
          >
            {eta.fromMinutes}–{eta.toMinutes} {t('units.min')}
          </p>
        </div>

        <span
          className={`shrink-0 rounded px-2 py-1 text-[0.6875rem] font-medium ring-1 ring-inset ${
            eta.confidence === 'high'
              ? isDark
                ? 'bg-sage-500/15 text-sage-300 ring-sage-500/25'
                : 'bg-sage-50 text-sage-700 ring-sage-100'
              : eta.confidence === 'medium'
                ? isDark
                  ? 'bg-clay-500/15 text-clay-200 ring-clay-500/25'
                  : 'bg-clay-50 text-clay-700 ring-clay-100'
                : isDark
                  ? 'bg-shell-50/10 text-shell-200/70 ring-shell-50/20'
                  : 'bg-shell-100 text-stone-600 ring-shell-300'
          }`}
        >
          {eta.confidence === 'high'
            ? t('queue.confidenceHigh')
            : eta.confidence === 'medium'
              ? t('queue.confidenceMedium')
              : t('queue.confidenceLow')}
        </span>
      </div>

      <div
        className={`border-t px-4 py-2.5 ${
          isDark ? 'border-shell-50/10' : 'border-shell-200'
        }`}
      >
        <p
          className={`text-[0.75rem] leading-relaxed ${
            isDark ? 'text-shell-200/60' : 'text-stone-500'
          }`}
        >
          {t('queue.disclaimer')}
        </p>
        {delayMinutes > 0 ? (
          <p
            className={`mt-1.5 flex items-start gap-1.5 text-[0.75rem] font-medium ${
              isDark ? 'text-clay-200' : 'text-clay-700'
            }`}
          >
            <Icon name="alert" size={13} className="mt-px shrink-0" />
            {t('queue.delayNotice')}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Transparent breakdown — shown in the patient page so nothing looks magic. */
export function EtaBreakdown({ eta }: { eta: EtaResult }) {
  const { t } = useI18n();
  const rows: { label: string; value: string }[] = [
    { label: t('queue.patientsAhead'), value: String(eta.inputs.patientsAhead) },
    {
      label: t('services.durationLabel'),
      value: `${eta.inputs.averageDurationMinutes} ${t('units.min')}`,
    },
    {
      label: t('reception.currentPatient'),
      value:
        eta.inputs.currentPatientRemainingMinutes > 0
          ? `${eta.inputs.currentPatientRemainingMinutes} ${t('units.min')}`
          : '—',
    },
  ];
  if (eta.inputs.clinicDelayMinutes > 0) {
    rows.push({
      label: t('reception.delayTitle'),
      value: `+${eta.inputs.clinicDelayMinutes} ${t('units.min')}`,
    });
  }
  if (eta.inputs.emergencyPending > 0) {
    rows.push({ label: t('reception.typeEmergency'), value: String(eta.inputs.emergencyPending) });
  }

  return (
    <dl className="divide-y divide-shell-200 rounded-lg border border-shell-300 bg-white">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
          <dt className="text-[0.8125rem] text-stone-600">{row.label}</dt>
          <dd className="num text-[0.8125rem] font-semibold text-navy-900">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
