import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Button, AnchorButton } from '@/components/ui/Button';
import { Badge, Card, CardBody } from '@/components/ui/Card';
import { InfoNote, SegmentedControl } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { QrCode } from '@/components/ui/QrCode';
import { StatusBadge } from '@/components/queue/QueueVisual';
import { useI18n } from '@/i18n';
import { useClinic, useErrorLabel } from '@/store/clinic';
import { useToast } from '@/components/ui/Toast';
import { serviceById } from '@/lib/clinic';
import { maskPhone } from '@/lib/validation';
import { getLastBookingToken } from '@/lib/lastBooking';
import type { WaitingMode } from '@/lib/types';

/**
 * /a/:token — the patient's own appointment.
 *
 * The token is an opaque capability: it carries no name, phone number or
 * medical detail, and it is the only secret needed to reach this page.
 */
export default function AppointmentPage() {
  const { token = '' } = useParams();
  const { t, lang, formatDate } = useI18n();
  const {
    findByToken,
    settings,
    checkIn,
    cancelAppointment,
    requestReschedule,
    setWaitingMode,
    etaFor,
  } = useClinic();
  const toast = useToast();
  const errorLabel = useErrorLabel();
  const navigate = useNavigate();

  const appointment = findByToken(token);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [busy, setBusy] = useState(false);

  const checkInUrl = useMemo(
    () => `${window.location.origin}${window.location.pathname}#/checkin/${token}`,
    [token],
  );

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
          <p className="mt-2 text-[0.875rem] leading-relaxed text-stone-600">
            {t('appointment.notFound')}
          </p>
          <div className="mt-6 grid gap-2.5">
            <Button onClick={() => navigate('/appointment')} icon="search">
              {t('appointment.lookupTitle')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/book')}
              icon="calendar"
            >
              {t('cta.book')}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const service = serviceById(appointment.serviceId);
  const checkedIn = appointment.checkedInAt !== null;
  const eta = etaFor(appointment);
  const canCancel =
    appointment.status !== 'cancelled' &&
    appointment.status !== 'completed' &&
    appointment.status !== 'in_consultation';
  const canCheckIn =
    appointment.date === new Date().toISOString().slice(0, 10) &&
    appointment.status !== 'cancelled' &&
    appointment.status !== 'completed';

  const handleCheckIn = async () => {
    setBusy(true);
    const result = await checkIn(appointment.id, 'patient');
    setBusy(false);
    if (!result.ok) {
      toast.push({ tone: 'danger', title: t('errors.generic'), body: errorLabel(result.error) });
      return;
    }
    toast.push({
      tone: 'success',
      title: t('appointment.checkedIn'),
      body: result.appointment?.queueNumber
        ? `${t('appointment.queueNumber')} #${result.appointment.queueNumber}`
        : undefined,
    });
    if (result.appointment) navigate(`/a/${token}/queue`);
  };

  const handleCancel = async () => {
    setBusy(true);
    const result = await cancelAppointment(appointment.id, 'patient');
    setBusy(false);
    setConfirmCancel(false);
    if (!result.ok) {
      toast.push({ tone: 'danger', title: t('errors.generic'), body: errorLabel(result.error) });
      return;
    }
    toast.push({ tone: 'neutral', title: t('appointment.cancelled') });
  };

  const handleReschedule = async () => {
    setBusy(true);
    const result = await requestReschedule(appointment.id, 'patient');
    setBusy(false);
    if (!result.ok) {
      toast.push({ tone: 'danger', title: t('errors.generic'), body: errorLabel(result.error) });
      return;
    }
    toast.push({ tone: 'info', title: t('appointment.rescheduleRequested') });
  };

  return (
    <section className="container-page py-6 sm:py-10">
      <div className="mx-auto max-w-lg space-y-4">
        {/* Status banner */}
        <Card className="overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-shell-300 px-4 py-3.5 sm:px-5">
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-stone-400">
                {t('appointment.title')}
              </p>
              <p className="num mt-1 text-[1rem] font-semibold text-navy-900">
                {appointment.ref}
              </p>
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          <CardBody className="p-0">
            <dl className="divide-y divide-shell-200">
              <InfoRow label={t('booking.doctor')}>
                <span className="text-[0.875rem] text-navy-800">{settings.doctorName}</span>
                <span className="ms-1.5 text-[0.75rem] text-stone-500" lang="fr">
                  {settings.doctorTitle}
                </span>
              </InfoRow>
              <InfoRow label={t('booking.service')}>
                <span className="flex items-center gap-2 text-[0.875rem] text-navy-800">
                  <Icon name={service.icon as 'tooth'} size={16} className="text-sage-600" />
                  {lang === 'ar' ? service.ar : lang === 'fr' ? service.fr : service.en}
                </span>
              </InfoRow>
              <InfoRow label={t('booking.date')}>
                <span className="text-[0.875rem] text-navy-800">{formatDate(appointment.date)}</span>
              </InfoRow>
              {appointment.slot ? (
                <InfoRow label={t('booking.time')}>
                  <span className="num text-[0.875rem] font-semibold text-navy-800" dir="ltr">
                    {appointment.slot}
                  </span>
                </InfoRow>
              ) : null}
              <InfoRow label={t('booking.phone')}>
                <span className="num text-[0.875rem] text-navy-800">{maskPhone(appointment.patientPhone)}</span>
              </InfoRow>
              {appointment.queueNumber !== null ? (
                <InfoRow label={t('appointment.queueNumber')}>
                  <span className="num rounded bg-sage-50 px-2 py-1 text-[1rem] font-semibold text-sage-800 ring-1 ring-inset ring-sage-100">
                    #{appointment.queueNumber}
                  </span>
                </InfoRow>
              ) : null}
            </dl>
          </CardBody>
        </Card>

        {/* Check-in */}
        {canCheckIn && !checkedIn ? (
          <Card>
            <CardBody>
              <h2 className="text-[0.9375rem] font-semibold text-navy-900">
                {t('appointment.checkInTitle')}
              </h2>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-stone-600">
                {t('appointment.checkInBody')}
              </p>
              <div className="mt-4 grid gap-2.5">
                <Button size="lg" block icon="check" loading={busy} onClick={handleCheckIn}>
                  {t('appointment.checkIn')}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  block
                  icon="qr"
                  onClick={() => setShowQr(true)}
                >
                  {t('appointment.checkInQr')}
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : null}

        {/* Waiting mode */}
        {checkedIn && appointment.status !== 'completed' && appointment.status !== 'cancelled' ? (
          <Card>
            <CardBody>
              <h2 className="text-[0.9375rem] font-semibold text-navy-900">
                {t('appointment.waitingModeTitle')}
              </h2>
              <div className="mt-3">
                <SegmentedControl<WaitingMode>
                  ariaLabel={t('appointment.waitingModeTitle')}
                  value={appointment.waitingMode}
                  onChange={(mode) => void setWaitingMode(appointment.id, mode)}
                  options={[
                    { value: 'inside', label: t('appointment.waitingInside'), icon: 'building' },
                    { value: 'outside', label: t('appointment.waitingOutside'), icon: 'pin' },
                  ]}
                />
              </div>
              {appointment.waitingMode === 'outside' ? (
                <p className="mt-3">
                  <InfoNote tone="success" icon="bell">
                    {t('appointment.waitingOutsideNote')}
                  </InfoNote>
                </p>
              ) : null}

              {eta ? (
                <div className="mt-4 rounded-lg border border-shell-300 bg-shell-50 px-4 py-3">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    {t('queue.etaLabel')}
                  </p>
                  <p className="num mt-1 text-[1.5rem] font-semibold leading-none text-navy-900">
                    {eta.fromTime} – {eta.toTime}
                  </p>
                  <p className="mt-1.5 text-[0.75rem] text-stone-500">{t('queue.disclaimer')}</p>
                </div>
              ) : null}

              <Button
                size="lg"
                block
                icon="hourglass"
                className="mt-4"
                onClick={() => navigate(`/a/${token}/queue`)}
              >
                {t('cta.followQueue')}
              </Button>
            </CardBody>
          </Card>
        ) : null}

        {appointment.status === 'completed' ? (
          <InfoNote tone="success" icon="checkCircle">
            {t('queue.completed')}
          </InfoNote>
        ) : null}
        {appointment.status === 'cancelled' ? (
          <InfoNote tone="warn" icon="xCircle">
            {t('queue.cancelled')}
          </InfoNote>
        ) : null}

        {/* Actions */}
        {canCancel ? (
          <Card>
            <CardBody className="space-y-2.5">
              <Button variant="secondary" block icon="edit" onClick={handleReschedule} loading={busy}>
                {t('appointment.reschedule')}
              </Button>
              <Button
                variant="ghost"
                block
                icon="trash"
                className="text-[#8E3730] hover:bg-[#FBEEED]"
                onClick={() => setConfirmCancel(true)}
              >
                {t('appointment.cancelTitle')}
              </Button>
            </CardBody>
          </Card>
        ) : null}

        <Card>
          <CardBody className="space-y-2.5">
            <AnchorButton
              href={`tel:${settings.phones[0].international}`}
              variant="secondary"
              block
              icon="phone"
            >
              {t('cta.call')}
            </AnchorButton>
            <Link to="/book" className="block">
              <Button variant="ghost" block icon="calendar">
                {t('booking.bookAnother')}
              </Button>
            </Link>
          </CardBody>
        </Card>

        <p className="flex items-center justify-center gap-1.5 text-[0.6875rem] text-stone-400">
          <Icon name="shield" size={12} />
          {t('booking.privacyLine')}
        </p>
        {getLastBookingToken() === token ? (
          <Badge tone="neutral" size="sm" className="mx-auto flex w-fit">
            {t('booking.reference')}: {appointment.ref}
          </Badge>
        ) : null}
      </div>

      {/* QR check-in */}
      <Modal
        open={showQr}
        onClose={() => setShowQr(false)}
        title={t('appointment.checkInQr')}
        description={t('appointment.checkInBody')}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <QrCode value={checkInUrl} size={196} label={t('appointment.checkInQr')} />
          <p className="text-center text-[0.8125rem] leading-relaxed text-stone-600">
            {t('appointment.checkInBody')}
          </p>
          <p className="num rounded bg-shell-100 px-3 py-1.5 text-[0.8125rem] font-semibold text-navy-800">
            {appointment.ref}
          </p>
          <Button block icon="check" onClick={handleCheckIn} loading={busy}>
            {t('appointment.checkIn')}
          </Button>
        </div>
      </Modal>

      {/* Cancel confirmation */}
      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title={t('appointment.cancelTitle')}
        description={t('appointment.cancelBody')}
        tone="danger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
              {t('cta.back')}
            </Button>
            <Button variant="danger" icon="trash" loading={busy} onClick={handleCancel}>
              {t('appointment.cancelConfirm')}
            </Button>
          </>
        }
      >
        <div className="rounded-md border border-shell-300 bg-shell-50 px-3.5 py-3">
          <dl className="space-y-1.5 text-[0.8125rem]">
            <div className="flex justify-between gap-3">
              <dt className="text-stone-500">{t('booking.date')}</dt>
              <dd className="text-navy-800">{formatDate(appointment.date)}</dd>
            </div>
            {appointment.slot ? (
              <div className="flex justify-between gap-3">
                <dt className="text-stone-500">{t('booking.time')}</dt>
                <dd className="num text-navy-800" dir="ltr">
                  {appointment.slot}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </Modal>
    </section>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
      <dt className="shrink-0 text-[0.8125rem] text-stone-500">{label}</dt>
      <dd className="min-w-0 text-end">{children}</dd>
    </div>
  );
}
