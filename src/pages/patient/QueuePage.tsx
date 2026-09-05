import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Badge, Card, CardBody, LiveDot } from '@/components/ui/Card';
import { InfoNote, SegmentedControl } from '@/components/ui/Form';
import { EtaPanel, EtaBreakdown } from '@/components/queue/EtaPanel';
import { QueueTicket, QueueVisual, StatusBadge } from '@/components/queue/QueueVisual';
import { useI18n } from '@/i18n';
import { useClinic } from '@/store/clinic';
import { patientsAheadOf } from '@/lib/queue';
import type { WaitingMode } from '@/lib/types';
import { firstNameOnly } from '@/lib/privacy';

/**
 * /a/:token/queue — "دورك في العيادة".
 *
 * The page a patient keeps open on their phone. Everything on it refreshes
 * from the shared clinic state, so a change at reception appears here.
 */
export default function QueuePage() {
  const { token = '' } = useParams();
  const { t, formatDate } = useI18n();
  const { findByToken, snapshotFor, etaFor, setWaitingMode, today, clinicDelayMinutes } =
    useClinic();
  const navigate = useNavigate();

  const appointment = findByToken(token);

  if (!appointment) {
    return (
      <section className="container-page py-14">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-shell-200 text-stone-400">
            <Icon name="xCircle" size={26} />
          </span>
          <h1 className="mt-4 text-[1.25rem] font-semibold text-navy-900">
            {t('appointment.invalidLink')}
          </h1>
          <div className="mt-6">
            <Button onClick={() => navigate('/appointment')} icon="search">
              {t('appointment.lookupTitle')}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const snapshot = snapshotFor(appointment.date);
  const eta = etaFor(appointment);
  const ahead = patientsAheadOf(snapshot, appointment.id);
  const inQueue =
    appointment.status === 'waiting' ||
    appointment.status === 'in_consultation' ||
    appointment.status === 'emergency' ||
    appointment.status === 'arrived';

  const progressMessage =
    ahead === 0
      ? appointment.status === 'in_consultation'
        ? null
        : t('queue.youAreNext')
      : ahead === 1
        ? t('queue.remaining1')
        : ahead === 2
          ? t('queue.remaining2')
          : ahead === 3
            ? t('queue.remaining3')
            : null;

  return (
    <section className="container-page py-5 sm:py-8">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[1.125rem] font-semibold text-navy-900">{t('queue.title')}</h1>
            <p className="mt-0.5 truncate text-[0.75rem] text-stone-500">
              {formatDate(appointment.date)}
              {appointment.slot ? (
                <span className="num ms-1.5" dir="ltr">
                  {appointment.slot}
                </span>
              ) : null}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-sage-50 px-2 py-1 text-[0.6875rem] font-medium text-sage-700 ring-1 ring-inset ring-sage-100">
            <LiveDot />
            {t('queue.autoRefresh')}
          </span>
        </div>

        {/* THE NUMBER */}
        <Card className="overflow-hidden">
          <div className="surface-navy px-4 py-8 sm:px-6 sm:py-10">
            <QueueTicket
              number={appointment.queueNumber}
              label={t('queue.yourNumber')}
              size="xl"
            />
            <div className="mt-6 flex justify-center">
              <StatusBadge status={appointment.status} />
            </div>
          </div>

          <CardBody className="p-0">
            <dl className="grid grid-cols-2 divide-x divide-x-reverse divide-shell-200">
              <div className="px-4 py-4 text-center">
                <dt className="text-[0.6875rem] font-medium text-stone-500">
                  {t('queue.currentPatient')}
                </dt>
                <dd className="num mt-1.5 text-2xl font-semibold text-navy-900">
                  {snapshot.current ? `#${snapshot.current.queueNumber}` : '—'}
                </dd>
                {snapshot.current ? (
                  <dd className="mt-0.5 text-[0.6875rem] text-stone-400">
                    {firstNameOnly(snapshot.current.patientName)}
                  </dd>
                ) : null}
              </div>
              <div className="px-4 py-4 text-center">
                <dt className="text-[0.6875rem] font-medium text-stone-500">
                  {ahead === 0
                    ? t('queue.noOneAhead')
                    : ahead === 1
                      ? t('queue.patientsAheadOne')
                      : ahead === 2
                        ? t('queue.patientsAheadTwo')
                        : t('queue.patientsAhead')}
                </dt>
                <dd className="num mt-1.5 text-2xl font-semibold text-navy-900">{ahead}</dd>
              </div>
            </dl>
          </CardBody>
        </Card>

        {/* Progress prompt */}
        {progressMessage ? (
          <div
            role="status"
            aria-live="polite"
            className={`flex items-center gap-3 rounded-lg border px-4 py-3.5 ${
              ahead === 0
                ? 'border-sage-300 bg-sage-50'
                : 'border-clay-200 bg-clay-50'
            }`}
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${
                ahead === 0 ? 'bg-sage-600 text-white' : 'bg-clay-500 text-white'
              }`}
            >
              <Icon name={ahead === 0 ? 'checkCircle' : 'bell'} size={18} />
            </span>
            <div className="min-w-0">
              <p
                className={`text-[0.9375rem] font-semibold ${
                  ahead === 0 ? 'text-sage-800' : 'text-clay-700'
                }`}
              >
                {progressMessage}
              </p>
              {ahead === 0 && appointment.waitingMode === 'outside' ? (
                <p className="mt-0.5 text-[0.8125rem] text-sage-700">{t('queue.comeToClinic')}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* ETA */}
        <EtaPanel eta={eta} delayMinutes={clinicDelayMinutes} />

        {appointment.status === 'in_consultation' ? (
          <InfoNote tone="success" icon="activity">
            {t('queue.inTreatment')}
          </InfoNote>
        ) : null}

        {!inQueue ? (
          <InfoNote tone="info" icon="info">
            <p>{t('queue.notInQueue')}</p>
            <p className="mt-1">{t('queue.notInQueueBody')}</p>
            <Link
              to={`/a/${token}`}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-navy-800 underline decoration-shell-400 underline-offset-4"
            >
              <Icon name="check" size={14} />
              {t('appointment.checkIn')}
            </Link>
          </InfoNote>
        ) : null}

        {/* Remote waiting */}
        {inQueue ? (
          <Card>
            <CardBody>
              <h2 className="text-[0.9375rem] font-semibold text-navy-900">
                {t('appointment.waitingModeTitle')}
              </h2>
              <div className="mt-3">
                <SegmentedControl<WaitingMode>
                  ariaLabel={t('appointment.waitingModeTitle')}
                  value={appointment.waitingMode ?? 'inside'}
                  onChange={(mode) => void setWaitingMode(appointment.id, mode)}
                  options={[
                    { value: 'inside', label: t('appointment.waitingInside'), icon: 'building' },
                    { value: 'outside', label: t('appointment.waitingOutside'), icon: 'pin' },
                  ]}
                />
              </div>
              {appointment.waitingMode === 'outside' ? (
                <p className="mt-3 flex items-start gap-2 text-[0.8125rem] leading-relaxed text-stone-600">
                  <Icon name="bell" size={16} className="mt-0.5 shrink-0 text-sage-600" />
                  {t('queue.remoteBody')}
                </p>
              ) : null}
            </CardBody>
          </Card>
        ) : null}

        {/* Live queue */}
        <Card>
          <div className="flex items-center justify-between gap-3 border-b border-shell-300 px-4 py-3">
            <h2 className="flex items-center gap-2 text-[0.875rem] font-semibold text-navy-900">
              <LiveDot />
              {t('queue.liveQueue')}
            </h2>
            <Badge tone="neutral" size="sm">
              <span className="num">{snapshot.entries.length}</span>
            </Badge>
          </div>
          <CardBody>
            <QueueVisual
              entries={snapshot.entries}
              current={snapshot.current}
              highlightId={appointment.id}
              variant="public"
            />
          </CardBody>
        </Card>

        {eta ? <EtaBreakdown eta={eta} /> : null}

        <div className="rounded-lg border border-clay-100 bg-clay-50/60 px-4 py-3">
          <p className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-clay-700">
            <Icon name="info" size={16} className="mt-0.5 shrink-0" />
            {t('queue.disclaimer')}
          </p>
        </div>

        <div className="grid gap-2.5">
          <Button variant="secondary" block icon="ticket" onClick={() => navigate(`/a/${token}`)}>
            {t('appointment.title')}
          </Button>
          <p className="text-center text-[0.6875rem] leading-relaxed text-stone-400">
            {t('queue.shareHint')} ·{' '}
            <span className="num" dir="ltr">
              {today}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
