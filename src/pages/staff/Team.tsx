import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Badge, Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field, FormError, InfoNote, Input, Select, Switch } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { useI18n } from '@/i18n';
import { useClinic, useErrorLabel } from '@/store/clinic';
import { useSession } from '@/store/session';
import { useToast } from '@/components/ui/Toast';
import { ROLE_CAPABILITIES, ROLE_LABELS } from '@/lib/auth';
import type { StaffRole } from '@/lib/types';

export default function Team() {
  const { t, lang } = useI18n();
  const { staff, addStaff, toggleStaff } = useClinic();
  const { session } = useSession();
  const toast = useToast();
  const errorLabel = useErrorLabel();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [role, setRole] = useState<StaffRole>('receptionist');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const result = await addStaff({ name, login, role, secret });
    setBusy(false);
    if (!result.ok) {
      setError(errorLabel(result.error));
      return;
    }
    toast.push({ tone: 'success', title: t('admin.staffCreated') });
    setName('');
    setLogin('');
    setSecret('');
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.35rem] font-semibold text-navy-900">{t('staff.navStaff')}</h1>
          <p className="mt-1 text-[0.8125rem] text-stone-500">{t('staff.demoBody')}</p>
        </div>
        <Button icon="plus" onClick={() => setOpen(true)}>
          {t('admin.staffAdd')}
        </Button>
      </div>

      <Card>
        <CardHeader title={t('staff.navStaff')} subtitle={`${staff.length}`} icon="shield" />
        <CardBody className="p-0">
          <ul className="divide-y divide-shell-200">
            {staff.map((account) => (
              <li key={account.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-navy-50 text-navy-600">
                  <Icon
                    name={
                      account.role === 'owner'
                        ? 'shield'
                        : account.role === 'doctor'
                          ? 'stethoscope'
                          : 'user'
                    }
                    size={18}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.875rem] font-semibold text-navy-900">
                    {account.name}
                  </p>
                  <p className="num text-[0.75rem] text-stone-500" dir="ltr">
                    {account.login}
                  </p>
                </div>
                <Badge tone={account.role === 'owner' ? 'accent' : 'info'} size="sm">
                  {ROLE_LABELS[account.role][lang]}
                </Badge>
                {account.id === session?.staffId ? (
                  <Badge tone="success" size="sm">
                    {t('staff.signedInAs')}
                  </Badge>
                ) : null}
                <div className="w-full sm:w-44">
                  <Switch
                    label={account.active ? t('admin.staffActive') : t('admin.staffDisabled')}
                    checked={account.active}
                    onChange={(v) => void toggleStaff(account.id, v)}
                    disabled={account.id === session?.staffId}
                  />
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {/* Roles + capabilities */}
      <div className="grid gap-4 md:grid-cols-3">
        {(['owner', 'doctor', 'receptionist'] as StaffRole[]).map((roleKey) => (
          <Card key={roleKey}>
            <CardHeader
              title={ROLE_LABELS[roleKey][lang]}
              icon={roleKey === 'owner' ? 'shield' : roleKey === 'doctor' ? 'stethoscope' : 'user'}
            />
            <CardBody>
              <ul className="space-y-1.5">
                {ROLE_CAPABILITIES[roleKey].map((cap) => (
                  <li key={cap} className="flex items-start gap-2 text-[0.75rem] text-stone-600">
                    <Icon name="check" size={13} className="mt-0.5 shrink-0 text-sage-500" />
                    <span className="num">{cap}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        ))}
      </div>

      <InfoNote tone="warn" icon="lock">
        {t('staff.demoBody')}
      </InfoNote>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('admin.staffAdd')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t('cta.cancel')}
            </Button>
            <Button icon="plus" loading={busy} onClick={submit}>
              {t('reception.create')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error ? <FormError message={error} /> : null}
          <Field label={t('reception.patientName')} htmlFor="staffName" required>
            <Input id="staffName" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={t('admin.staffLogin')} htmlFor="staffLogin" required>
            <Input
              id="staffLogin"
              value={login}
              dir="ltr"
              className="num text-start"
              autoComplete="off"
              onChange={(e) => setLogin(e.target.value)}
            />
          </Field>
          <Field label={t('admin.staffRole')} htmlFor="staffRole">
            <Select
              id="staffRole"
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
            >
              <option value="owner">{ROLE_LABELS.owner[lang]}</option>
              <option value="doctor">{ROLE_LABELS.doctor[lang]}</option>
              <option value="receptionist">{ROLE_LABELS.receptionist[lang]}</option>
            </Select>
          </Field>
          <Field label={t('admin.staffPassword')} htmlFor="staffSecret" required>
            <Input
              id="staffSecret"
              type="password"
              value={secret}
              dir="ltr"
              className="text-start"
              autoComplete="new-password"
              onChange={(e) => setSecret(e.target.value)}
            />
          </Field>
          <p className="text-[0.75rem] leading-relaxed text-stone-500">{t('staff.demoBody')}</p>
        </div>
      </Modal>
    </div>
  );
}
