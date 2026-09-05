import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { LinkButton } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { useSession } from '@/store/session';
import type { Capability } from '@/lib/auth';

/**
 * Route guard. Checked on every render, not just on mount, so a session that
 * expires or a role that loses a capability cannot keep a page alive.
 */
export function RequireAuth({
  capability,
  children,
}: {
  capability?: Capability;
  children: ReactNode;
}) {
  const { session, can } = useSession();
  const location = useLocation();
  const { t } = useI18n();

  if (!session) {
    return <Navigate to="/staff" replace state={{ from: location.pathname }} />;
  }

  if (capability && !can(capability)) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-shell-200 text-stone-400">
          <Icon name="lock" size={26} />
        </span>
        <h1 className="mt-4 text-[1.125rem] font-semibold text-navy-900">{t('staff.noAccess')}</h1>
        <p className="mt-2 text-[0.8125rem] leading-relaxed text-stone-600">
          {t('staff.unauthorizedAction')}
        </p>
        <div className="mt-6 flex justify-center">
          <LinkButton to="/staff/queue" variant="secondary" icon="users">
            {t('staff.navQueue')}
          </LinkButton>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
