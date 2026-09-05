import { useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Card, CardBody, CardHeader, EmptyState, Stat } from '@/components/ui/Card';
import { Input } from '@/components/ui/Form';
import { Table, THead, TH, TR, TD } from '@/components/ui/Table';
import { StatusBadge } from '@/components/queue/QueueVisual';
import { useI18n } from '@/i18n';
import { useClinic } from '@/store/clinic';
import { formatPhone } from '@/lib/validation';
import { assertNoClinicalFields } from '@/lib/privacy';

/**
 * Patients — operational contact list only.
 * `assertNoClinicalFields` runs on every record as a runtime guard: if a future
 * version ever adds a clinical field, this screen fails loudly instead of
 * silently displaying it.
 */
export default function Patients() {
  const { t, formatDate } = useI18n();
  const { patients, appointments } = useClinic();
  const [query, setQuery] = useState('');

  const violations = useMemo(
    () => patients.flatMap((p) => assertNoClinicalFields(p)),
    [patients],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return patients
      .map((p) => {
        const history = appointments.filter((a) => a.patientId === p.id);
        return {
          ...p,
          count: history.length,
          last: history
            .map((a) => a.date)
            .sort()
            .at(-1),
          lastStatus: history
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))[0]?.status,
        };
      })
      .filter(
        (p) =>
          !q ||
          p.fullName.toLowerCase().includes(q) ||
          p.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')),
      )
      .sort((a, b) => (b.last ?? '').localeCompare(a.last ?? ''));
  }, [patients, appointments, query]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.35rem] font-semibold text-navy-900">{t('staff.navPatients')}</h1>
          <p className="mt-1 text-[0.8125rem] text-stone-500">{t('admin.privacyTitle')}</p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('reception.searchPlaceholder')}
            icon="search"
            aria-label={t('reception.searchPlaceholder')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t('staff.navPatients')} value={patients.length} icon="users" />
        <Stat label={t('analytics.appointments')} value={appointments.length} icon="calendar" />
        <Stat
          label={t('reception.cancelled')}
          value={patients.reduce((s, p) => s + p.cancellationCount, 0)}
          icon="xCircle"
          tone="danger"
        />
        <Stat
          label={t('reception.noShow')}
          value={patients.reduce((s, p) => s + p.noShowCount, 0)}
          icon="alert"
          tone="danger"
        />
      </div>

      {violations.length > 0 ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-[#EBD0CD] bg-[#FBEEED] px-4 py-3 text-[0.8125rem] text-[#8E3730]"
        >
          <Icon name="shield" size={16} className="mt-0.5 shrink-0" />
          <span>
            {t('admin.privacyBody')} — {violations.join(', ')}
          </span>
        </div>
      ) : null}

      <Card>
        <CardHeader
          title={t('staff.navPatients')}
          subtitle={`${rows.length} / ${patients.length}`}
          icon="users"
        />
        <CardBody className="p-0">
          {rows.length === 0 ? (
            <EmptyState
              icon="users"
              title={patients.length === 0 ? t('reception.noResults') : t('reception.noResults')}
              body={t('reception.walkInNote')}
            />
          ) : (
            <>
              <ul className="divide-y divide-shell-200 sm:hidden">
                {rows.map((p) => (
                  <li key={p.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[0.875rem] font-medium text-navy-900">
                          {p.fullName}
                        </p>
                        <p className="num mt-0.5 text-[0.75rem] text-stone-500" dir="ltr">
                          {formatPhone(p.phone)}
                        </p>
                      </div>
                      <span className="num shrink-0 rounded bg-shell-200 px-2 py-0.5 text-[0.75rem] font-semibold text-navy-800">
                        {p.count}
                      </span>
                    </div>
                    {p.last ? (
                      <p className="mt-1 text-[0.75rem] text-stone-400">{formatDate(p.last)}</p>
                    ) : null}
                  </li>
                ))}
              </ul>

              <div className="hidden sm:block">
                <Table caption={t('staff.navPatients')}>
                  <THead>
                    <TH>{t('reception.patientName')}</TH>
                    <TH>{t('reception.patientPhone')}</TH>
                    <TH align="center">{t('analytics.appointments')}</TH>
                    <TH>{t('analytics.appointments')}</TH>
                    <TH align="center">{t('reception.cancelled')}</TH>
                    <TH align="center">{t('reception.noShow')}</TH>
                  </THead>
                  <tbody>
                    {rows.map((p) => (
                      <TR key={p.id}>
                        <TD className="font-medium text-navy-900">{p.fullName}</TD>
                        <TD className="num" align="start">
                          <span dir="ltr">{formatPhone(p.phone)}</span>
                        </TD>
                        <TD align="center">
                          <span className="num font-semibold">{p.count}</span>
                        </TD>
                        <TD>
                          {p.last ? (
                            <span className="flex items-center gap-2">
                              <span className="text-[0.75rem] text-stone-500">
                                {formatDate(p.last, { weekday: undefined, month: 'short', day: 'numeric' })}
                              </span>
                              {p.lastStatus ? <StatusBadge status={p.lastStatus} size="sm" /> : null}
                            </span>
                          ) : (
                            <span className="text-[0.75rem] text-stone-400">—</span>
                          )}
                        </TD>
                        <TD align="center">
                          <span className="num">{p.cancellationCount}</span>
                        </TD>
                        <TD align="center">
                          <span className="num">{p.noShowCount}</span>
                        </TD>
                      </TR>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <p className="flex items-start gap-2 text-[0.75rem] leading-relaxed text-stone-400">
        <Icon name="shield" size={14} className="mt-px shrink-0" />
        {t('admin.privacyBody')}
      </p>
    </div>
  );
}
