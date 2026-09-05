export const SERVICES = [
  { id: 'odf', name: 'ODF', arName: 'ODF', frName: 'Soins' },
  { id: 'soins', name: 'Soins', arName: 'Soins', frName: 'Soins' },
  { id: 'prothese', name: 'Prothèses', arName: 'Prothèses', frName: 'Prothèses' },
  { id: 'extractions', name: 'Extractions', arName: 'Extractions', frName: 'Extractions' },
  { id: 'radio', name: 'Radio', arName: 'Radio', frName: 'Radio' },
  { id: 'blanchiment', name: 'Blanchiment', arName: 'Blanchiment', frName: 'Blanchiment' },
  { id: 'petite-chirurgie', name: 'Petite Chirurgie', arName: 'Petite Chirurgie', frName: 'Petite Chirurgie' },
]

export const DEMO_PATIENTS = [
  { id: '1', name: 'Ahmed Benali', phone: '0558 41 80 73', status: 'waiting' as const },
  { id: '2', name: 'Sara Mansouri', phone: '0558 41 80 74', status: 'in-consultation' as const },
  { id: '3', name: 'Mohamed Kaci', phone: '0558 41 80 75', status: 'waiting' as const },
  { id: '4', name: 'Yasmine Amara', phone: '0558 41 80 76', status: 'waiting' as const },
  { id: '5', name: 'Ali Rahmani', phone: '0558 41 80 77', status: 'waiting' as const },
]

export const CLINIC_INFO = {
  doctorName: 'DR M. KATTOU',
  title: 'Chirurgien Dentiste',
  address: 'B22 Bloc 05 N°135 Hay Salam',
  city: 'Khemis Miliana, Aïn Defla',
  phone: '0558 41 80 73',
  phoneExtra: '027 56 94 94',
  hours: 'à confirmer',
  services: [
    'ODF',
    'Soins',
    'Prothèses',
    'Extractions',
    'Radio',
    'Blanchiment',
    'Petite Chirurgie',
  ],
}

export const QUEUE_DEMO_DATA = {
  currentPatient: '#18',
  nextPatients: ['#19', '#20', '#21'],
  patientsBefore: 3,
  estimatedWait: 55,
  currentTime: '10:30',
  endRange: '10:50 – 11:15',
}

export const ETA_CONFIG = {
  averageConsultation: 20,
  patientsBefore: 3,
  estimatedRemaining: 15,
}