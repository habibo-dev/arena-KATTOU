import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, FormError, InfoNote, Input, Select } from '@/components/ui/Form';
import { Icon } from '@/components/ui/Icon';
import { useI18n } from '@/i18n';
import { useClinic, useErrorLabel } from '@/store/clinic';
import { useToast } from '@/components/ui/Toast';
import { SERVICES } from '@/lib/clinic';
import type { AppointmentType, ServiceId } from '@/lib/types';

/** Walk-in / appointment / emergency capture. No medical record is created. */
export function AddPatientModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useI18n();
  const { addWalkIn } = useClinic();
  const toast = useToast();
  const errorLabel = useErrorLabel();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<AppointmentType>('walkin');
  const [serviceId, setServiceId] = useState<ServiceId>('soins');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setFullName('');
    setPhone('');
    setType('walkin');
    setServiceId('soins');
    setError(null);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    const result = await addWalkIn({
      fullName,
      phone,
      type,
      serviceId,
      actor: 'reception',
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorLabel(result.error));
      return;
    }
    toast.push({
      tone: 'success',
      title: t('reception.addPatient'),
      body: `${fullName} · #${result.appointment?.queueNumber ?? ''}`,
    });
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={t('reception.addPatient')}
      description={t('reception.walkInNote')}
      size="md"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            {t('cta.cancel')}
          </Button>
          <Button icon="plus" loading={busy} onClick={submit}>
            {t('reception.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? <FormError message={error} /> : null}

        <Field label={t('reception.patientName')} htmlFor="walkinName" required>
          <Input
            id="walkinName"
            value={fullName}
            maxLength={90}
            autoComplete="off"
            onChange={(e) => {
              setFullName(e.target.value);
              setError(null);
            }}
          />
        </Field>

        <Field label={t('reception.patientPhone')} htmlFor="walkinPhone" required>
          <Input
            id="walkinPhone"
            value={phone}
            type="tel"
            dir="ltr"
            inputMode="tel"
            className="text-start"
            placeholder="0558 41 80 73"
            autoComplete="off"
            onChange={(e) => {
              setPhone(e.target.value);
              setError(null);
            }}
          />
        </Field>

        <Field label={t('reception.appointmentType')} htmlFor="walkinType">
          <Select
            id="walkinType"
            value={type}
            onChange={(e) => setType(e.target.value as AppointmentType)}
          >
            <option value="walkin">{t('reception.typeWalkin')}</option>
            <option value="scheduled">{t('reception.typeScheduled')}</option>
            <option value="emergency">{t('reception.typeEmergency')}</option>
          </Select>
        </Field>

        <Field label={t('booking.service')} htmlFor="walkinService">
          <Select
            id="walkinService"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value as ServiceId)}
          >
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {lang === 'ar' ? s.ar : lang === 'fr' ? s.fr : s.en}
              </option>
            ))}
          </Select>
        </Field>

        {type === 'emergency' ? (
          <InfoNote tone="warn" icon="alert">
            {t('reception.emergencyBody')}
          </InfoNote>
        ) : null}

        <p className="flex items-start gap-2 text-[0.75rem] leading-relaxed text-stone-500">
          <Icon name="shield" size={14} className="mt-px shrink-0" />
          {t('reception.walkInNote')}
        </p>
      </div>
    </Modal>
  );
}
