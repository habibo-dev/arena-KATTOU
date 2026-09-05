import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Button, LinkButton } from '@/components/ui/Button';
import { Field, FormError, InfoNote, Input } from '@/components/ui/Form';
import { Card, CardBody } from '@/components/ui/Card';
import { useI18n } from '@/i18n';
import { useClinic } from '@/store/clinic';
import { normaliseAlgerianPhone } from '@/lib/validation';
import { getLastBookingToken } from '@/lib/lastBooking';

/** /appointment — reach an appointment with the reference + phone number. */
export default function Lookup() {
  const { t } = useI18n();
  const { findByRefAndPhone } = useClinic();
  const navigate = useNavigate();

  const [ref, setRef] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const found = findByRefAndPhone(ref, phone);
    if (!found) {
      setError(t('appointment.notFound'));
      return;
    }
    navigate(`/a/${found.token}`);
  };

  const lastToken = getLastBookingToken();

  return (
    <section className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-sage-50 text-sage-600">
            <Icon name="ticket" size={24} />
          </span>
          <h1 className="mt-3.5 text-[1.35rem] font-semibold text-navy-900">
            {t('appointment.lookupTitle')}
          </h1>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-stone-600">
            {t('appointment.lookupBody')}
          </p>
        </div>

        {lastToken ? (
          <div className="mt-6">
            <InfoNote tone="success" icon="clock">
              <Button
                variant="ghost"
                size="sm"
                className="-ms-2"
                iconRight="chevronLeft"
                onClick={() => navigate(`/a/${lastToken}`)}
              >
                {t('cta.followQueue')}
              </Button>
            </InfoNote>
          </div>
        ) : null}

        <Card className="mt-5">
          <CardBody>
            <form onSubmit={submit} className="space-y-4" noValidate>
              {error ? <FormError message={error} /> : null}

              <Field label={t('appointment.reference')} htmlFor="ref" required>
                <Input
                  id="ref"
                  value={ref}
                  onChange={(e) => {
                    setRef(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  placeholder="KM-0000"
                  autoComplete="off"
                  className="num text-center tracking-widest"
                  maxLength={12}
                />
              </Field>

              <Field label={t('appointment.phone')} htmlFor="lookupPhone" required>
                <Input
                  id="lookupPhone"
                  value={phone}
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                  className="text-start"
                  placeholder="0558 41 80 73"
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError(null);
                  }}
                />
              </Field>

              <Button
                type="submit"
                size="lg"
                block
                icon="search"
                disabled={!ref.trim() || !normaliseAlgerianPhone(phone)}
              >
                {t('appointment.find')}
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="mt-4 text-center">
          <LinkButton to="/book" variant="ghost" icon="calendar">
            {t('cta.book')}
          </LinkButton>
        </div>

        <p className="mt-6 flex items-start justify-center gap-2 text-[0.75rem] leading-relaxed text-stone-400">
          <Icon name="shield" size={14} className="mt-px shrink-0" />
          <span className="max-w-xs">{t('booking.privacyLine')}</span>
        </p>
      </div>
    </section>
  );
}
