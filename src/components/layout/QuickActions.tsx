import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { useI18n } from '@/i18n';
import { CLINIC, waLink } from '@/lib/clinic';

/**
 * Persistent mobile action bar — call / WhatsApp / book.
 * Sits above the safe area and is hidden on tablet and up, where the header
 * already carries these actions.
 */
export function QuickActions() {
  const { t } = useI18n();

  return (
    <div className="sticky bottom-0 z-40 border-t border-shell-300 bg-shell-50/95 pb-safe backdrop-blur supports-[backdrop-filter]:bg-shell-50/85 md:hidden print:hidden">
      <div className="container-page flex items-stretch gap-2 py-2">
        <a
          href={`tel:${CLINIC.phones[0].international}`}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-white text-[0.8125rem] font-medium text-navy-800 ring-1 ring-inset ring-shell-300 active:bg-shell-100"
        >
          <Icon name="phone" size={16} />
          {t('cta.call')}
        </a>
        <a
          href={waLink(CLINIC.whatsappInternational)}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`${t('cta.whatsapp')} (${t('a11y.openInNewTab')})`}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-white text-sage-600 ring-1 ring-inset ring-shell-300 active:bg-shell-100"
        >
          <Icon name="whatsapp" size={18} />
        </a>
        <Link
          to="/book"
          className="flex h-11 flex-[1.4] items-center justify-center gap-2 rounded-md bg-navy-800 text-[0.8125rem] font-medium text-shell-50 active:bg-navy-900"
        >
          <Icon name="calendar" size={16} />
          {t('cta.bookShort')}
        </Link>
      </div>
    </div>
  );
}
