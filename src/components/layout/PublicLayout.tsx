import { useEffect, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { QuickActions } from './QuickActions';
import { useI18n } from '@/i18n';

/** Restores focus + scroll position on every route change. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export function PublicLayout({ children }: { children?: ReactNode }) {
  const { t, dir } = useI18n();
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-shell-50">
      <a href="#main" className="skip-link">
        {t('nav.skipToContent')}
      </a>
      <Header />
      <main id="main" dir={dir} className="flex-1">
        {children ?? <Outlet />}
      </main>
      <Footer />
      {/* Hidden on the pages where a contextual action bar is more useful. */}
      {location.pathname === '/' ? <QuickActions /> : null}
    </div>
  );
}
