import { useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Badge, Card, CardBody, CardHeader, EmptyState, Stat } from '@/components/ui/Card';
import { Input } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { Tabs, Table, THead, TH, TR, TD } from '@/components/ui/Table';
import { QueueRow, type QueueRowActions } from '@/components/staff/QueueRow';
import { AddPatientModal } from '@/components/staff/AddPatientModal';
import { DelayModal } from '@/components/staff/DelayModal';
import { EmergencyModal } from '@/components/staff/EmergencyModal';
import { StatusBadge, TypeBadge } from '@/components/queue/QueueVisual';
import { OutcomeBar } from '@/components/charts';
import { useI18n } from '@/i18n';
import { useClinic, useErrorLabel } from '@/store/clinic';
import { useSession } from '@/store/session';
import { useToast } from '@/components/ui/Toast';
import { serviceById } from '@/lib/clinic';
import { humanDuration } from '@/lib/time';
import type { AppointmentStatus } from '@/lib/types';

type Filter = 'all' | 'waiting' | 'booked' | 'completed' | 'cancelled' | 'no_show';

export default function Reception() {
  const { t, lang, formatDate } = useI18n();
  const {
    snapshot,
    today,
    appointmentsForDate,
    checkIn,
    startConsultation,
    completeConsultation,
    skipAppointment,
    cancelAppointment,
    markNoShow,
    requestReschedule,
    declareDelay,
    clinicDelayMinutes,
    appointments,
  } = useClinic();
  const { can } = useSession();
  const toast = useToast();
  const errorLabel = useErrorLabel();

  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [delayOpen, setDelayOpen] = useState(false);
  const [emergencyId, setEmergencyId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  const day = useMemo(() => appointmentsForDate(today), [appointmentsForDate, today]);

  const run = async (promise: Promise<{ ok: boolean; error?: string }>, successTitle: string) => {
    const result = await promise;
    if (!result.ok) {
      toast.push({ tone: 'danger', title: t('errors.generic'), body: errorLabel(result.error) });
      return;
    }
    toast.push({ tone: 'success', title: successTitle });
  };

  const actions: QueueRowActions = {
    onStart: (id) => void run(startConsultation(id, 'reception'), t('reception.actionStart')),
    onFinish: (id) => void run(completeConsultation(id, 'reception'), t('reception.actionFinish')),
    onSkip: (id) => void run(skipAppointment(id, 'reception'), t('reception.actionSkip')),
    onCheckIn: (id) => void run(checkIn(id, 'reception'), t('appointment.checkedIn')),
    onCancel: (id) => void run(cancelAppointment(id, 'reception'), t('appointment.cancelled')),
    onEmergency: (id) => setEmergencyId(id),
    onDelay: () => setDelayOpen(true),
    onReschedule: (id) =>
      void run(requestReschedule(id, 'reception'), t('appointment.rescheduleRequested')),
    onProfile: (id) => setProfileId(id),
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return day.filter((a) => {
      if (filter === 'waiting' && !['waiting', 'in_consultation', 'emergency', 'arrived'].includes(a.status))
        return false;
      if (filter === 'booked' && !['booked', 'confirmed'].includes(a.status)) return false;
      if (filter === 'completed' && a.status !== 'completed') return false;
      if (filter === 'cancelled' && a.status !== 'cancelled') return false;
      if (filter === 'no_show' && a.status !== 'no_show') return false;
      if (!q) return true;
      return (
        a.patientName.toLowerCase().includes(q) ||
        a.ref.toLowerCase().includes(q) ||
        a.patientPhone.includes(q.replace(/\D/g, ''))
      );
    });
  }, [day, filter, query]);

  const counts = {
    waiting: snapshot.waiting.length,
    booked: day.filter((a) => a.status === 'booked' || a.status === 'confirmed').length,
    completed: snapshot.completedCount,
    cancelled: snapshot.cancelledCount,
    noShow: snapshot.noShowCount,
  };

  const profile = appointments.find((a) => a.id === profileId) ?? null;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.35rem] font-semibold text-navy-900">{t('reception.title')}</h1>
          <p className="mt-1 text-[0.8125rem] text-stone-500">
            {t('reception.today')} · {formatDate(today)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {clinicDelayMinutes > 0 ? (
            <Badge tone="warn" icon="timer">
              {t('reception.delayActive', { n: clinicDelayMinutes })}
            </Badge>
          ) : null}
          {can('delay:declare') ? (
            <Button variant="secondary" size="md" icon="timer" onClick={() => setDelayOpen(true)}>
              {t('reception.actionDelay')}
            </Button>
          ) : null}
          {can('appointments:create') ? (
            <Button size="md" icon="plus" onClick={() => setAddOpen(true)}>
              {t('reception.actionAdd')}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat
          label={t('reception.currentPatient')}
          value={snapshot.current ? `#${snapshot.current.queueNumber}` : '—'}
          icon="activity"
          tone="info"
        />
        <Stat
          label={t('reception.nextPatient')}
          value={snapshot.next ? `#${snapshot.next.queueNumber}` : '—'}
          icon="arrowLeft"
        />
        <Stat
          label={t('reception.waitingPatients')}
          value={counts.waiting}
          icon="users"
          tone="warn"
        />
        <Stat label={t('reception.completed')} value={counts.completed} icon="checkCircle" tone="success" />
        <Stat label={t('reception.cancelled')} value={counts.cancelled} icon="xCircle" tone="danger" />
        <Stat label={t('reception.noShow')} value={counts.noShow} icon="alert" tone="danger" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Queue manager */}
        <Card className="h-fit">
          <CardHeader
            title={t('reception.queueManager')}
            subtitle={`${snapshot.entries.length} ${t('units.patients')}`}
            icon="users"
            action={
              snapshot.current ? (
                <Button size="sm" variant="success" icon="skip" onClick={() => actions.onFinish(snapshot.current!.appointmentId)}>
                  {t('reception.actionNext')}
                </Button>
              ) : snapshot.next ? (
                <Button size="sm" icon="play" onClick={() => actions.onStart(snapshot.next!.appointmentId)}>
                  {t('reception.actionStart')}
                </Button>
              ) : null
            }
          />
          <CardBody>
            {snapshot.entries.length === 0 ? (
              <EmptyState
                icon="users"
                title={t('reception.queueEmptyTitle')}
                body={t('reception.queueEmptyBody')}
                action={
                  can('appointments:create') ? (
                    <Button icon="plus" onClick={() => setAddOpen(true)}>
                      {t('reception.actionAdd')}
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="space-y-2">
                {snapshot.entries.map((entry) => (
                  <QueueRow
                    key={entry.appointmentId}
                    entry={entry}
                    actions={actions}
                    isCurrent={entry.status === 'in_consultation'}
                    showPhone
                  />
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Today's appointments */}
        <Card className="h-fit">
          <CardHeader
            title={t('reception.allAppointments')}
            subtitle={`${day.length} ${t('units.patients')}`}
            icon="calendar"
          />

          <div className="border-b border-shell-300 px-4 py-3 sm:px-5">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('reception.searchPlaceholder')}
              icon="search"
              aria-label={t('reception.searchPlaceholder')}
            />
            <Tabs<Filter>
              className="mt-3"
              ariaLabel={t('reception.allAppointments')}
              active={filter}
              onChange={setFilter}
              tabs={[
                { value: 'all', label: t('reception.filterAll'), count: day.length },
                { value: 'waiting', label: t('reception.waitingPatients'), count: counts.waiting },
                { value: 'booked', label: t('booking.step2'), count: counts.booked },
                { value: 'completed', label: t('reception.completed'), count: counts.completed },
                { value: 'cancelled', label: t('reception.cancelled'), count: counts.cancelled },
                { value: 'no_show', label: t('reception.noShow'), count: counts.noShow },
              ]}
            />
          </div>

          <CardBody className="p-0">
            {filtered.length === 0 ? (
              <EmptyState icon="search" title={t('reception.noResults')} />
            ) : (
              <>
                {/* Card list on phones, table from sm up */}
                <ul className="divide-y divide-shell-200 sm:hidden">
                  {filtered.map((a) => {
                    const service = serviceById(a.serviceId);
                    return (
                      <li key={a.id} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[0.875rem] font-medium text-navy-900">
                              {a.patientName}
                            </p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.75rem] text-stone-500">
                              <span className="num" dir="ltr">
                                {a.slot ?? '—'}
                              </span>
                              <span>{lang === 'ar' ? service.ar : service.fr}</span>
                            </p>
                          </div>
                          <StatusBadge status={a.status} size="sm" />
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {!a.checkedInAt && a.status !== 'cancelled' && a.status !== 'completed' ? (
                            <Button size="sm" variant="secondary" icon="check" onClick={() => actions.onCheckIn(a.id)}>
                              {t('reception.actionCheckIn')}
                            </Button>
                          ) : null}
                          <Button size="sm" variant="ghost" icon="user" onClick={() => setProfileId(a.id)}>
                            {t('reception.patientProfile')}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="hidden sm:block">
                  <Table caption={t('a11y.tableOfAppointments')}>
                    <THead>
                      <TH>{t('booking.time')}</TH>
                      <TH>{t('reception.patientName')}</TH>
                      <TH>{t('booking.service')}</TH>
                      <TH>{t('appointment.statusLabel')}</TH>
                      <TH align="end" />
                    </THead>
                    <tbody>
                      {filtered.map((a) => {
                        const service = serviceById(a.serviceId);
                        return (
                          <TR key={a.id} selected={a.status === 'in_consultation'}>
                            <TD className="num whitespace-nowrap">{a.slot ?? '—'}</TD>
                            <TD>
                              <span className="block font-medium text-navy-900">{a.patientName}</span>
                              <span className="num block text-[0.6875rem] text-stone-400">{a.ref}</span>
                            </TD>
                            <TD>
                              <span className="flex items-center gap-1.5">
                                <Icon name={service.icon as 'tooth'} size={14} className="text-sage-600" />
                                {lang === 'ar' ? service.ar : service.fr}
                              </span>
                              {a.type !== 'scheduled' ? (
                                <span className="mt-1 block">
                                  <TypeBadge type={a.type} />
                                </span>
                              ) : null}
                            </TD>
                            <TD>
                              <StatusBadge status={a.status} size="sm" />
                            </TD>
                            <TD align="end">
                              <div className="flex justify-end gap-1.5">
                                {!a.checkedInAt &&
                                a.status !== 'cancelled' &&
                                a.status !== 'completed' &&
                                a.status !== 'no_show' ? (
                                  <Button size="sm" variant="secondary" onClick={() => actions.onCheckIn(a.id)}>
                                    {t('reception.actionCheckIn')}
                                  </Button>
                                ) : null}
                                {a.status === 'booked' || a.status === 'confirmed' ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => void run(markNoShow(a.id, 'reception'), t('reception.noShow'))}
                                  >
                                    {t('reception.noShow')}
                                  </Button>
                                ) : null}
                                <Button size="sm" variant="ghost" icon="user" onClick={() => setProfileId(a.id)} />
                              </div>
                            </TD>
                          </TR>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Outcome distribution */}
      <Card>
        <CardHeader title={t('reception.today')} icon="chart" />
        <CardBody>
          <OutcomeBar
            segments={[
              { label: t('reception.waitingPatients'), value: counts.waiting, color: '#B08242' },
              { label: t('reception.completed'), value: counts.completed, color: '#3E7C69' },
              { label: t('reception.cancelled'), value: counts.cancelled, color: '#A8433C' },
              { label: t('reception.noShow'), value: counts.noShow, color: '#A8A49C' },
              {
                label: t('booking.step2'),
                value: counts.booked,
                color: '#2E536E',
              },
            ]}
          />
          {clinicDelayMinutes > 0 ? (
            <p className="mt-4 flex items-center gap-2 rounded-md border border-clay-100 bg-clay-50/60 px-3.5 py-2.5 text-[0.8125rem] text-clay-700">
              <Icon name="timer" size={15} />
              {t('reception.delayActive', { n: clinicDelayMinutes })}
              <button
                type="button"
                className="ms-auto text-[0.75rem] font-semibold underline underline-offset-4"
                onClick={() => void declareDelay(0, 'reception')}
              >
                {t('reception.clearDelay')}
              </button>
            </p>
          ) : null}
        </CardBody>
      </Card>

      {/* Modals */}
      <AddPatientModal open={addOpen} onClose={() => setAddOpen(false)} />
      <DelayModal open={delayOpen} onClose={() => setDelayOpen(false)} />
      <EmergencyModal appointmentId={emergencyId} onClose={() => setEmergencyId(null)} />

      <Modal
        open={profile !== null}
        onClose={() => setProfileId(null)}
        title={profile?.patientName ?? ''}
        description={t('reception.patientProfile')}
      >
        {profile ? (
          <div className="space-y-3">
            <dl className="divide-y divide-shell-200 rounded-md border border-shell-300">
              <ProfileRow label={t('booking.reference')} value={profile.ref} mono />
              <ProfileRow
                label={t('booking.phone')}
                value={profile.patientPhone.replace('+213', '0')}
                mono
              />
              <ProfileRow
                label={t('booking.service')}
                value={
                  lang === 'ar'
                    ? serviceById(profile.serviceId).ar
                    : serviceById(profile.serviceId).fr
                }
              />
              <ProfileRow label={t('booking.date')} value={formatDate(profile.date)} />
              <ProfileRow label={t('booking.time')} value={profile.slot ?? '—'} mono />
            </dl>

            {profile.checkedInAt && profile.consultationStartedAt ? (
              <p className="text-[0.8125rem] text-stone-600">
                {t('doctor.waitingDuration')}:{' '}
                <strong className="num">
                  {humanDuration(
                    (new Date(profile.consultationStartedAt).getTime() -
                      new Date(profile.checkedInAt).getTime()) /
                      60000,
                  )}
                </strong>
              </p>
            ) : null}

            {profile.history.length > 0 ? (
              <div>
                <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-wide text-stone-400">
                  {t('admin.dataSection')}
                </p>
                <ol className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-shell-300 bg-shell-50 p-3">
                  {[...profile.history].reverse().map((event, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-3 text-[0.75rem]">
                      <span className="num text-stone-500">{event.action}</span>
                      <span className="text-stone-400">
                        {new Date(event.at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {profile.status !== 'cancelled' && profile.status !== 'completed' ? (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon="edit"
                    onClick={() => actions.onReschedule(profile.id)}
                  >
                    {t('reception.actionReschedule')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[#8E3730]"
                    icon="trash"
                    onClick={() => actions.onCancel(profile.id)}
                  >
                    {t('reception.actionCancel')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="alert"
                    onClick={() => {
                      setProfileId(null);
                      setEmergencyId(profile.id);
                    }}
                  >
                    {t('reception.actionEmergency')}
                  </Button>
                </>
              ) : null}
            </div>

            <p className="text-[0.6875rem] leading-relaxed text-stone-400">
              {t('reception.walkInNote')}
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function ProfileRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
      <dt className="text-[0.8125rem] text-stone-500">{label}</dt>
      <dd className={`text-[0.8125rem] font-medium text-navy-900 ${mono ? 'num' : ''}`}>{value}</dd>
    </div>
  );
}

export type { AppointmentStatus };
