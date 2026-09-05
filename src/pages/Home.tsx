import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Badge, LiveDot, SectionHeading } from '@/components/ui/Card';
import { AnchorButton, LinkButton } from '@/components/ui/Button';
import { HoursBadge } from '@/components/clinic/OpeningHours';
import { QueueVisual } from '@/components/queue/QueueVisual';
import { useI18n } from '@/i18n';
import { useClinic } from '@/store/clinic';
import { CLINIC, SERVICES, mapsDirectionsUrl, waLink } from '@/lib/clinic';
import { firstNameOnly } from '@/lib/privacy';
import { FaqList } from '@/components/clinic/FaqList';

export default function Home() {
  const { lang } = useI18n();
  const { snapshot, today } = useClinic();

  return (
    <>
      <Hero />
      <PositioningBand />
      <HowItWorks />
      <LiveQueueSection snapshot={snapshot} />
      <ServicesPreview />
      <AboutPreview />
      <LocationPreview />
      <FaqPreview />
      <FinalCta today={today} />
      <span className="hidden">{lang}</span>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Hero() {
  const { t } = useI18n();
  const { snapshot } = useClinic();

  return (
    <section className="relative overflow-hidden border-b border-shell-300 bg-shell-50">
      <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:py-20">
        <div className="animate-fade-up">
          <p className="flex flex-wrap items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-sage-600">
            <span className="inline-block h-px w-6 bg-sage-400" aria-hidden="true" />
            {t('hero.eyebrow')}
          </p>

          <h1 className="mt-4 text-[2rem] font-semibold leading-[1.2] tracking-tightish text-navy-900 sm:text-[2.6rem] lg:text-[3.1rem] lg:leading-[1.15]">
            {t('hero.title')}
          </h1>

          <p className="mt-4 max-w-measure text-[0.9375rem] leading-[1.8] text-stone-600 sm:mt-5 sm:text-[1.0625rem] sm:leading-[1.85]">
            {t('hero.subtitle')}
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <LinkButton to="/book" size="lg" icon="calendar" className="sm:min-w-48">
              {t('cta.bookShort')}
            </LinkButton>
            <LinkButton
              to="/services"
              size="lg"
              variant="secondary"
              iconRight="chevronLeft"
              className="sm:min-w-48"
            >
              {t('cta.discoverServices')}
            </LinkButton>
          </div>

          <p className="mt-6 flex items-center gap-2 text-[0.8125rem] text-stone-500">
            <Icon name="shield" size={15} className="text-sage-500" />
            {t('hero.trust')}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-shell-300 pt-5">
            <HoursBadge />
            <a
              href={`tel:${CLINIC.phones[0].international}`}
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[0.75rem] font-medium text-navy-700 ring-1 ring-inset ring-shell-300 transition-colors hover:bg-shell-100"
            >
              <Icon name="phone" size={13} />
              <span className="num" dir="ltr">
                {CLINIC.phones[0].value}
              </span>
            </a>
            <AnchorButton
              href={mapsDirectionsUrl(CLINIC.mapsQuery)}
              target="_blank"
              rel="noreferrer noopener"
              size="sm"
              variant="ghost"
              icon="pin"
            >
              {CLINIC.addressLine2}
            </AnchorButton>
          </div>
        </div>

        <div className="relative animate-fade-up [animation-delay:80ms]">
          <div className="relative overflow-hidden rounded-xl border border-shell-300 bg-shell-200 shadow-lift">
            <img
              src="./images/hero-960.jpg"
              srcSet="./images/hero-640.jpg 640w, ./images/hero-960.jpg 960w, ./images/hero-1440.jpg 1440w"
              sizes="(min-width: 1024px) 46vw, 92vw"
              width={1200}
              height={900}
              alt="قاعة استقبال عيادة أسنان حديثة بإضاءة طبيعية هادئة"
              className="aspect-[4/3] w-full object-cover sm:aspect-[5/4]"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-navy-900/45 via-transparent to-transparent"
              aria-hidden="true"
            />
          </div>

          {/* Live clinic status — the product's promise, visible in 5 seconds */}
          <div className="mt-4 rounded-xl border border-shell-300 bg-white p-4 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-navy-900">
                <LiveDot />
                {t('hero.cardTitle')}
              </p>
              <Badge tone="neutral" size="sm">
                {t('reception.today')}
              </Badge>
            </div>

            {snapshot.entries.length === 0 ? (
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-stone-500">
                {t('hero.cardEmpty')}
              </p>
            ) : (
              <dl className="mt-3 grid grid-cols-3 divide-x divide-x-reverse divide-shell-200">
                <div className="px-1 text-center first:ps-0 last:pe-0">
                  <dt className="text-[0.6875rem] text-stone-500">{t('hero.currentPatient')}</dt>
                  <dd className="num mt-1 text-xl font-semibold text-navy-900">
                    {snapshot.current ? `#${snapshot.current.queueNumber}` : '—'}
                  </dd>
                </div>
                <div className="px-1 text-center">
                  <dt className="text-[0.6875rem] text-stone-500">{t('hero.waitingCount')}</dt>
                  <dd className="num mt-1 text-xl font-semibold text-navy-900">
                    {snapshot.waiting.length}
                  </dd>
                </div>
                <div className="px-1 text-center">
                  <dt className="text-[0.6875rem] text-stone-500">{t('reception.completed')}</dt>
                  <dd className="num mt-1 text-xl font-semibold text-navy-900">
                    {snapshot.completedCount}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function PositioningBand() {
  const { t } = useI18n();
  return (
    <section className="surface-navy">
      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-sage-300">
              {t('landing.solutionTitle')}
            </p>
            <h2 className="mt-3 text-[1.55rem] leading-[1.35] font-semibold text-shell-50 sm:text-[2rem] sm:leading-[1.3]">
              {t('home.queuePitchTitle')}
            </h2>
            <p className="mt-4 max-w-measure text-[0.9375rem] leading-[1.85] text-shell-200/75">
              {t('home.queuePitchBody')}
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <LinkButton
                to="/book"
                size="md"
                className="bg-shell-50 text-navy-900 hover:bg-white active:bg-shell-100"
                icon="calendar"
              >
                {t('cta.book')}
              </LinkButton>
              <LinkButton
                to="/platform"
                size="md"
                variant="ghost"
                className="text-shell-100 ring-1 ring-inset ring-shell-50/20 hover:bg-shell-50/10"
                iconRight="chevronLeft"
              >
                {t('landing.discoverSystem')}
              </LinkButton>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: 'clock' as const, title: t('home.value1Title'), body: t('home.value1Body') },
              { icon: 'pin' as const, title: t('home.value2Title'), body: t('home.value2Body') },
              { icon: 'users' as const, title: t('home.value3Title'), body: t('home.value3Body') },
            ].map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-shell-50/10 bg-shell-50/[0.04] p-4"
              >
                <span className="grid h-9 w-9 place-items-center rounded-md bg-sage-500/15 text-sage-300">
                  <Icon name={item.icon} size={18} />
                </span>
                <h3 className="mt-3 text-[0.9375rem] font-semibold text-shell-50">{item.title}</h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-shell-200/70">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { n: '1', icon: 'calendar' as const, title: t('home.how1Title'), body: t('home.how1Body') },
    { n: '2', icon: 'qr' as const, title: t('home.how2Title'), body: t('home.how2Body') },
    { n: '3', icon: 'hourglass' as const, title: t('home.how3Title'), body: t('home.how3Body') },
    { n: '4', icon: 'checkCircle' as const, title: t('home.how4Title'), body: t('home.how4Body') },
  ];

  return (
    <section id="how" className="surface-quiet border-b border-shell-300">
      <div className="container-page py-14 sm:py-18">
        <SectionHeading eyebrow={t('landing.featuresTitle')} title={t('home.howTitle')} body={t('home.howSubtitle')} />

        <ol className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.n} className="relative">
              <div className="card h-full p-5">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-navy-800 text-shell-50">
                    <Icon name={step.icon} size={19} />
                  </span>
                  <span className="num text-[2rem] font-semibold leading-none text-shell-300">
                    {step.n}
                  </span>
                </div>
                <h3 className="mt-4 text-[0.9375rem] font-semibold text-navy-900">{step.title}</h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-stone-600">{step.body}</p>
              </div>
              {index < steps.length - 1 ? (
                <span
                  className="absolute -end-2.5 top-1/2 hidden -translate-y-1/2 text-shell-400 lg:block"
                  aria-hidden="true"
                >
                  <Icon name="arrowLeft" size={16} />
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function LiveQueueSection({ snapshot }: { snapshot: ReturnType<typeof useClinic>['snapshot'] }) {
  const { t } = useI18n();

  return (
    <section id="queue" className="border-b border-shell-300 bg-shell-50">
      <div className="container-page grid gap-10 py-14 sm:py-18 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeading
            eyebrow={t('hero.live')}
            title={t('queue.liveQueue')}
            body={t('landing.f4Body')}
          />
          <ul className="mt-6 space-y-3">
            {[
              { icon: 'ticket' as const, text: t('queue.yourNumber') },
              { icon: 'users' as const, text: t('queue.patientsAhead') },
              { icon: 'clock' as const, text: t('queue.estimatedTime') },
            ].map((row) => (
              <li key={row.text} className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-sage-50 text-sage-600">
                  <Icon name={row.icon} size={16} />
                </span>
                <span className="text-[0.875rem] text-navy-800">{row.text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex items-start gap-2 rounded-md border border-clay-100 bg-clay-50/60 px-3.5 py-3 text-[0.8125rem] leading-relaxed text-clay-700">
            <Icon name="info" size={16} className="mt-0.5 shrink-0" />
            {t('queue.disclaimer')}
          </p>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-shell-300 pb-3">
            <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-navy-900">
              <LiveDot />
              {t('hero.cardTitle')}
            </p>
            <span className="num text-[0.75rem] text-stone-500">{snapshot.entries.length} / {snapshot.totalScheduled}</span>
          </div>

          {snapshot.entries.length === 0 ? (
            <EmptyQueuePlaceholder />
          ) : (
            <QueueVisual
              entries={snapshot.entries}
              current={snapshot.current}
              variant="public"
            />
          )}

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-shell-300 pt-3">
            <p className="text-[0.75rem] text-stone-500">
              {snapshot.current
                ? `${t('queue.currentPatient')}: ${firstNameOnly(snapshot.current.patientName)}`
                : t('reception.noCurrent')}
            </p>
            <Link to="/book" className="text-[0.8125rem] font-medium text-sage-600 hover:text-sage-700">
              {t('cta.book')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Shown when the clinic queue is genuinely empty. We do not invent a queue
 * for decoration — the real one appears as soon as patients check in.
 */
function EmptyQueuePlaceholder() {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border border-dashed border-shell-400 bg-shell-50 px-4 py-8 text-center">
      <span className="mx-auto grid h-10 w-10 place-items-center rounded-md bg-shell-200 text-stone-400">
        <Icon name="hourglass" size={19} />
      </span>
      <p className="mt-3 text-[0.875rem] font-medium text-navy-900">{t('queue.noQueueToday')}</p>
      <p className="mx-auto mt-1.5 max-w-xs text-[0.8125rem] leading-relaxed text-stone-500">
        {t('queue.notInQueueBody')}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ServicesPreview() {
  const { t, lang } = useI18n();
  const featured = SERVICES.slice(0, 4);

  return (
    <section id="services" className="border-b border-shell-300 bg-shell-50">
      <div className="container-page py-14 sm:py-18">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow={t('nav.services')} title={t('home.servicesTitle')} body={t('home.servicesSubtitle')} />
          <LinkButton to="/services" variant="secondary" size="sm" iconRight="chevronLeft">
            {t('home.allServices')}
          </LinkButton>
        </div>

        <ul className="mt-9 grid gap-4 sm:grid-cols-2">
          {featured.map((service) => (
            <li key={service.id}>
              <Link
                to={`/book?service=${service.id}`}
                className="card group flex h-full items-start gap-4 p-5 transition-shadow hover:shadow-lift"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-navy-800 text-shell-50 transition-colors group-hover:bg-sage-600">
                  <Icon name={service.icon as 'tooth'} size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="text-[0.9375rem] font-semibold text-navy-900">
                      {lang === 'ar' ? service.ar : lang === 'fr' ? service.fr : service.en}
                    </span>
                    <span className="num text-[0.6875rem] font-medium uppercase tracking-wide text-stone-400">
                      {service.code}
                    </span>
                  </span>
                  <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-stone-600">
                    {lang === 'ar'
                      ? service.arDescription
                      : lang === 'fr'
                        ? service.frDescription
                        : service.enDescription}
                  </span>
                </span>
                <Icon
                  name="arrowLeft"
                  size={16}
                  className="mt-1 shrink-0 text-stone-300 transition-colors group-hover:text-sage-500"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function AboutPreview() {
  const { t } = useI18n();
  const { settings } = useClinic();

  return (
    <section id="about" className="border-b border-shell-300 bg-white">
      <div className="container-page grid gap-9 py-14 sm:py-18 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
        <div className="order-2 lg:order-1">
          <SectionHeading eyebrow={t('nav.about')} title={t('about.title')} />
          <p className="mt-1 text-[0.9375rem] font-medium text-sage-600" lang="fr">
            {t('about.role')}
          </p>
          <p className="mt-4 max-w-measure text-[0.9375rem] leading-[1.85] text-stone-600">
            {t('about.body')}
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {[t('about.practice1'), t('about.practice2'), t('about.practice3'), t('about.practice4')].map(
              (item) => (
                <li key={item} className="flex items-start gap-2 text-[0.8125rem] text-navy-800">
                  <Icon name="check" size={15} className="mt-0.5 shrink-0 text-sage-500" />
                  {item}
                </li>
              ),
            )}
          </ul>
          <LinkButton to="/about" variant="secondary" size="md" className="mt-6" iconRight="chevronLeft">
            {t('nav.about')}
          </LinkButton>
        </div>

        <figure className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-xl border border-shell-300 bg-shell-200 shadow-card">
            {settings.doctorPhotoDataUrl ? (
              <img
                src={settings.doctorPhotoDataUrl}
                alt={`${t('about.title')} — ${t('about.role')}`}
                width={800}
                height={1000}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <img
                src="./images/portrait-480.jpg"
                srcSet="./images/portrait-480.jpg 480w, ./images/portrait-720.jpg 720w"
                sizes="(min-width: 1024px) 38vw, 82vw"
                alt=""
                aria-hidden="true"
                width={800}
                height={1000}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover"
              />
            )}
            {!settings.doctorPhotoDataUrl ? (
              <figcaption className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy-900/25 px-6 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-shell-50/90 text-navy-800 shadow-card">
                  <Icon name="user" size={30} strokeWidth={1.3} />
                </span>
                <span className="text-[0.875rem] font-semibold text-shell-50">
                  {t('about.photoPlaceholder')}
                </span>
                <span className="max-w-[16rem] text-[0.75rem] leading-relaxed text-shell-100/85">
                  {t('about.photoHint')}
                </span>
              </figcaption>
            ) : null}
          </div>
        </figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function LocationPreview() {
  const { t } = useI18n();

  return (
    <section id="location" className="border-b border-shell-300 bg-shell-50">
      <div className="container-page grid gap-8 py-14 sm:py-18 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeading
            eyebrow={t('nav.location')}
            title={t('home.locationTitle')}
            body={t('location.subtitle')}
          />

          <address className="mt-6 space-y-3 not-italic">
            <div className="flex gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-sage-50 text-sage-600">
                <Icon name="pin" size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-[0.8125rem] font-medium text-navy-900" dir="ltr">
                  {CLINIC.addressLine1}
                </p>
                <p className="text-[0.8125rem] text-stone-600" dir="ltr">
                  {CLINIC.addressLine2}, {CLINIC.wilaya}
                </p>
              </div>
            </div>

            {CLINIC.phones.map((phone) => (
              <div key={phone.value} className="flex gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-sage-50 text-sage-600">
                  <Icon name="phone" size={16} />
                </span>
                <a
                  href={`tel:${phone.international}`}
                  className="num text-[0.875rem] font-medium text-navy-800 hover:text-sage-700"
                  dir="ltr"
                >
                  {phone.value}
                  <span className="ms-2 text-[0.75rem] font-normal text-stone-400">
                    {phone.label}
                  </span>
                </a>
              </div>
            ))}
          </address>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <AnchorButton
              href={`tel:${CLINIC.phones[0].international}`}
              size="md"
              icon="phone"
            >
              {t('cta.call')}
            </AnchorButton>
            <AnchorButton
              href={waLink(CLINIC.whatsappInternational)}
              target="_blank"
              rel="noreferrer noopener"
              size="md"
              variant="secondary"
              icon="whatsapp"
            >
              {t('cta.whatsapp')}
            </AnchorButton>
            <LinkButton to="/location" size="md" variant="ghost" icon="pin">
              {t('cta.openMap')}
            </LinkButton>
          </div>
        </div>

        <div className="card overflow-hidden">
          <img
            src="./images/instruments-480.jpg"
            srcSet="./images/instruments-480.jpg 480w, ./images/instruments-720.jpg 720w"
            sizes="(min-width: 1024px) 42vw, 88vw"
            alt=""
            aria-hidden="true"
            width={900}
            height={600}
            loading="lazy"
            decoding="async"
            className="aspect-[3/2] w-full object-cover"
          />
          <div className="border-t border-shell-300 p-4">
            <p className="text-[0.8125rem] leading-relaxed text-stone-600" dir="ltr">
              {CLINIC.addressLine1}, {CLINIC.addressLine2} — {CLINIC.wilaya}
            </p>
            <AnchorButton
              href={mapsDirectionsUrl(CLINIC.mapsQuery)}
              target="_blank"
              rel="noreferrer noopener"
              size="sm"
              variant="ghost"
              icon="external"
              className="mt-2 -ms-3"
            >
              {t('cta.openMap')}
            </AnchorButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function FaqPreview() {
  const { t } = useI18n();
  return (
    <section className="border-b border-shell-300 bg-white">
      <div className="container-page py-14 sm:py-18">
        <SectionHeading eyebrow="FAQ" title={t('home.faqTitle')} />
        <FaqList limit={5} className="mt-8" />
        <Link to="/contact" className="mt-6 inline-block text-[0.875rem] font-medium text-sage-600 hover:text-sage-700">
          {t('cta.contact')}
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function FinalCta({ today }: { today: string }) {
  const { t } = useI18n();
  void today;
  return (
    <section className="surface-navy">
      <div className="container-page py-14 text-center sm:py-18">
        <h2 className="mx-auto max-w-xl text-[1.6rem] leading-[1.3] font-semibold text-shell-50 sm:text-[2.1rem]">
          {t('home.finalTitle')}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[0.9375rem] leading-[1.8] text-shell-200/75">
          {t('home.finalBody')}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
          <LinkButton
            to="/book"
            size="lg"
            className="bg-shell-50 text-navy-900 hover:bg-white active:bg-shell-100"
            icon="calendar"
          >
            {t('cta.book')}
          </LinkButton>
          <AnchorButton
            href={`tel:${CLINIC.phones[0].international}`}
            size="lg"
            variant="ghost"
            className="text-shell-100 ring-1 ring-inset ring-shell-50/20 hover:bg-shell-50/10"
            icon="phone"
          >
            <span className="num" dir="ltr">
              {CLINIC.phones[0].value}
            </span>
          </AnchorButton>
        </div>
      </div>
    </section>
  );
}
