import type { ClinicSettings, EtaConfig, ServiceId } from './types';

/**
 * Single source of truth for clinic facts.
 *
 * RULE: only information supplied by the clinic lives here. No invented
 * credentials, awards, years of experience, patient counts, reviews, prices,
 * medical claims or opening hours.
 */
export const CLINIC = {
  doctorName: 'DR M. KATTOU',
  doctorTitle: 'Chirurgien Dentiste',
  addressLine1: 'B22 Bloc 05 N°135 Hay Salam',
  addressLine2: 'Khemis Miliana',
  wilaya: 'Aïn Defla',
  country: 'Algérie',
  phones: [
    { label: 'Mobile', value: '0558 41 80 73', international: '+213558418073' },
    { label: 'Fixe', value: '027 56 94 94', international: '+21327569494' },
  ],
  whatsappInternational: '+213558418073',
  /** Address text only — no coordinates are invented. */
  mapsQuery: 'B22 Bloc 05 N°135 Hay Salam, Khemis Miliana, Aïn Defla, Algérie',
} as const;

export const SERVICES: {
  id: ServiceId;
  code: string;
  ar: string;
  fr: string;
  en: string;
  arDescription: string;
  frDescription: string;
  enDescription: string;
  planningMinutes: number;
  icon: string;
}[] = [
  {
    id: 'odf',
    code: 'ODF',
    ar: 'تقويم الأسنان',
    fr: 'Orthodontie (ODF)',
    en: 'Orthodontics (ODF)',
    arDescription: 'تقييم ومتابعة اصطفاف الأسنان والفكّين.',
    frDescription: "Évaluation et suivi de l'alignement des dents et des mâchoires.",
    enDescription: 'Assessment and follow-up of teeth and jaw alignment.',
    planningMinutes: 30,
    icon: 'braces',
  },
  {
    id: 'soins',
    code: 'Soins',
    ar: 'العلاجات',
    fr: 'Soins dentaires',
    en: 'Dental care',
    arDescription: 'العلاجات المعتادة والمتابعة الدورية لصحة الفم والأسنان.',
    frDescription: 'Soins courants et suivi régulier de la santé bucco-dentaire.',
    enDescription: 'Routine care and regular follow-up of oral health.',
    planningMinutes: 25,
    icon: 'tooth',
  },
  {
    id: 'protheses',
    code: 'Prothèses',
    ar: 'التعويضات السنية',
    fr: 'Prothèses',
    en: 'Prosthetics',
    arDescription: 'التعويضات السنية الثابتة والمتحركة.',
    frDescription: 'Prothèses dentaires fixes et amovibles.',
    enDescription: 'Fixed and removable dental prosthetics.',
    planningMinutes: 40,
    icon: 'crown',
  },
  {
    id: 'extractions',
    code: 'Extractions',
    ar: 'قلع الأسنان',
    fr: 'Extractions',
    en: 'Extractions',
    arDescription: 'قلع الأسنان حسب تقييم الطبيب أثناء الزيارة.',
    frDescription: "Extractions dentaires selon l'évaluation du praticien lors de la consultation.",
    enDescription: 'Tooth extractions following the practitioner’s assessment at consultation.',
    planningMinutes: 30,
    icon: 'extract',
  },
  {
    id: 'radio',
    code: 'Radio',
    ar: 'الأشعة',
    fr: 'Radiologie',
    en: 'Radiology',
    arDescription: 'التصوير الشعاعي للأسنان داخل العيادة.',
    frDescription: 'Radiographie dentaire au cabinet.',
    enDescription: 'In-clinic dental radiography.',
    planningMinutes: 15,
    icon: 'xray',
  },
  {
    id: 'blanchiment',
    code: 'Blanchiment',
    ar: 'تبييض الأسنان',
    fr: 'Blanchiment',
    en: 'Whitening',
    arDescription: 'جلسات تبييض الأسنان بالعيادة.',
    frDescription: 'Séances de blanchiment dentaire au cabinet.',
    enDescription: 'In-clinic tooth whitening sessions.',
    planningMinutes: 45,
    icon: 'sparkle',
  },
  {
    id: 'petite-chirurgie',
    code: 'Petite Chirurgie',
    ar: 'جراحة بسيطة',
    fr: 'Petite chirurgie',
    en: 'Minor surgery',
    arDescription: 'تدخلات جراحية بسيطة داخل العيادة.',
    frDescription: 'Petites interventions chirurgicales au cabinet.',
    enDescription: 'Minor surgical procedures performed at the clinic.',
    planningMinutes: 45,
    icon: 'scalpel',
  },
];

export const DEFAULT_ETA_CONFIG: EtaConfig = {
  defaultConsultationMinutes: 25,
  serviceDurations: SERVICES.reduce((acc, s) => {
    acc[s.id] = s.planningMinutes;
    return acc;
  }, {} as Record<ServiceId, number>),
  bufferMinutes: 5,
  emergencyInterruptMinutes: 20,
  rangeSpreadMinutes: 10,
  rangeSpreadRatio: 0.15,
};

/**
 * Opening hours are NOT confirmed. Every day is `null`, so the whole product
 * renders "Horaires à confirmer" until the clinic configures them.
 */
const UNCONFIRMED_HOURS = [0, 1, 2, 3, 4, 5, 6].reduce((acc, day) => {
  acc[day] = null;
  return acc;
}, {} as Record<number, null>);

export const DEFAULT_CLINIC_SETTINGS: ClinicSettings = {
  doctorName: CLINIC.doctorName,
  doctorTitle: CLINIC.doctorTitle,
  addressLine1: CLINIC.addressLine1,
  addressLine2: CLINIC.addressLine2,
  city: CLINIC.addressLine2,
  wilaya: CLINIC.wilaya,
  country: CLINIC.country,
  phones: [...CLINIC.phones],
  whatsappInternational: CLINIC.whatsappInternational,
  openingHours: { ...UNCONFIRMED_HOURS },
  mapsQuery: CLINIC.mapsQuery,
  doctorPhotoDataUrl: null,
  eta: DEFAULT_ETA_CONFIG,
  bookingWindow: {
    firstSlot: '09:00',
    lastSlot: '17:00',
    slotStepMinutes: 30,
    // Sunday–Thursday, the usual Algerian working week. Editable in Settings.
    openWeekdays: [0, 1, 2, 3, 4],
    maxPerSlot: 2,
    horizonDays: 60,
  },
  notifications: {
    in_app: { enabled: true, provider: 'internal' },
    sms: { enabled: false, provider: null },
    whatsapp: { enabled: false, provider: null },
    push: { enabled: false, provider: null },
  },
};

export function serviceById(id: string) {
  return SERVICES.find((s) => s.id === id) ?? SERVICES[1];
}

export function isServiceId(value: string): value is ServiceId {
  return SERVICES.some((s) => s.id === value);
}

/** Google Maps link built from the address text only. */
export function mapsDirectionsUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Keyless embed of the address search. Swappable for a Places embed later. */
export function mapsEmbedUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function waLink(international: string, message?: string) {
  const base = `https://wa.me/${international.replace(/[^0-9]/g, '')}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
