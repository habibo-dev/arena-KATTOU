import { Link } from 'react-router-dom';
import { Icon, Wordmark } from '@/components/ui/Icon';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n';
import { CLINIC, SERVICES, mapsDirectionsUrl, waLink } from '@/lib/clinic';
import { OpeningHours } from '@/components/clinic/OpeningHours';

export function Footer() {
  const { t, lang } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="surface-navy mt-auto">
      <div className="container-page py-12 sm:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr] lg:gap-8">
          <div>
            <Wordmark tone="light" />
            <p className="mt-4 max-w-xs text-[0.8125rem] leading-relaxed text-shell-200/70">
              {t('about.body')}
            </p>
            <div className="mt-5">
              <LanguageSwitcher tone="dark" />
            </div>
          </div>

          <nav aria-label={t('nav.services')}>
            <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-shell-200/50">
              {t('nav.services')}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SERVICES.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/services#${s.id}`}
                    className="text-[0.8125rem] text-shell-200/80 transition-colors hover:text-shell-50"
                  >
                    {lang === 'ar' ? s.ar : lang === 'fr' ? s.fr : s.en}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('nav.home')}>
            <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-shell-200/50">
              {t('nav.home')}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/about', label: t('nav.about') },
                { to: '/book', label: t('nav.booking') },
                { to: '/appointment', label: t('appointment.lookupTitle') },
                { to: '/location', label: t('nav.location') },
                { to: '/contact', label: t('nav.contact') },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[0.8125rem] text-shell-200/80 transition-colors hover:text-shell-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-shell-200/50">
              {t('location.title')}
            </h2>
            <address className="mt-4 space-y-3 not-italic">
              <div className="flex gap-2.5">
                <Icon name="pin" size={16} className="mt-0.5 shrink-0 text-sage-300" />
                <span className="text-[0.8125rem] leading-relaxed text-shell-200/80" dir="ltr">
                  {CLINIC.addressLine1}
                  <br />
                  {CLINIC.addressLine2}, {CLINIC.wilaya}
                </span>
              </div>
              {CLINIC.phones.map((phone) => (
                <div key={phone.value} className="flex gap-2.5">
                  <Icon name="phone" size={16} className="mt-0.5 shrink-0 text-sage-300" />
                  <a
                    href={`tel:${phone.international}`}
                    className="num text-[0.8125rem] text-shell-200/80 transition-colors hover:text-shell-50"
                    dir="ltr"
                  >
                    {phone.value}
                  </a>
                </div>
              ))}
              <div className="flex gap-2.5">
                <Icon name="clock" size={16} className="mt-0.5 shrink-0 text-sage-300" />
                <OpeningHours tone="dark" compact />
              </div>
            </address>

            <div className="mt-5 flex gap-2">
              <a
                href={mapsDirectionsUrl(CLINIC.mapsQuery)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-shell-50/10 px-3 text-[0.8125rem] font-medium text-shell-50 ring-1 ring-inset ring-shell-50/15 transition-colors hover:bg-shell-50/20"
              >
                <Icon name="pin" size={16} />
                {t('cta.openMap')}
                <span className="sr-only">({t('a11y.openInNewTab')})</span>
              </a>
              <a
                href={waLink(CLINIC.whatsappInternational)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-shell-50/10 px-3 text-[0.8125rem] font-medium text-shell-50 ring-1 ring-inset ring-shell-50/15 transition-colors hover:bg-shell-50/20"
              >
                <Icon name="whatsapp" size={16} />
                {t('cta.whatsapp')}
                <span className="sr-only">({t('a11y.openInNewTab')})</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-11 flex flex-col gap-3 border-t border-shell-50/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.75rem] text-shell-200/50">
            © {year} DR M. KATTOU — Chirurgien Dentiste. {CLINIC.addressLine2}, {CLINIC.wilaya}.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/staff"
              className="inline-flex items-center gap-1.5 text-[0.75rem] text-shell-200/50 transition-colors hover:text-shell-200"
            >
              <Icon name="lock" size={13} />
              {t('nav.staff')}
            </Link>
            <Link
              to="/platform"
              className="text-[0.75rem] text-shell-200/50 transition-colors hover:text-shell-200"
            >
              {t('landing.discoverSystem')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
