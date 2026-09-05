import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n';
import { useSession } from '@/store/session';
import { useClinic } from '@/store/clinic';
import { ROLE_LABELS, type Capability } from '@/lib/auth';
import { LiveDot } from '@/components/ui/Card';

/**
 * Staff shell: top bar (identity + queue pulse) and a role-filtered sidebar
 * that collapses to a bottom tab bar on phones.
 */

interface StaffNavItem {
  to: string;
  labelKey: string;
  icon: Parameters<typeof Icon>[0]['name'];
  capability: Capability;
}

const NAV: StaffNavItem[] = [
  { to: '/staff/queue', labelKey: 'staff.navQueue', icon: 'users', capability: 'queue:read' },
  {
    to: '/staff/doctor',
    labelKey: 'doctor.title',
    icon: 'stethoscope',
    capability: 'consultation:control',
  },
  { to: '/staff/patients', labelKey: 'staff.navPatients', icon: 'user', capability: 'patients:read' },
  { to: '/staff/analytics', labelKey: 'staff.navAnalytics', icon: 'chart', capability: 'analytics:read' },
  {
    to: '/staff/notifications',
    labelKey: 'notification.title',
    icon: 'bell',
    capability: 'queue:read',
  },
  { to: '/staff/settings', labelKey: 'staff.navSettings', icon: 'settings', capability: 'settings:read' },
  { to: '/staff/team', labelKey: 'staff.navStaff', icon: 'shield', capability: 'staff:manage' },
];

export function StaffLayout({ children }: { children?: ReactNode }) {
  const { t, lang } = useI18n();
  const { session, signOut, can } = useSession();
  const { snapshot, today } = useClinic();
  const location = useLocation();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => setNavOpen(false), [location.pathname]);

  if (!session) {
    return <>{children}</>;
  }

  const role = ROLE_LABELS[session.role][lang];
  const items = NAV.filter((item) => can(item.capability));

  const signOutAndLeave = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-shell">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-e border-shell-300 bg-white lg:flex print:hidden">
        <div className="flex h-16 items-center gap-2.5 border-b border-shell-300 px-4">
          <span className="grid h-9 w-9 place-items-center rounded-[9px] bg-navy-800 text-shell-50">
            <Icon name="tooth" size={19} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[0.8125rem] font-semibold text-navy-900">DR M. KATTOU</p>
            <p className="text-[0.6875rem] text-stone-500">{t('admin.title')}</p>
          </div>
        </div>

        <nav aria-label={t('a11y.mainNav')} className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[0.8125rem] font-medium transition-colors ${
                      isActive
                        ? 'bg-navy-800 text-shell-50'
                        : 'text-stone-600 hover:bg-shell-100 hover:text-navy-900'
                    }`
                  }
                >
                  <Icon name={item.icon} size={17} />
                  {t(item.labelKey as 'staff.navQueue')}
                  {item.to === '/staff/queue' && snapshot.waiting.length > 0 ? (
                    <span className="num ms-auto rounded bg-sage-500/15 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-sage-700">
                      {snapshot.waiting.length}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-shell-300 p-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[0.8125rem] font-medium text-stone-600 transition-colors hover:bg-shell-100 hover:text-navy-900"
          >
            <Icon name="external" size={16} />
            {t('staff.navSite')}
          </Link>
          <button
            type="button"
            onClick={signOutAndLeave}
            className="mt-0.5 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[0.8125rem] font-medium text-stone-600 transition-colors hover:bg-shell-100 hover:text-navy-900"
          >
            <Icon name="logout" size={16} />
            {t('staff.logout')}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-shell-300 bg-shell-50/95 backdrop-blur supports-[backdrop-filter]:bg-shell-50/85 print:hidden">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-5">
            <button
              type="button"
              onClick={() => setNavOpen((v) => !v)}
              aria-expanded={navOpen}
              aria-label={t('nav.menu')}
              className="grid h-9 w-9 place-items-center rounded-md text-navy-800 hover:bg-shell-200 lg:hidden"
            >
              <Icon name={navOpen ? 'x' : 'menu'} size={19} />
            </button>

            <div className="flex min-w-0 items-center gap-2">
              <LiveDot />
              <span className="truncate text-[0.8125rem] font-medium text-stone-600">
                {t('reception.today')} ·{' '}
                <span className="num font-semibold text-navy-900">{snapshot.entries.length}</span>{' '}
                {t('units.patients')}
              </span>
              <span className="num hidden text-[0.75rem] text-stone-400 sm:inline">{today}</span>
            </div>

            <div className="ms-auto flex items-center gap-2">
              <LanguageSwitcher />
              <div className="hidden text-end sm:block">
                <p className="text-[0.75rem] font-semibold leading-tight text-navy-900">
                  {session.name}
                </p>
                <p className="text-[0.6875rem] leading-tight text-stone-500">{role}</p>
              </div>
              <Badge tone={session.role === 'owner' ? 'accent' : 'info'} size="sm">
                {role}
              </Badge>
            </div>
          </div>

          {/* Mobile nav drawer */}
          {navOpen ? (
            <nav
              aria-label={t('a11y.mainNav')}
              className="animate-fade-up border-t border-shell-300 bg-white p-2 lg:hidden"
            >
              <ul className="grid grid-cols-2 gap-1">
                {items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-3 py-2.5 text-[0.8125rem] font-medium ${
                          isActive ? 'bg-navy-800 text-shell-50' : 'text-stone-700 hover:bg-shell-100'
                        }`
                      }
                    >
                      <Icon name={item.icon} size={16} />
                      {t(item.labelKey as 'staff.navQueue')}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="mt-1 flex gap-1 border-t border-shell-200 pt-1">
                <Link
                  to="/"
                  className="flex flex-1 items-center gap-2 rounded-md px-3 py-2.5 text-[0.8125rem] font-medium text-stone-700 hover:bg-shell-100"
                >
                  <Icon name="external" size={16} />
                  {t('staff.navSite')}
                </Link>
                <button
                  type="button"
                  onClick={signOutAndLeave}
                  className="flex flex-1 items-center gap-2 rounded-md px-3 py-2.5 text-[0.8125rem] font-medium text-stone-700 hover:bg-shell-100"
                >
                  <Icon name="logout" size={16} />
                  {t('staff.logout')}
                </button>
              </div>
            </nav>
          ) : null}
        </header>

        <main className="flex-1 px-4 py-5 sm:px-5 sm:py-6 print:px-0 print:py-0">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
