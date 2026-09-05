import type { ReactNode } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Icon, Wordmark } from '@/components/ui/Icon';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n';
import { CLINIC } from '@/lib/clinic';

/**
 * Patient-facing shell — deliberately lighter than the marketing site.
 * A patient arriving from a link needs one thing: their status.
 */
export function PatientLayout({ children }: { children?: ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col bg-shell">
      <a href="#main" className="skip-link">
        {t('nav.skipToContent')}
      </a>

      <header className="sticky top-0 z-40 border-b border-shell-300 bg-shell-50/95 backdrop-blur supports-[backdrop-filter]:bg-shell-50/85">
        <div className="container-page flex h-14 items-center justify-between gap-3">
          <Link to="/" aria-label="DR M. KATTOU">
            <Wordmark className="scale-[0.92] origin-start" />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <a
              href={`tel:${CLINIC.phones[0].international}`}
              className="grid h-9 w-9 place-items-center rounded-md text-navy-700 transition-colors hover:bg-navy-800/[0.06]"
              aria-label={t('cta.call')}
            >
              <Icon name="phone" size={18} />
            </a>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        {children ?? <Outlet />}
      </main>

      <footer className="border-t border-shell-300 bg-shell-50">
        <div className="container-page flex flex-col items-center gap-2 py-6 text-center">
          <p className="text-[0.75rem] text-stone-500" dir="ltr">
            {CLINIC.addressLine1} — {CLINIC.addressLine2}, {CLINIC.wilaya}
          </p>
          <div className="flex items-center gap-3">
            {CLINIC.phones.map((p) => (
              <a
                key={p.value}
                href={`tel:${p.international}`}
                className="num text-[0.75rem] font-medium text-navy-700 hover:text-sage-700"
                dir="ltr"
              >
                {p.value}
              </a>
            ))}
          </div>
          <Link to="/" className="mt-1 text-[0.75rem] text-stone-400 hover:text-navy-700">
            {t('nav.home')}
          </Link>
        </div>
      </footer>
    </div>
  );
}
