import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon, Wordmark } from '@/components/ui/Icon';
import { LinkButton } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n';
import { CLINIC } from '@/lib/clinic';

const NAV: { to: string; key: 'home' | 'services' | 'about' | 'booking' | 'location' | 'contact' }[] =
  [
    { to: '/', key: 'home' },
    { to: '/services', key: 'services' },
    { to: '/about', key: 'about' },
    { to: '/book', key: 'booking' },
    { to: '/location', key: 'location' },
    { to: '/contact', key: 'contact' },
  ];

export function Header() {
  const { t, dir } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile sheet on every navigation.
  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-[box-shadow,background-color] duration-200 ${
        scrolled
          ? 'border-b border-shell-300 bg-shell-50/95 shadow-[0_1px_0_rgba(16,41,60,0.04)] backdrop-blur supports-[backdrop-filter]:bg-shell-50/85'
          : 'border-b border-transparent bg-shell-50'
      }`}
    >
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            to="/"
            className="shrink-0 rounded-md"
            aria-label={`${t('nav.home')} — DR M. KATTOU`}
          >
            <Wordmark />
          </Link>

          <nav
            aria-label={t('a11y.mainNav')}
            className="hidden items-center gap-0.5 lg:flex"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative rounded-md px-3 py-2 text-[0.875rem] font-medium transition-colors ${
                    isActive
                      ? 'text-navy-900 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-sage-500'
                      : 'text-stone-600 hover:text-navy-900'
                  }`
                }
              >
                {t(`nav.${item.key}`)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${CLINIC.phones[0].international}`}
              className="hidden h-10 items-center gap-2 rounded-md px-3 text-[0.8125rem] font-medium text-navy-700 transition-colors hover:bg-navy-800/[0.06] md:inline-flex"
            >
              <Icon name="phone" size={16} />
              <span className="num" dir="ltr">
                {CLINIC.phones[0].value}
              </span>
            </a>
            <LanguageSwitcher />
            <LinkButton to="/book" size="sm" className="hidden sm:inline-flex">
              {t('cta.bookShort')}
            </LinkButton>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? t('nav.closeMenu') : t('nav.menu')}
              className="grid h-10 w-10 place-items-center rounded-md text-navy-800 transition-colors hover:bg-navy-800/[0.06] lg:hidden"
            >
              <Icon name={open ? 'x' : 'menu'} size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation sheet */}
      {open ? (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-16 bottom-0 z-40 animate-fade-in overflow-y-auto border-t border-shell-300 bg-shell-50 lg:hidden"
        >
          <nav aria-label={t('a11y.mainNav')} className="container-page py-3">
            <ul className="divide-y divide-shell-300">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between py-3.5 text-[0.9375rem] font-medium ${
                        isActive ? 'text-sage-700' : 'text-navy-800'
                      }`
                    }
                  >
                    {t(`nav.${item.key}`)}
                    <Icon
                      name={dir === 'rtl' ? 'chevronLeft' : 'chevronRight'}
                      size={16}
                      className="text-stone-400"
                    />
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2.5">
              <LinkButton to="/book" size="lg" block icon="calendar">
                {t('cta.book')}
              </LinkButton>
              <a
                href={`tel:${CLINIC.phones[0].international}`}
                className="flex h-12 items-center justify-center gap-2 rounded-md bg-white text-[0.9375rem] font-medium text-navy-800 ring-1 ring-inset ring-shell-300"
              >
                <Icon name="phone" size={17} />
                <span className="num" dir="ltr">
                  {CLINIC.phones[0].value}
                </span>
              </a>
            </div>

            <Link
              to="/staff"
              className="mt-6 flex items-center justify-center gap-2 py-3 text-[0.8125rem] font-medium text-stone-500"
            >
              <Icon name="lock" size={15} />
              {t('nav.staff')}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
