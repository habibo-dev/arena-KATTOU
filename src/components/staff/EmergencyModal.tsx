import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { InfoNote } from '@/components/ui/Form';
import { Icon } from '@/components/ui/Icon';
import { useI18n } from '@/i18n';
import { useClinic, useErrorLabel } from '@/store/clinic';
import { useToast } from '@/components/ui/Toast';
import { firstNameOnly } from '@/lib/privacy';

/**
 * Emergency flag — a staff decision only.
 * The impact warning is shown BEFORE the queue changes, and the staff member
 * has to confirm explicitly.
 */
export function EmergencyModal({
  appointmentId,
  onClose,
}: {
  appointmentId: string | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { appointments, markEmergency, snapshot, settings } = useClinic();
  const toast = useToast();
  const errorLabel = useErrorLabel();

  const appointment = appointments.find((a) => a.id === appointmentId) ?? null;
  const affected = Math.max(0, snapshot.waiting.length);

  const confirm = async () => {
    if (!appointment) return;
    const result = await markEmergency(appointment.id, 'staff');
    if (!result.ok) {
      toast.push({ tone: 'danger', title: t('errors.generic'), body: errorLabel(result.error) });
      onClose();
      return;
    }
    toast.push({
      tone: 'danger',
      title: t('reception.typeEmergency'),
      body: `${firstNameOnly(appointment.patientName)} · #${result.appointment?.queueNumber ?? ''}`,
    });
    onClose();
  };

  return (
    <Modal
      open={appointment !== null}
      onClose={onClose}
      title={t('reception.emergencyTitle')}
      tone="danger"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('cta.back')}
          </Button>
          <Button variant="danger" icon="alert" onClick={confirm}>
            {t('reception.emergencyConfirm')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <InfoNote tone="warn" icon="alert">
          <strong className="block">{t('reception.emergencyBody')}</strong>
          <span className="mt-1 block">
            {t('reception.waitingPatients')}: <span className="num">{affected}</span>
          </span>
        </InfoNote>

        {appointment ? (
          <dl className="divide-y divide-shell-200 rounded-md border border-shell-300">
            <div className="flex justify-between gap-3 px-3.5 py-2.5">
              <dt className="text-[0.8125rem] text-stone-500">{t('doctor.patientName')}</dt>
              <dd className="text-[0.8125rem] font-medium text-navy-900">
                {appointment.patientName}
              </dd>
            </div>
            <div className="flex justify-between gap-3 px-3.5 py-2.5">
              <dt className="text-[0.8125rem] text-stone-500">{t('booking.reference')}</dt>
              <dd className="num text-[0.8125rem] text-navy-900">{appointment.ref}</dd>
            </div>
          </dl>
        ) : null}

        <p className="flex items-start gap-2 text-[0.75rem] leading-relaxed text-stone-500">
          <Icon name="shield" size={14} className="mt-px shrink-0" />
          {t('reception.emergencyStaffNote')}
        </p>

        <p className="text-[0.75rem] text-stone-400">{settings.doctorName}</p>
      </div>
    </Modal>
  );
}
