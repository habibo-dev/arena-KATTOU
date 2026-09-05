import { Icon } from '@/components/ui/Icon';
import { Badge, Card, CardBody, CardHeader, EmptyState } from '@/components/ui/Card';
import { Table, THead, TH, TR, TD } from '@/components/ui/Table';
import { useI18n } from '@/i18n';
import { useClinic } from '@/store/clinic';
import { NOTIFICATION_EVENTS, notificationBus } from '@/lib/notifications';
import type { NotificationChannelId } from '@/lib/types';

const CHANNEL_LABEL: Record<NotificationChannelId, 'admin.channelInApp' | 'admin.channelSms' | 'admin.channelWhatsapp' | 'admin.channelPush'> = {
  in_app: 'admin.channelInApp',
  sms: 'admin.channelSms',
  whatsapp: 'admin.channelWhatsapp',
  push: 'admin.channelPush',
};

/**
 * Notification centre + honest channel status.
 * An unconfigured channel is shown as unconfigured — the UI never claims a
 * message was delivered when it was not.
 */
export default function Notifications() {
  const { t } = useI18n();
  const { notifications, settings } = useClinic();
  const capabilities = notificationBus.capabilities();

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-[1.35rem] font-semibold text-navy-900">{t('notification.title')}</h1>
        <p className="mt-1 text-[0.8125rem] text-stone-500">{t('admin.notificationsBody')}</p>
      </div>

      {/* Channel status */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {capabilities.map((cap) => {
          const enabledInSettings = settings.notifications[cap.id].enabled;
          const active = cap.configured;
          return (
            <Card key={cap.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-navy-50 text-navy-600">
                  <Icon
                    name={
                      cap.id === 'sms'
                        ? 'phone'
                        : cap.id === 'whatsapp'
                          ? 'whatsapp'
                          : cap.id === 'push'
                            ? 'bell'
                            : 'activity'
                    }
                    size={18}
                  />
                </span>
                <Badge tone={active ? 'success' : 'neutral'} size="sm">
                  {active ? t('admin.channelActive') : t('admin.channelInactive')}
                </Badge>
              </div>
              <p className="mt-3 text-[0.875rem] font-semibold text-navy-900">
                {t(CHANNEL_LABEL[cap.id])}
              </p>
              <p className="mt-1 text-[0.75rem] leading-relaxed text-stone-500">
                {cap.hint ?? (enabledInSettings ? t('admin.channelActive') : t('admin.channelNotConfigured'))}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Event catalogue */}
      <Card>
        <CardHeader
          title={t('admin.notificationsTitle')}
          subtitle={`${NOTIFICATION_EVENTS.length}`}
          icon="list"
        />
        <CardBody className="p-0">
          <Table caption={t('admin.notificationsTitle')}>
            <THead>
              <TH>{t('notification.title')}</TH>
              <TH>Event</TH>
            </THead>
            <tbody>
              {NOTIFICATION_EVENTS.map((event) => (
                <TR key={event.id}>
                  <TD className="font-medium text-navy-900">
                    {t(`notification.${event.id}` as 'notification.patient_checked_in')}
                  </TD>
                  <TD>
                    <span className="num text-[0.75rem] text-stone-500">{event.id}</span>
                    <span className="mt-0.5 block text-[0.6875rem] text-stone-400">
                      {event.trigger}
                    </span>
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Live log */}
      <Card>
        <CardHeader
          title={t('notification.viewAll')}
          subtitle={`${notifications.length}`}
          icon="bell"
        />
        <CardBody className="p-0">
          {notifications.length === 0 ? (
            <EmptyState icon="bell" title={t('notification.empty')} />
          ) : (
            <ul className="divide-y divide-shell-200">
              {notifications.map((record) => (
                <li key={record.id} className="flex items-start gap-3 px-4 py-3 sm:px-5">
                  <span
                    className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md ${
                      record.delivered
                        ? 'bg-sage-50 text-sage-600'
                        : 'bg-shell-200 text-stone-400'
                    }`}
                  >
                    <Icon name={record.delivered ? 'check' : 'minus'} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[0.875rem] font-medium text-navy-900">
                        {record.title}
                      </span>
                      <Badge tone={record.delivered ? 'success' : 'neutral'} size="sm">
                        {record.delivered ? t('notification.delivered') : t('notification.notConfigured')}
                      </Badge>
                    </div>
                    {record.body ? (
                      <p className="mt-0.5 text-[0.75rem] text-stone-500">{record.body}</p>
                    ) : null}
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[0.6875rem] text-stone-400">
                      <span className="num">{record.event}</span>
                      {record.appointmentRef ? (
                        <span className="num">{record.appointmentRef}</span>
                      ) : null}
                      <span>{t(CHANNEL_LABEL[record.channel])}</span>
                      <span className="num">
                        {new Date(record.at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {record.reason ? <span className="num">{record.reason}</span> : null}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
