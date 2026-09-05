import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { StatusBadge } from '@/components/queue/QueueVisual';
import { useI18n } from '@/i18n';
import { useClinic, useErrorLabel } from '@/store/clinic';
import { useToast } from '@/components/ui/Toast';
import { serviceById } from '@/lib/clinic';

/**
 * /checkin/:token — the page a scanned reception QR code opens.
 * One confirmation tap, no forms, no account.
 */
export default function CheckInPage() {
  const { token = '' } = useParams();
  const { t, lang, formatDate } = useI18n();
  const { findByToken, checkIn } = useClinic();
  const toast = useToast();
  const errorLabel = useErrorLabel();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const appointment = findByToken(token);

  if (!appointment) {
    return (
      <section className="container-page py-14">
        <div className="mx-auto max-w-sm text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-shell-200 text-stone-400">
            <Icon name="xCircle" size={26} />
          </span>
          <h1 className="mt-4 text-[1.125rem] font-semibold text-navy-900">
            {t('appointment.invalidLink')}
          </h1>
          <Button className="mt-5" onClick={() => navigate('/')}>
            {t('errors.backHome')}
          </Button>
        </div>
      </section>
    );
  }

  const service = serviceById(appointment.serviceId);
  const alreadyCheckedIn = appointment.checkedInAt !== null;

  const confirm = async () => {
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
    navigate(`/a/${token}/queue`);
  };

  return (
    <section className="container-page py-10">
      <div className="mx-auto max-w-sm">
        <Card>
          <div className="surface-navy px-5 py-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-shell-50/10 text-shell-50 ring-1 ring-inset ring-shell-50/20">
              <Icon name="qr" size={24} />
            </span>
            <h1 className="mt-3.5 text-[1.125rem] font-semibold text-shell-50">
              {t('appointment.checkInTitle')}
            </h1>
            <p className="mt-1.5 text-[0.8125rem] text-shell-200/70">{t('appointment.checkInBody')}</p>
          </div>

          <CardBody>
            <dl className="divide-y divide-shell-200">
              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-[0.8125rem] text-stone-500">{t('booking.reference')}</dt>
                <dd className="num text-[0.875rem] font-semibold text-navy-900">
                  {appointment.ref}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-[0.8125rem] text-stone-500">{t('booking.service')}</dt>
                <dd className="text-[0.875rem] text-navy-800">
                  {lang === 'ar' ? service.ar : lang === 'fr' ? service.fr : service.en}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-[0.8125rem] text-stone-500">{t('booking.date')}</dt>
                <dd className="text-[0.875rem] text-navy-800">{formatDate(appointment.date)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-[0.8125rem] text-stone-500">{t('appointment.statusLabel')}</dt>
                <dd>
                  <StatusBadge status={appointment.status} size="sm" />
                </dd>
              </div>
            </dl>

            {alreadyCheckedIn ? (
              <div className="mt-4 rounded-md border border-sage-200 bg-sage-50 px-3.5 py-3 text-center">
                <p className="text-[0.8125rem] font-medium text-sage-800">
                  {t('appointment.checkedIn')}
                  {appointment.queueNumber !== null
                    ? ` · #${appointment.queueNumber}`
                    : ''}
                </p>
              </div>
            ) : null}

            <div className="mt-4 grid gap-2.5">
              <Button size="lg" block icon="check" loading={busy} onClick={confirm}>
                {t('appointment.checkIn')}
              </Button>
              <Button variant="ghost" size="md" block onClick={() => navigate(`/a/${token}`)}>
                {t('appointment.title')}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
