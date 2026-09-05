import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownItem } from '@/components/ui/Modal';
import { StatusBadge, TypeBadge } from '@/components/queue/QueueVisual';
import { useI18n } from '@/i18n';
import { useSession } from '@/store/session';
import { humanDuration } from '@/lib/time';
import { serviceById } from '@/lib/clinic';
import type { QueueEntry } from '@/lib/types';

export interface QueueRowActions {
  onStart: (id: string) => void;
  onFinish: (id: string) => void;
  onSkip: (id: string) => void;
  onCheckIn: (id: string) => void;
  onCancel: (id: string) => void;
  onEmergency: (id: string) => void;
  onDelay: (id: string) => void;
  onReschedule: (id: string) => void;
  onProfile: (id: string) => void;
}

/**
 * One row of the queue manager.
 *
 * Built for speed: the primary action for the row's current state is a large
 * tap target on the row itself, everything else lives in an overflow menu.
 * A receptionist can run the whole queue while on the phone.
 */
export function QueueRow({
  entry,
  actions,
  isCurrent,
  showPhone = false,
}: {
  entry: QueueEntry;
  actions: QueueRowActions;
  isCurrent?: boolean;
  showPhone?: boolean;
}) {
  const { t, lang } = useI18n();
  const { can } = useSession();
  const service = serviceById(entry.serviceId);

  const primary = (() => {
    if (!can('consultation:control') && !can('queue:manage')) return null;
    if (entry.status === 'in_consultation')
      return { label: t('reception.actionFinish'), icon: 'check' as const, run: actions.onFinish };
    if (!entry.checkedInAt)
      return { label: t('reception.actionCheckIn'), icon: 'check' as const, run: actions.onCheckIn };
    return { label: t('reception.actionStart'), icon: 'play' as const, run: actions.onStart };
  })();

  return (
    <li
      className={`relative rounded-lg border px-3 py-3 transition-colors ${
        isCurrent
          ? 'border-navy-300 bg-navy-50/60'
          : entry.type === 'emergency'
            ? 'border-[#E4BDB9] bg-[#FBEEED]/60'
            : 'border-shell-300 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`num grid h-11 w-11 shrink-0 place-items-center rounded-md text-[0.9375rem] font-semibold ${
            isCurrent
              ? 'bg-navy-800 text-shell-50'
              : entry.type === 'emergency'
                ? 'bg-[#A8433C] text-white'
                : 'bg-shell-200 text-navy-700'
          }`}
        >
          {entry.queueNumber}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-[0.9375rem] font-semibold text-navy-900">
              {entry.patientName}
            </span>
            <StatusBadge status={entry.status} size="sm" />
            {entry.type !== 'scheduled' ? <TypeBadge type={entry.type} /> : null}
          </div>

          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 text-[0.75rem] text-stone-500">
            <span className="flex items-center gap-1">
              <Icon name={service.icon as 'tooth'} size={13} className="text-sage-600" />
              {lang === 'ar' ? service.ar : lang === 'fr' ? service.fr : service.en}
            </span>
            {entry.slot ? (
              <span className="num" dir="ltr">
                {entry.slot}
              </span>
            ) : null}
            <span className="num" dir="ltr">
              {entry.ref}
            </span>
            {showPhone ? (
              <span className="num" dir="ltr">
                {entry.patientPhone.replace('+213', '0')}
              </span>
            ) : null}
          </p>

          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[0.6875rem] text-stone-400">
            {entry.status === 'in_consultation' ? (
              <span className="flex items-center gap-1 text-navy-600">
                <Icon name="activity" size={12} />
                {humanDuration(entry.inProgressMinutes)}
              </span>
            ) : entry.checkedInAt ? (
              <span className="flex items-center gap-1">
                <Icon name="hourglass" size={12} />
                {t('reception.waitingFor')} {humanDuration(entry.waitingMinutes)}
              </span>
            ) : null}
            {entry.waitingMode === 'outside' ? (
              <span className="flex items-center gap-1">
                <Icon name="pin" size={12} />
                {t('appointment.waitingOutside')}
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {primary ? (
            <Button
              size="sm"
              variant={isCurrent ? 'primary' : 'success'}
              icon={primary.icon}
              onClick={() => primary.run(entry.appointmentId)}
            >
              <span className="hidden sm:inline">{primary.label}</span>
            </Button>
          ) : null}

          <Dropdown
            label={t('a11y.dialog')}
            trigger={({ toggle, open }) => (
              <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-label={t('a11y.dialog')}
                className="grid h-9 w-9 place-items-center rounded-md text-stone-500 transition-colors hover:bg-shell-200 hover:text-navy-900"
              >
                <Icon name="dots" size={18} />
              </button>
            )}
          >
            {(close) => (
              <>
                <DropdownItem
                  icon="user"
                  onClick={() => {
                    close();
                    actions.onProfile(entry.appointmentId);
                  }}
                >
                  {t('reception.patientProfile')}
                </DropdownItem>
                {entry.status !== 'in_consultation' ? (
                  <DropdownItem
                    icon="play"
                    onClick={() => {
                      close();
                      actions.onStart(entry.appointmentId);
                    }}
                  >
                    {t('reception.actionStart')}
                  </DropdownItem>
                ) : null}
                <DropdownItem
                  icon="skip"
                  onClick={() => {
                    close();
                    actions.onSkip(entry.appointmentId);
                  }}
                >
                  {t('reception.actionSkip')}
                </DropdownItem>
                <DropdownItem
                  icon="timer"
                  onClick={() => {
                    close();
                    actions.onDelay(entry.appointmentId);
                  }}
                >
                  {t('reception.actionDelay')}
                </DropdownItem>
                <DropdownItem
                  icon="edit"
                  onClick={() => {
                    close();
                    actions.onReschedule(entry.appointmentId);
                  }}
                >
                  {t('reception.actionReschedule')}
                </DropdownItem>
                {entry.type !== 'emergency' ? (
                  <DropdownItem
                    icon="alert"
                    tone="danger"
                    onClick={() => {
                      close();
                      actions.onEmergency(entry.appointmentId);
                    }}
                  >
                    {t('reception.actionEmergency')}
                  </DropdownItem>
                ) : null}
                <DropdownItem
                  icon="trash"
                  tone="danger"
                  onClick={() => {
                    close();
                    actions.onCancel(entry.appointmentId);
                  }}
                >
                  {t('reception.actionCancel')}
                </DropdownItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>
    </li>
  );
}
