import { Icon } from '@/components/ui/Icon';
import { AnchorButton, LinkButton } from '@/components/ui/Button';
import { InfoNote } from '@/components/ui/Form';
import { PageHeader } from '@/components/clinic/PageHeader';
import { OpeningHours } from '@/components/clinic/OpeningHours';
import { FaqList } from '@/components/clinic/FaqList';
import { useI18n } from '@/i18n';
import { useClinic } from '@/store/clinic';
import { mapsDirectionsUrl, waLink } from '@/lib/clinic';

export default function Contact() {
  const { t } = useI18n();
  const { settings } = useClinic();

  const whatsappMessage =
    'Bonjour, je souhaite des informations concernant un rendez-vous au cabinet du DR M. KATTOU.';

  return (
    <>
      <PageHeader eyebrow={t('nav.contact')} title={t('contact.title')} body={t('contact.subtitle')} />

      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card p-5">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-navy-800 text-shell-50">
              <Icon name="phone" size={19} />
            </span>
            <h2 className="mt-4 text-[0.9375rem] font-semibold text-navy-900">
              {t('contact.byPhone')}
            </h2>
            <ul className="mt-3 space-y-2">
              {settings.phones.map((phone) => (
                <li key={phone.value}>
                  <a
                    href={`tel:${phone.international}`}
                    className="num block text-[1rem] font-semibold text-navy-900 hover:text-sage-700"
                    dir="ltr"
                  >
                    {phone.value}
                  </a>
                  <span className="text-[0.75rem] text-stone-400">{phone.label}</span>
                </li>
              ))}
            </ul>
            <AnchorButton
              href={`tel:${settings.phones[0].international}`}
              block
              className="mt-4"
              icon="phone"
            >
              {t('cta.call')}
            </AnchorButton>
          </div>

          <div className="card p-5">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-sage-600 text-white">
              <Icon name="whatsapp" size={19} />
            </span>
            <h2 className="mt-4 text-[0.9375rem] font-semibold text-navy-900">
              {t('contact.byWhatsapp')}
            </h2>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-stone-600">
              {t('contact.whatsappNote')}
            </p>
            <AnchorButton
              href={waLink(settings.whatsappInternational, whatsappMessage)}
              target="_blank"
              rel="noreferrer noopener"
              variant="success"
              block
              className="mt-4"
              icon="whatsapp"
            >
              {t('cta.whatsapp')}
            </AnchorButton>
          </div>

          <div className="card p-5">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-clay-500 text-white">
              <Icon name="pin" size={19} />
            </span>
            <h2 className="mt-4 text-[0.9375rem] font-semibold text-navy-900">
              {t('location.addressLabel')}
            </h2>
            <address className="mt-2.5 not-italic">
              <p className="text-[0.875rem] leading-relaxed text-navy-800" dir="ltr">
                {settings.addressLine1}
                <br />
                {settings.addressLine2}, {settings.wilaya}
              </p>
            </address>
            <AnchorButton
              href={mapsDirectionsUrl(settings.mapsQuery)}
              target="_blank"
              rel="noreferrer noopener"
              variant="secondary"
              block
              className="mt-4"
              icon="external"
            >
              {t('cta.openMap')}
            </AnchorButton>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-navy-900">
              <Icon name="clock" size={17} className="text-sage-600" />
              {t('location.hoursLabel')}
            </h2>
            <div className="mt-3.5">
              <OpeningHours showHint />
            </div>
            <p className="mt-4 text-[0.8125rem] text-stone-500">{t('contact.responseNote')}</p>
          </div>

          <div className="card p-5">
            <h2 className="text-[0.9375rem] font-semibold text-navy-900">{t('cta.book')}</h2>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-stone-600">
              {t('home.finalBody')}
            </p>
            <LinkButton to="/book" block className="mt-4" icon="calendar">
              {t('cta.bookShort')}
            </LinkButton>
            <LinkButton
              to="/appointment"
              variant="ghost"
              block
              className="mt-2"
              icon="ticket"
            >
              {t('appointment.lookupTitle')}
            </LinkButton>
          </div>
        </div>

        <div className="mt-4">
          <InfoNote tone="warn" icon="alert">
            {t('contact.emergencyNote')}
          </InfoNote>
        </div>

        <div className="mt-12">
          <h2 className="text-[1.25rem] font-semibold text-navy-900">{t('home.faqTitle')}</h2>
          <FaqList className="mt-5" />
        </div>
      </section>
    </>
  );
}
