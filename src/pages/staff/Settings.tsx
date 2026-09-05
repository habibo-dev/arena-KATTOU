import { useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field, InfoNote, Input, Select, Switch } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { useI18n } from '@/i18n';
import { useClinic } from '@/store/clinic';
import { useToast } from '@/components/ui/Toast';
import { SERVICES } from '@/lib/clinic';
import { DEFAULT_CLINIC_SETTINGS } from '@/lib/clinic';
import type { EtaConfig, OpeningHoursDay, ServiceId } from '@/lib/types';
import { safeInt } from '@/lib/validation';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function Settings() {
  const { t, lang, weekdayName } = useI18n();
  const { settings, updateSettings, exportData, resetData, loadDemoData, demoMode } = useClinic();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [confirmReset, setConfirmReset] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const save = async () => {
    await updateSettings({});
    toast.push({ tone: 'success', title: t('admin.settingsSaved') });
  };

  const patchEta = (patch: Partial<EtaConfig>) =>
    void updateSettings({ eta: { ...settings.eta, ...patch } });

  const patchServiceDuration = (id: ServiceId, minutes: number) =>
    patchEta({ serviceDurations: { ...settings.eta.serviceDurations, [id]: minutes } });

  const patchHours = (day: number, patch: Partial<OpeningHoursDay>) => {
    const current = settings.openingHours[day] ?? { open: null, close: null };
    void updateSettings({ openingHours: { ...settings.openingHours, [day]: { ...current, ...patch } } });
  };

  const onPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPhotoError(null);
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError(t('admin.photoTooLarge'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null;
      if (dataUrl) void updateSettings({ doctorPhotoDataUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kattou-clinic-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hoursConfigured = Object.values(settings.openingHours).some((d) => d?.open && d?.close);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.35rem] font-semibold text-navy-900">{t('staff.navSettings')}</h1>
          <p className="mt-1 text-[0.8125rem] text-stone-500">{t('admin.settingsGeneral')}</p>
        </div>
        <Button icon="check" onClick={save}>
          {t('admin.saveSettings')}
        </Button>
      </div>

      {/* Clinic information */}
      <Card>
        <CardHeader title={t('admin.settingsGeneral')} icon="building" />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('about.title')} htmlFor="doctorName">
              <Input
                id="doctorName"
                value={settings.doctorName}
                onChange={(e) => void updateSettings({ doctorName: e.target.value })}
              />
            </Field>
            <Field label={t('about.role')} htmlFor="doctorTitle">
              <Input
                id="doctorTitle"
                value={settings.doctorTitle}
                dir="ltr"
                className="text-start"
                onChange={(e) => void updateSettings({ doctorTitle: e.target.value })}
              />
            </Field>
            <Field label={t('location.addressLabel')} htmlFor="addr1">
              <Input
                id="addr1"
                value={settings.addressLine1}
                dir="ltr"
                className="text-start"
                onChange={(e) => void updateSettings({ addressLine1: e.target.value })}
              />
            </Field>
            <Field label={t('location.addressLabel')} htmlFor="addr2">
              <Input
                id="addr2"
                value={settings.addressLine2}
                dir="ltr"
                className="text-start"
                onChange={(e) => void updateSettings({ addressLine2: e.target.value, city: e.target.value })}
              />
            </Field>
            <Field label={t('location.title')} htmlFor="wilaya">
              <Input
                id="wilaya"
                value={settings.wilaya}
                dir="ltr"
                className="text-start"
                onChange={(e) => void updateSettings({ wilaya: e.target.value })}
              />
            </Field>
            <Field label="WhatsApp" htmlFor="wa">
              <Input
                id="wa"
                value={settings.whatsappInternational}
                dir="ltr"
                className="text-start"
                onChange={(e) => void updateSettings({ whatsappInternational: e.target.value })}
              />
            </Field>
          </div>

          <Field label={t('cta.openMap')} htmlFor="mapsQuery" hint={t('location.mapHelp')}>
            <Input
              id="mapsQuery"
              value={settings.mapsQuery}
              dir="ltr"
              className="text-start"
              onChange={(e) => void updateSettings({ mapsQuery: e.target.value })}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            {settings.phones.map((phone, index) => (
              <div key={phone.value} className="grid grid-cols-[1fr_1.4fr] gap-2">
                <Input
                  aria-label={phone.label}
                  value={phone.label}
                  dir="ltr"
                  className="text-start"
                  onChange={(e) => {
                    const next = [...settings.phones];
                    next[index] = { ...phone, label: e.target.value };
                    void updateSettings({ phones: next });
                  }}
                />
                <Input
                  aria-label={t('location.phoneLabel')}
                  value={phone.value}
                  dir="ltr"
                  className="num text-start"
                  onChange={(e) => {
                    const next = [...settings.phones];
                    next[index] = { ...phone, value: e.target.value };
                    void updateSettings({ phones: next });
                  }}
                />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Opening hours */}
      <Card>
        <CardHeader title={t('admin.settingsHours')} icon="clock" />
        <CardBody className="space-y-3">
          {!hoursConfigured ? (
            <InfoNote tone="warn" icon="alert">
              {t('admin.hoursEmpty')}
            </InfoNote>
          ) : null}

          <ul className="divide-y divide-shell-200 rounded-lg border border-shell-300">
            {DAY_ORDER.map((day) => {
              const value = settings.openingHours[day] ?? { open: null, close: null };
              return (
                <li
                  key={day}
                  className="flex flex-wrap items-center gap-3 px-3.5 py-2.5"
                >
                  <span className="w-24 shrink-0 text-[0.8125rem] font-medium text-navy-800">
                    {weekdayName(day)}
                  </span>
                  <Input
                    type="time"
                    aria-label={`${weekdayName(day)} open`}
                    value={value.open ?? ''}
                    dir="ltr"
                    className="num h-10 min-h-10 flex-1 text-start sm:max-w-32"
                    onChange={(e) => patchHours(day, { open: e.target.value || null })}
                  />
                  <span className="text-stone-400">–</span>
                  <Input
                    type="time"
                    aria-label={`${weekdayName(day)} close`}
                    value={value.close ?? ''}
                    dir="ltr"
                    className="num h-10 min-h-10 flex-1 text-start sm:max-w-32"
                    onChange={(e) => patchHours(day, { close: e.target.value || null })}
                  />
                  <button
                    type="button"
                    className="ms-auto shrink-0 text-[0.75rem] font-medium text-stone-400 hover:text-[#8E3730]"
                    onClick={() => patchHours(day, { open: null, close: null })}
                  >
                    {t('cta.cancel')}
                  </button>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>

      {/* Booking window */}
      <Card>
        <CardHeader title={t('admin.settingsBooking')} icon="calendar" />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label={t('booking.step3')} htmlFor="firstSlot">
              <Input
                id="firstSlot"
                type="time"
                dir="ltr"
                className="num text-start"
                value={settings.bookingWindow.firstSlot}
                onChange={(e) =>
                  void updateSettings({
                    bookingWindow: { ...settings.bookingWindow, firstSlot: e.target.value },
                  })
                }
              />
            </Field>
            <Field label={t('booking.step3')} htmlFor="lastSlot">
              <Input
                id="lastSlot"
                type="time"
                dir="ltr"
                className="num text-start"
                value={settings.bookingWindow.lastSlot}
                onChange={(e) =>
                  void updateSettings({
                    bookingWindow: { ...settings.bookingWindow, lastSlot: e.target.value },
                  })
                }
              />
            </Field>
            <Field label={t('services.durationLabel')} htmlFor="slotStep">
              <Input
                id="slotStep"
                type="number"
                min={5}
                max={120}
                dir="ltr"
                className="num text-start"
                value={settings.bookingWindow.slotStepMinutes}
                onChange={(e) =>
                  void updateSettings({
                    bookingWindow: {
                      ...settings.bookingWindow,
                      slotStepMinutes: safeInt(e.target.value, 5, 120, 30),
                    },
                  })
                }
              />
            </Field>
            <Field label={t('booking.slotsLeft', { n: '' })} htmlFor="maxPerSlot">
              <Input
                id="maxPerSlot"
                type="number"
                min={1}
                max={12}
                dir="ltr"
                className="num text-start"
                value={settings.bookingWindow.maxPerSlot}
                onChange={(e) =>
                  void updateSettings({
                    bookingWindow: {
                      ...settings.bookingWindow,
                      maxPerSlot: safeInt(e.target.value, 1, 12, 2),
                    },
                  })
                }
              />
            </Field>
          </div>

          <Field label={t('booking.closedDay')} htmlFor="openWeekdays">
            <Select
              id="openWeekdays"
              multiple
              size={7}
              value={settings.bookingWindow.openWeekdays.map(String)}
              onChange={(e) =>
                void updateSettings({
                  bookingWindow: {
                    ...settings.bookingWindow,
                    openWeekdays: [...e.target.selectedOptions].map((o) => Number(o.value)),
                  },
                })
              }
            >
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <option key={d} value={d}>
                  {weekdayName(d)}
                </option>
              ))}
            </Select>
          </Field>
        </CardBody>
      </Card>

      {/* ETA engine */}
      <Card>
        <CardHeader
          title={t('admin.settingsEta')}
          subtitle={t('services.durationNote')}
          icon="timer"
        />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t('analytics.avgVisit')} htmlFor="defaultDuration">
              <Input
                id="defaultDuration"
                type="number"
                min={5}
                max={180}
                dir="ltr"
                className="num text-start"
                value={settings.eta.defaultConsultationMinutes}
                onChange={(e) =>
                  patchEta({
                    defaultConsultationMinutes: safeInt(e.target.value, 5, 180, 25),
                  })
                }
              />
            </Field>
            <Field label={t('reception.actionDelay')} htmlFor="buffer">
              <Input
                id="buffer"
                type="number"
                min={0}
                max={30}
                dir="ltr"
                className="num text-start"
                value={settings.eta.bufferMinutes}
                onChange={(e) => patchEta({ bufferMinutes: safeInt(e.target.value, 0, 30, 5) })}
              />
            </Field>
            <Field label={t('reception.typeEmergency')} htmlFor="emergency">
              <Input
                id="emergency"
                type="number"
                min={0}
                max={120}
                dir="ltr"
                className="num text-start"
                value={settings.eta.emergencyInterruptMinutes}
                onChange={(e) =>
                  patchEta({ emergencyInterruptMinutes: safeInt(e.target.value, 0, 120, 20) })
                }
              />
            </Field>
          </div>

          <div>
            <p className="mb-2 text-[0.8125rem] font-medium text-navy-800">
              {t('analytics.byService')}
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-shell-300 px-3 py-2"
                >
                  <span className="min-w-0 truncate text-[0.8125rem] text-navy-800">
                    {lang === 'ar' ? s.ar : s.fr}
                  </span>
                  <Input
                    type="number"
                    min={5}
                    max={180}
                    aria-label={`${s.code} ${t('services.minutes')}`}
                    dir="ltr"
                    className="num h-9 min-h-9 w-20 shrink-0 text-start"
                    value={settings.eta.serviceDurations[s.id] ?? DEFAULT_CLINIC_SETTINGS.eta.serviceDurations[s.id]}
                    onChange={(e) =>
                      patchServiceDuration(s.id, safeInt(e.target.value, 5, 180, s.planningMinutes))
                    }
                  />
                </li>
              ))}
            </ul>
          </div>

          <InfoNote tone="info" icon="info">
            {t('queue.disclaimer')}
          </InfoNote>
        </CardBody>
      </Card>

      {/* Doctor photo */}
      <Card>
        <CardHeader title={t('admin.settingsPhoto')} icon="user" />
        <CardBody>
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-24 w-20 shrink-0 overflow-hidden rounded-md border border-shell-300 bg-shell-200">
              {settings.doctorPhotoDataUrl ? (
                <img
                  src={settings.doctorPhotoDataUrl}
                  alt={t('about.photoPlaceholder')}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-stone-400">
                  <Icon name="user" size={26} />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.8125rem] text-stone-600">{t('about.photoHint')}</p>
              {photoError ? (
                <p className="mt-1.5 text-[0.75rem] font-medium text-[#8E3730]">{photoError}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onPhoto}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  icon="download"
                  onClick={() => fileRef.current?.click()}
                >
                  {t('admin.uploadPhoto')}
                </Button>
                {settings.doctorPhotoDataUrl ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="trash"
                    onClick={() => void updateSettings({ doctorPhotoDataUrl: null })}
                  >
                    {t('admin.removePhoto')}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader title={t('admin.dataSection')} icon="shield" />
        <CardBody className="space-y-4">
          <p className="text-[0.8125rem] leading-relaxed text-stone-600">{t('admin.privacyBody')}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" icon="download" onClick={download}>
              {t('admin.exportData')}
            </Button>
            <Button variant="ghost" size="sm" icon="plus" onClick={() => void loadDemoData()}>
              {t('staff.demoTitle')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#8E3730] hover:bg-[#FBEEED]"
              icon="trash"
              onClick={() => setConfirmReset(true)}
            >
              {t('admin.resetData')}
            </Button>
          </div>
          {demoMode ? (
            <InfoNote tone="warn" icon="alert">
              {t('staff.demoBody')}
            </InfoNote>
          ) : null}
        </CardBody>
      </Card>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title={t('admin.resetData')}
        description={t('admin.resetConfirm')}
        tone="danger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              {t('cta.back')}
            </Button>
            <Button
              variant="danger"
              icon="trash"
              onClick={async () => {
                await resetData();
                setConfirmReset(false);
                toast.push({ tone: 'neutral', title: t('admin.resetDone') });
              }}
            >
              {t('admin.resetData')}
            </Button>
          </>
        }
      />
    </div>
  );
}

/** Kept exported so the notification settings screen can reuse the switch row. */
export function ChannelSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return <Switch label={label} checked={checked} onChange={onChange} />;
}
