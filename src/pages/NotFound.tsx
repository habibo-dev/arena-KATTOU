import { Icon } from '@/components/ui/Icon';
import { LinkButton } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { CLINIC } from '@/lib/clinic';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <section className="container-page py-20 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-shell-200 text-stone-400">
        <Icon name="search" size={28} />
      </span>
      <h1 className="mt-5 text-[1.5rem] font-semibold text-navy-900">{t('errors.notFound')}</h1>
      <p className="mx-auto mt-3 max-w-sm text-[0.875rem] leading-relaxed text-stone-600">
        {t('location.subtitle')}
      </p>
      <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
        <LinkButton to="/" icon="arrowRight">
          {t('errors.backHome')}
        </LinkButton>
        <LinkButton to="/book" variant="secondary" icon="calendar">
          {t('cta.book')}
        </LinkButton>
      </div>
      <p className="num mt-8 text-[0.8125rem] text-stone-400" dir="ltr">
        {CLINIC.phones[0].value}
      </p>
    </section>
  );
}
