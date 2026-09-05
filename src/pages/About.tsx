import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/clinic/PageHeader';
import { LinkButton, AnchorButton } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { useClinic } from '@/store/clinic';
import { CLINIC, SERVICES, mapsDirectionsUrl, waLink } from '@/lib/clinic';

export default function About() {
  const { t, lang } = useI18n();
  const { settings } = useClinic();

  return (
    <>
      <PageHeader
        eyebrow={t('nav.about')}
        title={t('about.title')}
        body={undefined}
        action={
          <div className="flex gap-2">
            <LinkButton to="/book" size="md" icon="calendar">
              {t('cta.bookShort')}
            </LinkButton>
            <AnchorButton
              href={`tel:${CLINIC.phones[0].international}`}
              size="md"
              variant="secondary"
              icon="phone"
            >
              {t('cta.call')}
            </AnchorButton>
          </div>
        }
      />

      <section className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Portrait area — a refined, clearly replaceable placeholder. */}
        <figure className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-xl border border-shell-300 bg-shell-200 shadow-card">
            {settings.doctorPhotoDataUrl ? (
              <img
                src={settings.doctorPhotoDataUrl}
                alt={`${t('about.title')} — ${t('about.role')}`}
                width={800}
                height={1000}
                className="aspect-[4/5] w-full object-cover"
                decoding="async"
              />
            ) : (
              <>
                <img
                  src="./images/portrait-480.jpg"
                  srcSet="./images/portrait-480.jpg 480w, ./images/portrait-720.jpg 720w"
                  sizes="(min-width: 1024px) 38vw, 86vw"
                  alt=""
                  aria-hidden="true"
                  width={800}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
                <figcaption className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy-900/25 px-8 text-center">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-shell-50/90 text-navy-800 shadow-card">
                    <Icon name="user" size={38} strokeWidth={1.2} />
                  </span>
                  <span className="text-[0.9375rem] font-semibold text-shell-50">
                    {t('about.photoPlaceholder')}
                  </span>
                  <span className="max-w-[18rem] text-[0.8125rem] leading-relaxed text-shell-100/85">
                    {t('about.photoHint')}
                  </span>
                </figcaption>
              </>
            )}
          </div>

          <figcaption className="mt-3 text-center text-[0.75rem] text-stone-400">
            {t('about.photoPlaceholder')}
          </figcaption>
        </figure>

        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-sage-600">
            {t('nav.about')}
          </p>
          <h2 className="mt-2 text-[1.6rem] font-semibold tracking-tightish text-navy-900 sm:text-[2rem]">
            {t('about.title')}
          </h2>
          <p className="mt-1.5 text-[1rem] font-medium text-sage-600" lang="fr">
            {t('about.role')}
          </p>

          <p className="mt-5 max-w-measure text-[0.9375rem] leading-[1.9] text-stone-600">
            {t('about.body')}
          </p>

          <div className="mt-8">
            <h3 className="text-[0.9375rem] font-semibold text-navy-900">{t('about.practiceTitle')}</h3>
            <ul className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
              {[
                t('about.practice1'),
                t('about.practice2'),
                t('about.practice3'),
                t('about.practice4'),
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 rounded-md border border-shell-300 bg-white px-3.5 py-3 text-[0.8125rem] leading-relaxed text-navy-800"
                >
                  <Icon name="check" size={15} className="mt-0.5 shrink-0 text-sage-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h3 className="text-[0.9375rem] font-semibold text-navy-900">{t('services.title')}</h3>
            <ul className="mt-3.5 flex flex-wrap gap-2">
              {SERVICES.map((s) => (
                <li
                  key={s.id}
                  className="inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[0.8125rem] font-medium text-navy-800 ring-1 ring-inset ring-shell-300 bg-white"
                >
                  <Icon name={s.icon as 'tooth'} size={15} className="text-sage-600" />
                  {lang === 'ar' ? s.ar : lang === 'fr' ? s.fr : s.en}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-9 rounded-xl border border-shell-300 bg-shell-100 p-5">
            <h3 className="text-[0.9375rem] font-semibold text-navy-900">{t('location.addressLabel')}</h3>
            <address className="mt-2.5 space-y-2 not-italic">
              <p className="flex gap-2.5 text-[0.875rem] text-navy-800" dir="ltr">
                <Icon name="pin" size={16} className="mt-0.5 shrink-0 text-sage-600" />
                <span>
                  {CLINIC.addressLine1}
                  <br />
                  {CLINIC.addressLine2}, {CLINIC.wilaya}
                </span>
              </p>
              {CLINIC.phones.map((phone) => (
                <p key={phone.value} className="flex gap-2.5 text-[0.875rem]">
                  <Icon name="phone" size={16} className="mt-0.5 shrink-0 text-sage-600" />
                  <a
                    href={`tel:${phone.international}`}
                    className="num font-medium text-navy-800 hover:text-sage-700"
                    dir="ltr"
                  >
                    {phone.value}
                  </a>
                </p>
              ))}
            </address>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <AnchorButton
                href={mapsDirectionsUrl(CLINIC.mapsQuery)}
                target="_blank"
                rel="noreferrer noopener"
                size="sm"
                variant="secondary"
                icon="pin"
              >
                {t('cta.openMap')}
              </AnchorButton>
              <AnchorButton
                href={waLink(CLINIC.whatsappInternational)}
                target="_blank"
                rel="noreferrer noopener"
                size="sm"
                variant="ghost"
                icon="whatsapp"
              >
                {t('cta.whatsapp')}
              </AnchorButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
