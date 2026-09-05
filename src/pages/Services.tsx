import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { InfoNote } from '@/components/ui/Form';
import { LinkButton } from '@/components/ui/Button';
import { PageHeader } from '@/components/clinic/PageHeader';
import { useI18n } from '@/i18n';
import { SERVICES } from '@/lib/clinic';

/**
 * Services are presented with visual hierarchy rather than seven identical
 * cards: the first two services get a wide treatment, the rest a compact grid.
 */
export default function Services() {
  const { t, lang } = useI18n();

  const featured = SERVICES.slice(0, 2);
  const rest = SERVICES.slice(2);

  const nameOf = (s: (typeof SERVICES)[number]) =>
    lang === 'ar' ? s.ar : lang === 'fr' ? s.fr : s.en;
  const descOf = (s: (typeof SERVICES)[number]) =>
    lang === 'ar' ? s.arDescription : lang === 'fr' ? s.frDescription : s.enDescription;

  return (
    <>
      <PageHeader
        eyebrow={t('nav.services')}
        title={t('services.title')}
        body={t('services.subtitle')}
      />

      <section className="container-page py-10 sm:py-14">
        <InfoNote tone="info" icon="info">
          {t('services.note')}
        </InfoNote>

        {/* Featured services */}
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {featured.map((service) => (
            <li key={service.id} id={service.id} className="scroll-mt-24">
              <article className="card flex h-full flex-col overflow-hidden">
                <div className="relative">
                  <span className="flex h-32 items-center justify-center bg-navy-800 text-shell-50 sm:h-36">
                    <Icon name={service.icon as 'tooth'} size={44} strokeWidth={1.2} />
                  </span>
                  <span className="num absolute bottom-3 end-3 rounded bg-shell-50/10 px-2 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-shell-100 ring-1 ring-inset ring-shell-50/20">
                    {service.code}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-[1.0625rem] font-semibold text-navy-900">{nameOf(service)}</h2>
                  <p className="mt-2 flex-1 text-[0.875rem] leading-[1.8] text-stone-600">
                    {descOf(service)}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-shell-200 pt-3.5">
                    <span className="flex items-center gap-1.5 text-[0.75rem] text-stone-500">
                      <Icon name="timer" size={14} />
                      {t('services.durationLabel')}:{' '}
                      <span className="num font-semibold text-navy-800">
                        {service.planningMinutes} {t('services.minutes')}
                      </span>
                    </span>
                    <LinkButton
                      to={`/book?service=${service.id}`}
                      size="sm"
                      iconRight="chevronLeft"
                    >
                      {t('services.bookThis')}
                    </LinkButton>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>

        {/* Remaining services — compact, scannable list */}
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((service) => (
            <li key={service.id} id={service.id} className="scroll-mt-24">
              <article className="card h-full p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-sage-50 text-sage-600">
                    <Icon name={service.icon as 'tooth'} size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[0.9375rem] font-semibold text-navy-900">
                      {nameOf(service)}
                    </h2>
                    <p className="num mt-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-stone-400">
                      {service.code}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[0.8125rem] leading-[1.75] text-stone-600">
                  {descOf(service)}
                </p>
                <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-shell-200 pt-3">
                  <span className="num text-[0.75rem] text-stone-500">
                    {service.planningMinutes} {t('services.minutes')}
                  </span>
                  <Link
                    to={`/book?service=${service.id}`}
                    className="text-[0.8125rem] font-medium text-sage-600 hover:text-sage-700"
                  >
                    {t('services.bookThis')}
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-xl border border-shell-300 bg-shell-100 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-[1rem] font-semibold text-navy-900">{t('cta.book')}</h2>
              <p className="mt-1 text-[0.8125rem] text-stone-600">{t('booking.privacyLine')}</p>
            </div>
            <LinkButton to="/book" icon="calendar">
              {t('cta.bookShort')}
            </LinkButton>
          </div>
        </div>

        <p className="mt-6 text-[0.75rem] leading-relaxed text-stone-400">
          {t('services.durationNote')}
        </p>
      </section>
    </>
  );
}
