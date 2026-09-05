import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ar, type Messages } from './ar';
import { fr } from './fr';
import { en } from './en';
import type { Direction, LanguageCode } from '@/lib/types';

/** Dot-path keys derived from the Arabic catalogue — full autocomplete + safety. */
export type PathKeys<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends object
      ? PathKeys<T[K], `${P}${K}.`>
      : never;
}[keyof T & string];

export type MessageKey = PathKeys<Messages>;

export const LANGUAGES: { code: LanguageCode; label: string; short: string; dir: Direction }[] = [
  { code: 'ar', label: 'العربية', short: 'AR', dir: 'rtl' },
  { code: 'fr', label: 'Français', short: 'FR', dir: 'ltr' },
  { code: 'en', label: 'English', short: 'EN', dir: 'ltr' },
];

const CATALOGUES: Record<LanguageCode, Messages> = { ar, fr, en };
const STORAGE_KEY = 'kattou.lang.v1';

function lookup(catalogue: Messages, path: string): string | null {
  const parts = path.split('.');
  let node: unknown = catalogue;
  for (const part of parts) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }
  return typeof node === 'string' ? node : null;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

function detectInitialLanguage(): LanguageCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (stored && stored in CATALOGUES) return stored;
  } catch {
    /* storage unavailable */
  }
  if (typeof navigator !== 'undefined') {
    const browser = navigator.language?.slice(0, 2).toLowerCase();
    if (browser === 'fr' || browser === 'en') return browser;
  }
  return 'ar';
}

interface I18nValue {
  lang: LanguageCode;
  dir: Direction;
  locale: string;
  setLang: (lang: LanguageCode) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  /** Service names carry their own terminology per language. */
  serviceLabel: (id: string, field: 'ar' | 'fr' | 'en') => string;
  formatDate: (iso: string, opts?: Intl.DateTimeFormatOptions) => string;
  formatTime: (hhmm: string) => string;
  weekdayName: (weekday: number) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

const DAY_NAMES_AR = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];
const DAY_NAMES_FR = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];
const DAY_NAMES_EN = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(() => detectInitialLanguage());

  const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr';
  const locale = CATALOGUES[lang].meta.locale;

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* no-op */
    }
  }, [lang, dir]);

  const setLang = useCallback((next: LanguageCode) => {
    if (next in CATALOGUES) setLangState(next);
  }, []);

  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>) => {
      const primary = lookup(CATALOGUES[lang], key as string);
      // Arabic is the fallback catalogue — a missing key never renders blank.
      const value = primary ?? lookup(ar, key as string) ?? key;
      return interpolate(value, params);
    },
    [lang],
  );

  const serviceLabel = useCallback(
    (id: string, field: 'ar' | 'fr' | 'en') => {
      void field;
      return id;
    },
    [],
  );

  const formatDate = useCallback(
    (iso: string, opts?: Intl.DateTimeFormatOptions) => {
      const d = new Date(`${iso}T00:00:00`);
      if (Number.isNaN(d.getTime())) return iso;
      try {
        return new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          ...opts,
        }).format(d);
      } catch {
        return iso;
      }
    },
    [locale],
  );

  const formatTime = useCallback((hhmm: string) => hhmm, []);

  const weekdayName = useCallback(
    (weekday: number) => {
      const names = lang === 'ar' ? DAY_NAMES_AR : lang === 'fr' ? DAY_NAMES_FR : DAY_NAMES_EN;
      return names[weekday] ?? String(weekday);
    },
    [lang],
  );

  const value = useMemo<I18nValue>(
    () => ({ lang, dir, locale, setLang, t, serviceLabel, formatDate, formatTime, weekdayName }),
    [lang, dir, locale, setLang, t, serviceLabel, formatDate, formatTime, weekdayName],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
