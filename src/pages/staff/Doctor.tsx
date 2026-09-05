import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Badge, Card, CardBody, CardHeader, EmptyState, Stat } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, InfoNote } from '@/components/ui/Form';
import { QueueVisual } from '@/components/queue/QueueVisual';
import { EmergencyModal } from '@/components/staff/EmergencyModal';
import { DelayModal } from '@/components/staff/DelayModal';
import { useI18n } from '@/i18n';
import { useClinic, useErrorLabel } from '@/store/clinic';
import { useToast } from '@/components/ui/Toast';
import { serviceById } from '@/lib/clinic';
import { humanDuration } from '@/lib/time';
import { safeInt } from '@/lib/validation';

/**
 * Doctor dashboard — deliberately minimal.
 * One primary action, one patient at a time, no queues to manage.
 */
export default function Doctor() {
  const { t, lang, formatDate } = useI18n();
  const {
    snapshot,
    today,
    callNext,
    completeConsultation,
    skipAppointment,
    clinicDelayMinutes,
  } = useClinic();
  const toast = useToast();
  const errorLabel = useErrorLabel();

  const [finishId, setFinishId] = useState<string | null>(null);
  const [duration, setDuration] = useState('');
  const [emergencyId, setEmergencyId] = useState<string | null>(null);
  const [delayOpen, setDelayOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const current = snapshot.current;
  const next = snapshot.next;
  const currentService = current ? serviceById(current.serviceId) : null;

  /** Minutes since the patient checked in at reception. */
  const currentWaiting = current ? current.waitingMinutes : 0;

  const handleNext = async () => {
    setBusy(true);
    const result = await callNext('doctor');
    setBusy(false);
    if (!result.ok) {
      toast.push({ tone: 'warn', title: t('doctor.noNext') });
      return;
    }
    toast.push({ tone: 'success', title: t('doctor.nextPatient') });
  };

  const confirmFinish = async () => {
    if (!finishId) return;
    setBusy(true);
    const minutes = duration ? safeInt(duration, 1, 480, 0) : undefined;
    const result = await completeConsultation(finishId, 'doctor', minutes || undefined);
    setBusy(false);
    if (!result.ok) {
      toast.push({ tone: 'danger', title: t('errors.generic'), body: errorLabel(result.error) });
    } else {
      toast.push({ tone: 'success', title: t('reception.completed') });
    }
    setFinishId(null);
    setDuration('');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.35rem] font-semibold text-navy-900">{t('doctor.title')}</h1>
          <p className="mt-1 text-[0.8125rem] text-stone-500">{formatDate(today)}</p>
        </div>
        {clinicDelayMinutes > 0 ? (
          <Badge tone="warn" icon="timer">
            {t('reception.delayActive', { n: clinicDelayMinutes })}
          </Badge>
        ) : null}
      </div>

      {/* THE primary action */}
      <Card className="overflow-hidden">
        <div className="surface-navy px-5 py-6 sm:px-6 sm:py-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-shell-200/50">
                {t('doctor.nextPatient')}
              </p>
              {next ? (
                <>
                  <p className="mt-1.5 truncate text-[1.25rem] font-semibold text-shell-50">
                    {next.patientName}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[0.8125rem] text-shell-200/70">
                    <span className="num">#{next.queueNumber}</span>
                    <span>
                      {lang === 'ar'
                        ? serviceById(next.serviceId).ar
                        : serviceById(next.serviceId).fr}
                    </span>
                    {next.waitingMinutes > 0 ? (
                      <span className="flex items-center gap-1">
                        <Icon name="hourglass" size={13} />
                        {humanDuration(next.waitingMinutes)}
                      </span>
                    ) : null}
                  </p>
                </>
              ) : (
                <p className="mt-1.5 text-[1rem] text-shell-200/70">{t('doctor.noNext')}</p>
              )}
            </div>

            <Button
              size="lg"
              className="bg-shell-50 text-navy-900 hover:bg-white active:bg-shell-100"
              icon="skip"
              loading={busy}
              disabled={!next}
              onClick={handleNext}
            >
              {t('doctor.nextAction')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Current patient */}
      <Card>
        <CardHeader
          title={t('doctor.currentTitle')}
          icon="stethoscope"
          action={
            current ? (
              <Badge tone="success" solid size="sm">
                <span className="num">#{current.queueNumber}</span>
              </Badge>
            ) : null
          }
        />
        <CardBody>
          {!current ? (
            <EmptyState icon="stethoscope" title={t('doctor.noCurrent')} />
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[1.125rem] font-semibold text-navy-900">
                    {current.patientName}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[0.8125rem] text-stone-500">
                    <span className="flex items-center gap-1.5">
                      <Icon
                        name={currentService?.icon as 'tooth'}
                        size={14}
                        className="text-sage-600"
                      />
                      {lang === 'ar' ? currentService?.ar : currentService?.fr}
                    </span>
                    <span className="num">{current.ref}</span>
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-[0.6875rem] uppercase tracking-wide text-stone-400">
                    {t('doctor.visitDuration')}
                  </p>
                  <p className="num mt-0.5 text-[1.25rem] font-semibold text-navy-900">
                    {humanDuration(current.inProgressMinutes)}
                  </p>
                </div>
              </div>

              <dl className="mt-4 grid gap-3 rounded-lg border border-shell-300 bg-shell-50 p-3.5 sm:grid-cols-3">
                <div>
                  <dt className="text-[0.6875rem] text-stone-500">{t('doctor.appointmentType')}</dt>
                  <dd className="mt-1 text-[0.8125rem] font-medium text-navy-900">
                    {current.type === 'emergency'
                      ? t('reception.typeEmergency')
                      : current.type === 'walkin'
                        ? t('reception.typeWalkin')
                        : t('reception.typeScheduled')}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.6875rem] text-stone-500">{t('doctor.arrivalStatus')}</dt>
                  <dd className="mt-1 text-[0.8125rem] font-medium text-navy-900">
                    {current.waitingMode === 'outside'
                      ? t('appointment.waitingOutside')
                      : t('appointment.checkedIn')}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.6875rem] text-stone-500">{t('doctor.waitingDuration')}</dt>
                  <dd className="num mt-1 text-[0.8125rem] font-medium text-navy-900">
                    {humanDuration(currentWaiting)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Button
                  size="md"
                  variant="success"
                  icon="check"
                  loading={busy}
                  onClick={() => setFinishId(current.appointmentId)}
                >
                  {t('doctor.finishVisit')}
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  icon="timer"
                  onClick={() => setDelayOpen(true)}
                >
                  {t('doctor.delayVisit')}
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  icon="alert"
                  className="text-[#8E3730]"
                  onClick={() => setEmergencyId(current.appointmentId)}
                >
                  {t('doctor.emergency')}
                </Button>
                <Button
                  size="md"
                  variant="ghost"
                  icon="skip"
                  onClick={async () => {
                    const result = await skipAppointment(current.appointmentId, 'doctor');
                    if (result.ok) toast.push({ tone: 'neutral', title: t('doctor.skip') });
                  }}
                >
                  {t('doctor.skip')}
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Summary + queue */}
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="h-fit">
          <CardHeader title={t('doctor.todaySummary')} icon="chart" />
          <CardBody>
            <div className="grid grid-cols-2 gap-3">
              <Stat label={t('doctor.waiting')} value={snapshot.waiting.length} icon="users" tone="warn" />
              <Stat label={t('doctor.completed')} value={snapshot.completedCount} icon="checkCircle" tone="success" />
              <Stat label={t('doctor.cancelled')} value={snapshot.cancelledCount} icon="xCircle" tone="danger" />
              <Stat label={t('doctor.noShow')} value={snapshot.noShowCount} icon="alert" tone="danger" />
            </div>
          </CardBody>
        </Card>

        <Card className="h-fit">
          <CardHeader
            title={t('queue.liveQueue')}
            subtitle={`${snapshot.waiting.length} ${t('units.patients')}`}
            icon="users"
          />
          <CardBody>
            {snapshot.waiting.length === 0 ? (
              <EmptyState icon="users" title={t('reception.noWaiting')} />
            ) : (
              <QueueVisual
                entries={[...(snapshot.current ? [snapshot.current] : []), ...snapshot.waiting]}
                current={snapshot.current}
                variant="staff"
                showPhone
              />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Finish consultation — records the measured duration */}
      <Modal
        open={finishId !== null}
        onClose={() => {
          setFinishId(null);
          setDuration('');
        }}
        title={t('doctor.confirmFinishTitle')}
        description={t('doctor.confirmFinishBody')}
        tone="neutral"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setFinishId(null);
                setDuration('');
              }}
            >
              {t('cta.back')}
            </Button>
            <Button icon="check" loading={busy} onClick={confirmFinish}>
              {t('doctor.finish')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            label={`${t('doctor.visitDuration')} (${t('doctor.minutes')})`}
            htmlFor="visitDuration"
            hint={t('doctor.confirmFinishBody')}
          >
            <Input
              id="visitDuration"
              type="number"
              inputMode="numeric"
              min={1}
              max={480}
              dir="ltr"
              className="text-start"
              value={duration}
              placeholder={
                current ? String(Math.max(1, Math.round(current.inProgressMinutes))) : ''
              }
              onChange={(e) => setDuration(e.target.value)}
            />
          </Field>
          <InfoNote tone="info" icon="info">
            {t('analytics.emptyBody')}
          </InfoNote>
        </div>
      </Modal>

      <EmergencyModal appointmentId={emergencyId} onClose={() => setEmergencyId(null)} />
      <DelayModal open={delayOpen} onClose={() => setDelayOpen(false)} />
    </div>
  );
}
