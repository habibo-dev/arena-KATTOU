import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Field, FormError, InfoNote, Input } from '@/components/ui/Form';
import { Card, CardBody } from '@/components/ui/Card';
import { DatePicker } from '@/components/booking/DatePicker';
import { TimePicker } from '@/components/booking/TimePicker';
import { PageHeader } from '@/components/clinic/PageHeader';
import { useI18n } from '@/i18n';
import { useClinic, useErrorLabel } from '@/store/clinic';
import { useToast } from '@/components/ui/Toast';
import { SERVICES, isServiceId, serviceById } from '@/lib/clinic';
import type { ServiceId } from '@/lib/types';
import { cleanName, normaliseAlgerianPhone, validateName, validatePhone } from '@/lib/validation';
import { setLastBookingToken } from '@/lib/lastBooking';

const STEPS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const;
type Step = (typeof STEPS)[number];

export default function Book() {
  const { t, lang, formatDate } = useI18n();
  const { book, settings } = useClinic();
  const toast = useToast();
  const errorLabel = useErrorLabel();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initialService = params.get('service');
  const [stepIndex, setStepIndex] = useState(0);
  const [serviceId, setServiceId] = useState<ServiceId | null>(
    initialService && isServiceId(initialService) ? initialService : null,
  );
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{
    ref: string;
    token: string;
    serviceId: ServiceId;
    date: string;
    slot: string;
  } | null>(null);

  const step: Step = STEPS[stepIndex];

  // Deep links like /book?service=odf land directly on the date step.
  useEffect(() => {
    if (serviceId) setStepIndex(1);
  }, [serviceId]);

  const service = serviceId ? serviceById(serviceId) : null;

  const canNext = useMemo(() => {
    switch (step) {
      case 'step1':
        return Boolean(serviceId);
      case 'step2':
        return Boolean(date);
      case 'step3':
        return Boolean(slot);
      case 'step4':
        return validateName(cleanName(fullName)) === null && validatePhone(phone) === null;
      case 'step5':
        return true;
    }
  }, [step, serviceId, date, slot, fullName, phone]);

  const goNext = () => {
    setFormError(null);
    if (step === 'step4') {
      const nameError = validateName(cleanName(fullName));
      const phoneError = validatePhone(phone);
      setFieldErrors({ name: nameError ?? undefined, phone: phoneError ?? undefined });
      if (nameError || phoneError) return;
    }
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  };

  const goBack = () => {
    setFormError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const submit = async () => {
    if (!serviceId || !date || !slot) return;
    setSubmitting(true);
    setFormError(null);

    const result = await book({ serviceId, date, slot, fullName, phone });

    setSubmitting(false);
    if (!result.ok || !result.appointment) {
      setFormError(errorLabel(result.error));
      return;
    }

    setLastBookingToken(result.appointment.token);
    setConfirmed({
      ref: result.appointment.ref,
      token: result.appointment.token,
      serviceId,
      date,
      slot,
    });
    toast.push({
      tone: 'success',
      title: t('booking.successTitle'),
      body: `${t('booking.reference')}: ${result.appointment.ref}`,
    });
  };

  /* -------------------------------------------------------------- */

  if (confirmed) {
    const svc = serviceById(confirmed.serviceId);
    return (
      <section className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-lg">
          <div className="card overflow-hidden">
            <div className="surface-navy px-5 py-7 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage-500/20 text-sage-200 ring-1 ring-inset ring-sage-300/30">
                <Icon name="check" size={28} strokeWidth={2} />
              </span>
              <h1 className="mt-4 text-[1.35rem] font-semibold text-shell-50">
                {t('booking.successTitle')}
              </h1>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-shell-200/75">
                {t('booking.successBody')}
              </p>
            </div>

            <CardBody className="space-y-0 p-0">
              <dl className="divide-y divide-shell-200">
                <Row label={t('booking.reference')}>
                  <span className="num rounded bg-sage-50 px-2 py-1 text-[0.9375rem] font-semibold text-sage-800 ring-1 ring-inset ring-sage-100">
                    {confirmed.ref}
                  </span>
                </Row>
                <Row label={t('booking.doctor')}>
                  <span className="text-[0.875rem] text-navy-800">
                    {settings.doctorName}
                    <span className="ms-1.5 text-[0.75rem] text-stone-500" lang="fr">
                      {settings.doctorTitle}
                    </span>
                  </span>
                </Row>
                <Row label={t('booking.service')}>
                  <span className="flex items-center gap-2 text-[0.875rem] text-navy-800">
                    <Icon name={svc.icon as 'tooth'} size={16} className="text-sage-600" />
                    {lang === 'ar' ? svc.ar : lang === 'fr' ? svc.fr : svc.en}
                  </span>
                </Row>
                <Row label={t('booking.date')}>
                  <span className="text-[0.875rem] text-navy-800">{formatDate(confirmed.date)}</span>
                </Row>
                <Row label={t('booking.time')}>
                  <span className="num text-[0.875rem] font-semibold text-navy-800" dir="ltr">
                    {confirmed.slot}
                  </span>
                </Row>
              </dl>

              <div className="border-t border-shell-200 bg-shell-50 px-4 py-4 sm:px-5">
                <p className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-clay-700">
                  <Icon name="info" size={16} className="mt-0.5 shrink-0" />
                  {t('booking.saveReference')}
                </p>
              </div>

              <div className="space-y-2.5 border-t border-shell-200 px-4 py-4 sm:px-5">
                <h2 className="text-[0.875rem] font-semibold text-navy-900">
                  {t('booking.whatNextTitle')}
                </h2>
                <ol className="mt-2 space-y-2">
                  {[t('booking.whatNext1'), t('booking.whatNext2'), t('booking.whatNext3')].map(
                    (item, i) => (
                      <li key={item} className="flex gap-2.5 text-[0.8125rem] text-stone-600">
                        <span className="num grid h-5 w-5 shrink-0 place-items-center rounded-full bg-shell-200 text-[0.6875rem] font-semibold text-navy-700">
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ),
                  )}
                </ol>
              </div>
            </CardBody>
          </div>

          <div className="mt-4 grid gap-2.5">
            <Button
              size="lg"
              icon="hourglass"
              onClick={() => navigate(`/a/${confirmed.token}`)}
            >
              {t('cta.followQueue')}
            </Button>
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="secondary"
                size="md"
                icon="printer"
                onClick={() => window.print()}
              >
                {t('cta.print')}
              </Button>
              <Link to="/book" className="contents">
                <Button
                  variant="ghost"
                  size="md"
                  block
                  onClick={() => {
                    setConfirmed(null);
                    setStepIndex(0);
                    setServiceId(null);
                    setDate(null);
                    setSlot(null);
                    setFullName('');
                    setPhone('');
                  }}
                >
                  {t('booking.bookAnother')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={t('nav.booking')}
        title={t('booking.title')}
        body={t('booking.subtitle')}
        compact
      />

      <section className="container-page py-8 sm:py-10">
        <div className="mx-auto max-w-2xl">
          <Stepper current={stepIndex} />

          <Card className="mt-6">
            <CardBody>
              {step === 'step1' ? (
                <fieldset>
                  <legend className="mb-3.5 text-[0.9375rem] font-semibold text-navy-900">
                    {t('booking.chooseService')}
                  </legend>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {SERVICES.map((s) => {
                      const active = s.id === serviceId;
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            aria-pressed={active}
                            onClick={() => setServiceId(s.id)}
                            className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-start transition-colors ${
                              active
                                ? 'border-navy-800 bg-navy-50/70 ring-1 ring-navy-800'
                                : 'border-shell-300 bg-white hover:border-shell-400 hover:bg-shell-50'
                            }`}
                          >
                            <span
                              className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${
                                active ? 'bg-navy-800 text-shell-50' : 'bg-sage-50 text-sage-600'
                              }`}
                            >
                              <Icon name={s.icon as 'tooth'} size={18} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[0.875rem] font-medium text-navy-900">
                                {lang === 'ar' ? s.ar : lang === 'fr' ? s.fr : s.en}
                              </span>
                              <span className="num block text-[0.6875rem] uppercase tracking-wide text-stone-400">
                                {s.code}
                              </span>
                            </span>
                            {active ? <Icon name="check" size={16} className="text-navy-800" /> : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              ) : null}

              {step === 'step2' ? (
                <>
                  <h2 className="mb-3.5 text-[0.9375rem] font-semibold text-navy-900">
                    {t('booking.chooseDate')}
                  </h2>
                  <DatePicker value={date} onChange={(iso) => { setDate(iso); setSlot(null); }} />
                </>
              ) : null}

              {step === 'step3' && date ? (
                <>
                  <h2 className="mb-1 text-[0.9375rem] font-semibold text-navy-900">
                    {t('booking.chooseTime')}
                  </h2>
                  <p className="mb-3.5 text-[0.8125rem] text-stone-500">{formatDate(date)}</p>
                  <TimePicker date={date} value={slot} onChange={setSlot} />
                </>
              ) : null}

              {step === 'step4' ? (
                <div className="space-y-4">
                  <h2 className="text-[0.9375rem] font-semibold text-navy-900">
                    {t('booking.yourDetails')}
                  </h2>

                  {formError ? <FormError message={formError} /> : null}

                  <Field
                    label={t('booking.fullName')}
                    htmlFor="fullName"
                    hint={t('booking.fullNameHint')}
                    error={fieldErrors.name ? errorLabel(fieldErrors.name) : null}
                    required
                  >
                    <Input
                      id="fullName"
                      value={fullName}
                      autoComplete="name"
                      inputMode="text"
                      maxLength={90}
                      invalid={Boolean(fieldErrors.name)}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setFieldErrors((f) => ({ ...f, name: undefined }));
                      }}
                      onBlur={() =>
                        setFieldErrors((f) => ({
                          ...f,
                          name: validateName(cleanName(fullName)) ?? undefined,
                        }))
                      }
                    />
                  </Field>

                  <Field
                    label={t('booking.phone')}
                    htmlFor="phone"
                    hint={t('booking.phoneHint')}
                    error={fieldErrors.phone ? errorLabel(fieldErrors.phone) : null}
                    required
                  >
                    <Input
                      id="phone"
                      value={phone}
                      type="tel"
                      dir="ltr"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="0558 41 80 73"
                      className="text-start"
                      invalid={Boolean(fieldErrors.phone)}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setFieldErrors((f) => ({ ...f, phone: undefined }));
                      }}
                      onBlur={() =>
                        setFieldErrors((f) => ({
                          ...f,
                          phone:
                            phone.trim() && !normaliseAlgerianPhone(phone)
                              ? 'phone_invalid'
                              : undefined,
                        }))
                      }
                    />
                  </Field>

                  <InfoNote tone="success" icon="shield">
                    {t('booking.privacyLine')}
                  </InfoNote>
                </div>
              ) : null}

              {step === 'step5' && service && date && slot ? (
                <div className="space-y-4">
                  <h2 className="text-[0.9375rem] font-semibold text-navy-900">
                    {t('booking.review')}
                  </h2>
                  {formError ? <FormError message={formError} /> : null}

                  <dl className="divide-y divide-shell-200 rounded-lg border border-shell-300">
                    <ReviewRow label={t('booking.service')}>
                      <span className="flex items-center gap-2 text-[0.875rem] text-navy-800">
                        <Icon name={service.icon as 'tooth'} size={16} className="text-sage-600" />
                        {lang === 'ar' ? service.ar : lang === 'fr' ? service.fr : service.en}
                      </span>
                    </ReviewRow>
                    <ReviewRow label={t('booking.date')}>
                      <span className="text-[0.875rem] text-navy-800">{formatDate(date)}</span>
                    </ReviewRow>
                    <ReviewRow label={t('booking.time')}>
                      <span className="num text-[0.875rem] font-semibold text-navy-800" dir="ltr">
                        {slot}
                      </span>
                    </ReviewRow>
                    <ReviewRow label={t('booking.fullName')}>
                      <span className="text-[0.875rem] text-navy-800">{cleanName(fullName)}</span>
                    </ReviewRow>
                    <ReviewRow label={t('booking.phone')}>
                      <span className="num text-[0.875rem] text-navy-800" dir="ltr">
                        {normaliseAlgerianPhone(phone)?.replace('+213', '0') ?? phone}
                      </span>
                    </ReviewRow>
                    <ReviewRow label={t('booking.doctor')}>
                      <span className="text-[0.875rem] text-navy-800">{settings.doctorName}</span>
                    </ReviewRow>
                  </dl>

                  <p className="text-[0.8125rem] leading-relaxed text-stone-500">
                    {t('booking.confirmBody')}
                  </p>
                </div>
              ) : null}
            </CardBody>
          </Card>

          <div className="mt-4 flex items-center gap-2.5">
            {stepIndex > 0 ? (
              <Button variant="secondary" size="lg" onClick={goBack} icon="arrowRight">
                {t('cta.back')}
              </Button>
            ) : null}

            {step === 'step5' ? (
              <Button size="lg" block loading={submitting} onClick={submit} icon="check">
                {submitting ? t('booking.submitting') : t('cta.confirm')}
              </Button>
            ) : (
              <Button
                size="lg"
                className="flex-1"
                disabled={!canNext}
                onClick={goNext}
                iconRight="arrowLeft"
              >
                {t('cta.next')}
              </Button>
            )}
          </div>

          <p className="mt-4 text-center text-[0.75rem] text-stone-400">
            {t('booking.stepOf', { n: stepIndex + 1, total: STEPS.length })} ·{' '}
            <Link to="/contact" className="link-quiet">
              {t('cta.contact')}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

function Stepper({ current }: { current: number }) {
  const { t } = useI18n();
  return (
    <ol
      className="flex items-center gap-1"
      aria-label={t('a11y.stepProgress')}
    >
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex flex-1 flex-col gap-1.5">
            <span
              className={`h-1 rounded-full transition-colors ${
                done ? 'bg-sage-500' : active ? 'bg-navy-800' : 'bg-shell-300'
              }`}
              aria-hidden="true"
            />
            <span
              className={`truncate text-[0.6875rem] font-medium ${
                active ? 'text-navy-900' : done ? 'text-sage-600' : 'text-stone-400'
              }`}
              aria-current={active ? 'step' : undefined}
            >
              {t(`booking.${s}` as 'booking.step1')}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
      <dt className="shrink-0 text-[0.8125rem] text-stone-500">{label}</dt>
      <dd className="min-w-0 text-end">{children}</dd>
    </div>
  );
}

function ReviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3.5 py-2.5">
      <dt className="shrink-0 text-[0.8125rem] text-stone-500">{label}</dt>
      <dd className="min-w-0 text-end">{children}</dd>
    </div>
  );
}
