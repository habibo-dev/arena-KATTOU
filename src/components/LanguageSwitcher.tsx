import { LANGUAGES, useI18n } from '@/i18n';

/** Compact language switcher — always visible, never buried in a menu. */
export function LanguageSwitcher({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t('a11y.languageSwitcher')}
      className={`inline-flex items-center gap-0.5 rounded-md p-0.5 ring-1 ring-inset ${
        tone === 'dark' ? 'bg-shell-50/5 ring-shell-50/15' : 'bg-shell-100 ring-shell-300'
      }`}
    >
      {LANGUAGES.map((item) => {
        const active = item.code === lang;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLang(item.code)}
            aria-pressed={active}
            lang={item.code}
            title={item.label}
            className={`num h-7 min-w-8 rounded px-2 text-[0.6875rem] font-semibold transition-colors duration-150 ${
              active
                ? tone === 'dark'
                  ? 'bg-shell-50/15 text-shell-50'
                  : 'bg-white text-navy-900 shadow-[0_1px_2px_rgba(16,41,60,0.12)]'
                : tone === 'dark'
                  ? 'text-shell-200/70 hover:text-shell-50'
                  : 'text-stone-500 hover:text-navy-800'
            }`}
          >
            {item.short}
            <span className="sr-only">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
