import { Icon } from '@/components/ui/Icon';
import { Card, CardBody, CardHeader, Stat } from '@/components/ui/Card';
import { InfoNote } from '@/components/ui/Form';
import { BarChart, HourStrip, RankedBars } from '@/components/charts';
import { useI18n } from '@/i18n';
import { useClinic } from '@/store/clinic';
import { serviceById } from '@/lib/clinic';
import { humanDuration } from '@/lib/time';

/**
 * Analytics — every figure is derived from appointments the clinic actually
 * processed. A brand-new clinic shows an honest empty state; nothing is
 * fabricated to fill the charts.
 */
export default function Analytics() {
  const { t, lang, weekdayName } = useI18n();
  const { metrics, demoMode, patients } = useClinic();

  const empty = metrics.sampleSize === 0 && metrics.appointments === 0;

  const busiest = metrics.busiestDays.slice(0, 7).map((d) => ({
    label: weekdayName(d.weekday).slice(0, 3),
    value: d.count,
  }));

  const byService = metrics.averageDurationByService.map((row) => ({
    label:
      lang === 'ar'
        ? serviceById(row.serviceId).ar
        : lang === 'fr'
          ? serviceById(row.serviceId).fr
          : serviceById(row.serviceId).en,
    value: row.averageMinutes,
    count: row.count,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-[1.35rem] font-semibold text-navy-900">{t('analytics.title')}</h1>
        <p className="mt-1 text-[0.8125rem] text-stone-500">{t('analytics.subtitle')}</p>
      </div>

      {demoMode ? (
        <InfoNote tone="warn" icon="alert">
          {t('staff.demoTitle')} — {t('staff.demoBody')}
        </InfoNote>
      ) : null}

      {empty ? (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-lg bg-shell-200 text-stone-400">
                <Icon name="chart" size={26} />
              </span>
              <h2 className="mt-4 text-[1rem] font-semibold text-navy-900">
                {t('analytics.emptyTitle')}
              </h2>
              <p className="mt-2 max-w-md text-[0.8125rem] leading-relaxed text-stone-500">
                {t('analytics.emptyBody')}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t('analytics.appointments')} value={metrics.appointments} icon="calendar" />
        <Stat
          label={t('analytics.completed')}
          value={metrics.completed}
          icon="checkCircle"
          tone="success"
        />
        <Stat
          label={t('analytics.cancelled')}
          value={metrics.cancelled}
          icon="xCircle"
          tone="danger"
        />
        <Stat
          label={t('analytics.noShow')}
          value={metrics.noShow}
          icon="alert"
          tone="danger"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label={t('analytics.avgWaiting')}
          value={
            metrics.averageWaitingMinutes !== null
              ? humanDuration(metrics.averageWaitingMinutes)
              : t('analytics.noData')
          }
          icon="hourglass"
          tone="warn"
        />
        <Stat
          label={t('analytics.avgVisit')}
          value={
            metrics.averageVisitMinutes !== null
              ? humanDuration(metrics.averageVisitMinutes)
              : t('analytics.noData')
          }
          icon="timer"
          tone="info"
        />
        <Stat
          label={t('analytics.avgDelay')}
          value={
            metrics.averageDelayMinutes !== null
              ? humanDuration(metrics.averageDelayMinutes)
              : t('analytics.noData')
          }
          icon="clock"
        />
        <Stat
          label={t('analytics.completionRate')}
          value={
            metrics.completionRate !== null
              ? `${Math.round(metrics.completionRate * 100)}%`
              : t('analytics.noData')
          }
          icon="activity"
          tone="success"
        />
      </div>

      {metrics.sampleSize > 0 ? (
        <p className="flex items-center gap-1.5 text-[0.75rem] text-stone-400">
          <Icon name="info" size={13} />
          {t('analytics.sampleNote', { n: metrics.sampleSize })}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title={t('analytics.peakHours')} icon="clock" />
          <CardBody>
            <HourStrip data={metrics.peakHours} emptyLabel={t('analytics.noData')} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t('analytics.busiestDays')} icon="calendar" />
          <CardBody>
            <BarChart
              data={busiest}
              emptyLabel={t('analytics.noData')}
              height={150}
            />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title={t('analytics.byService')}
            subtitle={t('services.durationNote')}
            icon="chart"
          />
          <CardBody>
            <RankedBars
              data={byService}
              unit={` ${t('services.minutes')}`}
              emptyLabel={t('analytics.noData')}
            />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title={t('admin.dataSection')} icon="shield" />
        <CardBody>
          <p className="text-[0.8125rem] leading-relaxed text-stone-600">
            {t('admin.privacyBody')}
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <MetricRow label={t('analytics.appointments')} value={String(metrics.appointments)} />
            <MetricRow label={t('analytics.visits')} value={String(metrics.completed)} />
            <MetricRow label={t('analytics.patients')} value={String(patients.length)} />
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-shell-300 bg-shell-50 px-3.5 py-3">
      <dt className="text-[0.75rem] text-stone-500">{label}</dt>
      <dd className="num mt-1 text-[1.125rem] font-semibold text-navy-900">{value}</dd>
    </div>
  );
}
