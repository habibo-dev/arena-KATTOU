import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button, AnchorButton, LinkButton } from '@/components/ui/Button';
import { PageHeader } from '@/components/clinic/PageHeader';
import { OpeningHours } from '@/components/clinic/OpeningHours';
import { useI18n } from '@/i18n';
import { useClinic } from '@/store/clinic';
import { mapsDirectionsUrl, mapsEmbedUrl, mapsSearchUrl, waLink } from '@/lib/clinic';
import { useToast } from '@/components/ui/Toast';

export default function Location() {
  const { t } = useI18n();
  const { settings } = useClinic();
  const toast = useToast();
  const [mapLoaded, setMapLoaded] = useState(false);

  const fullAddress = `${settings.addressLine1}, ${settings.addressLine2}, ${settings.wilaya}, ${settings.country}`;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      toast.push({ tone: 'success', title: t('location.addressCopied') });
    } catch {
      toast.push({ tone: 'warn', title: t('errors.generic') });
    }
  };

  return (
    <>
      <PageHeader eyebrow={t('nav.location')} title={t('location.title')} body={t('location.subtitle')} />

      <section className="container-page grid gap-6 py-10 sm:py-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-navy-900">
              <Icon name="pin" size={17} className="text-sage-600" />
              {t('location.addressLabel')}
            </h2>
            <address className="mt-3 not-italic">
              <p className="text-[0.9375rem] leading-relaxed text-navy-800" dir="ltr">
                {settings.addressLine1}
                <br />
                {settings.addressLine2}, {settings.wilaya}
                <br />
                {settings.country}
              </p>
            </address>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" icon="copy" onClick={copyAddress}>
                {t('location.copyAddress')}
              </Button>
              <AnchorButton
                href={mapsDirectionsUrl(settings.mapsQuery)}
                target="_blank"
                rel="noreferrer noopener"
                size="sm"
                icon="external"
              >
                {t('cta.openMap')}
              </AnchorButton>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-navy-900">
              <Icon name="phone" size={17} className="text-sage-600" />
              {t('location.phoneLabel')}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {settings.phones.map((phone) => (
                <li key={phone.value} className="flex items-center justify-between gap-3">
                  <a
                    href={`tel:${phone.international}`}
                    className="num text-[0.9375rem] font-medium text-navy-800 hover:text-sage-700"
                    dir="ltr"
                  >
                    {phone.value}
                  </a>
                  <span className="text-[0.75rem] text-stone-400">{phone.label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <AnchorButton
                href={`tel:${settings.phones[0].international}`}
                size="sm"
                icon="phone"
              >
                {t('cta.call')}
              </AnchorButton>
              <AnchorButton
                href={waLink(settings.whatsappInternational)}
                target="_blank"
                rel="noreferrer noopener"
                size="sm"
                variant="secondary"
                icon="whatsapp"
              >
                {t('cta.whatsapp')}
              </AnchorButton>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-navy-900">
              <Icon name="clock" size={17} className="text-sage-600" />
              {t('location.hoursLabel')}
            </h2>
            <div className="mt-3">
              <OpeningHours showHint />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-[0.9375rem] font-semibold text-navy-900">{t('cta.book')}</h2>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-stone-600">
              {t('home.finalBody')}
            </p>
            <LinkButton to="/book" size="md" block className="mt-4" icon="calendar">
              {t('cta.bookShort')}
            </LinkButton>
          </div>
        </div>

        {/* Map: loaded on demand so it never blocks the first paint. */}
        <div className="card overflow-hidden">
          <div className="relative aspect-[4/3] w-full bg-shell-200 sm:aspect-[16/11]">
            {mapLoaded ? (
              <iframe
                title={t('location.title')}
                src={mapsEmbedUrl(settings.mapsQuery)}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center surface-quiet">
                <span className="grid h-14 w-14 place-items-center rounded-lg bg-white text-sage-600 shadow-card">
                  <Icon name="pin" size={26} />
                </span>
                <div>
                  <p className="text-[0.9375rem] font-semibold text-navy-900">
                    {settings.addressLine2}, {settings.wilaya}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-stone-500" dir="ltr">
                    {settings.addressLine1}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button size="md" icon="pin" onClick={() => setMapLoaded(true)}>
                    {t('cta.showMap')}
                  </Button>
                  <AnchorButton
                    href={mapsSearchUrl(settings.mapsQuery)}
                    target="_blank"
                    rel="noreferrer noopener"
                    size="md"
                    variant="secondary"
                    icon="external"
                  >
                    {t('cta.openMap')}
                  </AnchorButton>
                </div>
                <p className="max-w-xs text-[0.75rem] leading-relaxed text-stone-400">
                  {t('location.mapHelp')}
                </p>
              </div>
            )}
          </div>

          {mapLoaded ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-shell-300 bg-shell-50 px-4 py-3">
              <p className="text-[0.75rem] text-stone-500" dir="ltr">
                {fullAddress}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setMapLoaded(false)}>
                  {t('cta.hideMap')}
                </Button>
                <AnchorButton
                  href={mapsDirectionsUrl(settings.mapsQuery)}
                  target="_blank"
                  rel="noreferrer noopener"
                  size="sm"
                  icon="external"
                >
                  {t('cta.openMap')}
                </AnchorButton>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
