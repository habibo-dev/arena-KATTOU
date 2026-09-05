import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, Wordmark } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Field, FormError, Input } from '@/components/ui/Form';
import { Card, CardBody } from '@/components/ui/Card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n';
import { useSession } from '@/store/session';
import { ROLE_LABELS } from '@/lib/auth';

const DEMO_ACCOUNTS = [
  { login: 'admin', role: 'owner' as const },
  { login: 'dr.kattou', role: 'doctor' as const },
  { login: 'reception', role: 'receptionist' as const },
];

const DEMO_PASSWORD = 'Kattou@2025';

export default function Login() {
  const { t, lang } = useI18n();
  const { signIn, session } = useSession();
  const navigate = useNavigate();

  const [login, setLogin] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signIn(login, secret);
    setBusy(false);
    if (!result.ok) {
      setError(
        result.error === 'accountDisabled'
          ? t('staff.accountDisabled')
          : t('staff.invalidCredentials'),
      );
      return;
    }
    navigate('/staff');
  };

  const fill = (value: string) => {
    setLogin(value);
    setSecret(DEMO_PASSWORD);
    setError(null);
  };

  return (
    <div className="surface-navy flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" aria-label="DR M. KATTOU">
          <Wordmark tone="light" />
        </Link>
        <LanguageSwitcher tone="dark" />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-shell-50/10 text-shell-50 ring-1 ring-inset ring-shell-50/20">
              <Icon name="lock" size={22} />
            </span>
            <h1 className="mt-3.5 text-[1.25rem] font-semibold text-shell-50">
              {t('staff.loginTitle')}
            </h1>
            <p className="mt-1.5 text-[0.8125rem] text-shell-200/70">{t('staff.loginBody')}</p>
          </div>

          <Card>
            <CardBody>
              {session ? (
                <div className="text-center">
                  <p className="text-[0.875rem] text-stone-600">
                    {t('staff.signedInAs')} <strong className="text-navy-900">{session.name}</strong>
                  </p>
                  <Button className="mt-4" block onClick={() => navigate('/staff')}>
                    {t('admin.overview')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4" noValidate>
                  {error ? <FormError message={error} /> : null}

                  <Field label={t('staff.login')} htmlFor="login" required>
                    <Input
                      id="login"
                      value={login}
                      autoComplete="username"
                      dir="ltr"
                      className="text-start"
                      onChange={(e) => {
                        setLogin(e.target.value);
                        setError(null);
                      }}
                    />
                  </Field>

                  <Field label={t('staff.password')} htmlFor="secret" required>
                    <Input
                      id="secret"
                      type="password"
                      value={secret}
                      autoComplete="current-password"
                      dir="ltr"
                      className="text-start"
                      onChange={(e) => {
                        setSecret(e.target.value);
                        setError(null);
                      }}
                    />
                  </Field>

                  <Button type="submit" size="lg" block loading={busy} icon="logout">
                    {busy ? t('staff.signingIn') : t('staff.signIn')}
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>

          <div className="mt-4 rounded-lg border border-shell-50/15 bg-shell-50/[0.05] p-4">
            <p className="flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-shell-200/60">
              <Icon name="info" size={14} />
              {t('staff.demoTitle')}
            </p>
            <p className="mt-2 text-[0.75rem] leading-relaxed text-shell-200/60">
              {t('staff.demoBody')}
            </p>
            <ul className="mt-3 space-y-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <li key={account.login}>
                  <button
                    type="button"
                    onClick={() => fill(account.login)}
                    className="flex w-full items-center justify-between gap-3 rounded-md bg-shell-50/[0.06] px-3 py-2 text-start transition-colors hover:bg-shell-50/[0.12]"
                  >
                    <span className="num text-[0.8125rem] font-medium text-shell-50">
                      {account.login}
                    </span>
                    <span className="text-[0.6875rem] text-shell-200/60">
                      {ROLE_LABELS[account.role][lang]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="num mt-3 text-center text-[0.75rem] text-shell-200/50" dir="ltr">
              {DEMO_PASSWORD}
            </p>
          </div>

          <Link
            to="/"
            className="mt-5 flex items-center justify-center gap-1.5 text-[0.8125rem] text-shell-200/60 transition-colors hover:text-shell-50"
          >
            <Icon name="arrowRight" size={15} />
            {t('errors.backHome')}
          </Link>
        </div>
      </main>
    </div>
  );
}
