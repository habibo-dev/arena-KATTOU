import React, { useState } from 'react'
import { Navigation } from './components/layout/Navigation'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ServiceCard } from './components/shared/ServiceCard'
import { ServiceSelection } from './components/appointment/ServiceSelection'
import { DateSelection } from './components/appointment/DateSelection'
import { PatientInfo } from './components/appointment/PatientInfo'
import { Confirmation } from './components/appointment/Confirmation'
import { LiveQueue } from './components/patient/LiveQueue'
import { RemoteWaiting } from './components/patient/RemoteWaiting'
import { ReceptionDashboard } from './components/reception/ReceptionDashboard'
import { DoctorDashboard } from './components/doctor/DoctorDashboard'
import { ETAComponent } from './components/shared/ETAComponent'
import { WalkInPatient } from './components/reception/WalkInPatient'
import { EmergencyPatient } from './components/representation/EmergencyPatient'
import { PatientNotification } from './components/notification/PatientNotification'
import { LanguageSwitcher } from './components/shared/LanguageSwitcher'
import { StatusBadge } from './components/shared/StatusBadge'
import { QueueItem } from './components/shared/QueueItem'

const SERVICES = [
  { id: 'odf', name: 'ODF', arName: 'ODF', frName: 'Soins' },
  { id: 'soins', name: 'Soins', arName: 'Soins', frName: 'Soins' },
  { id: 'protesse', name: 'Prothèses', arName: 'Prothèses', frName: 'Prothèses' },
  { id: 'extractions', name: 'Extractions', arName: 'Extractions', frName: 'Extractions' },
  { id: 'radio', name: 'Radio', arName: 'Radio', frName: 'Radio' },
  { id: 'blanchiment', name: 'Blanchiment', arName: 'Blanchiment', frName: 'Blanchiment' },
  { id: 'petite-chirurgie', name: 'Petite Chirurgie', arName: 'Petite Chirurgie', frName: 'Petite Chirurgie' },
]

export const App: React.FC = () => {
  const [section, setSection] = useState<'home' | 'appointment' | 'queue' 'staff'>('home')
  const [language, setLanguage] = useState<'ar' | 'fr' | 'en'>('ar')
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [patientName, setPatientName] = useState<string>('')
  const [patientPhone, setPatientPhone] = useState<string>('')
  const [currentPatient, setCurrentPatient] = useState({ id: '', name: '' })
  const [queueState, setQueueState] = useState({
    patientsBefore: 0,
    estimatedWait: 0,
    endRange: '',
  })
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string }>>([])

  const callNext = () => {
    // Simple queue advance logic
    const newPatientsBefore = Math.max(0, queueState.patientsBefore - 1)
    const newEstimatedWait = newPatientsBefore * 20 + (newPatientsBefore > 0 ? 15 : 0)
    setQueueState({
      patientsBefore: newPatientsBefore,
      estimatedWait: newEstimatedWait,
      endRange: '10:50 – 11:15',
    })
    setNotifications((prev) => [
      ...prev,
      {
        id: notifications.length + 1,
        message: `Il reste ${newPatientsBefore} patients avant vous.`,
      },
    ])
  }

  const addDelay = () => {
    setQueueState((prev) => ({
      ...prev,
      estimatedWait: prev.estimatedWait + 20,
    }))
    setNotifications((prev) => [
      ...prev,
      { id: notifications.length + 1, message: 'Le médecin est en retard de 20 min.' },
    ])
  }

  const addEmergency = () => {
    setCurrentPatient({ id: '#0', name: 'Urgence' })
    setQueueState((prev) => ({
      ...prev,
      estimatedWait: prev.estimatedWait + 10,
    }))
    setNotifications((prev) => [
      ...prev,
      { id: notifications.length + 1, message: 'Nouvelle urgence ajoutée à la file.' },
    ])
  }

  const toggleDemoMode = () => setShowDemoControls((prev) => !prev)

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50 text-navy' },
    // Language switcher
    React.createElement(LanguageSwitcher, {
      language,
      onSelect: setLanguage,
    }),
    // Header/hero section based on section
    section === 'home' && React.createElement(
      'main',
      { className: 'py-8' },
      React.createElement(Header, {
        title: 'DR M. KATTOU',
        subtitle: 'رعاية أسنان تبدأ من وقتك.',
        showBack: false,
      }),
      React.createElement(
        'section',
        { className: 'max-w-7xl mx-auto px-6 mb-12' },
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center' },
          React.createElement(
            'div',
            { className: 'text-lg' },
            React.createElement('h1', {
              className: 'text-5xl md:text-6xl font-bold text-navy mb-6',
            }, 'رعاية أسنان تبدأ من وقتك.'),
            React.createElement('p', {
              className: 'text-gray-600 text-lg mb-6',
            }, 'احجز موعدك، وتتبع دورك بسهولة، واعرف متى يحين وقتك.'),
            React.createElement(
              'div',
              { className: 'gap-4' },
              React.createElement(
                'button',
                {
                  className: 'btn btn-primary px-6 py-3 rounded-xl',
                  onClick: () => setSection('appointment'),
                },
                'احجز موعدًا')
              ),
              React.createElement(
                'button',
                {
                  className: 'btn btn-outline px-6 py-3 rounded-xl',
                  onClick: () => setSection('queue'),
                },
                'عرض الملف')
              )
          ),
          React.createElement(
            'div',
            { className: 'relative' },
            React.createElement('svg', {
              className: 'absolute -top-2 -right-2 w-24 h-24 opacity-5',
              fill: 'none',
              stroke: 'currentColor',
              'viewBox': '0 0 24 24',
              'stroke-width': '2',
            },
              React.createElement('path', {
                d: 'M12 1v4M12 15v4M4.93 4.93l2.83 2.83m2.17 5.66l2.83 2.83m5.66 2.17l2.83 2.83m2.17-5.66l2.83 2.83M15 12v4m-4-4v4M4.93 19.07l2.83-2.83m2.17-5.66l2.83-2.83m5.66-2.17l2.83-2.83m2.17 5.66l2.83-2.83',
                stroke: 'currentColor',
              })
            )
          )
        )
      ),
      React.createElement(
        'section',
        { id: 'services', className: 'max-w-7xl mx-auto px-6 py-12' },
        React.createElement(
          'h2',
          { className: 'text-3xl font-bold text-navy text-center mb-8' },
          'Nos services'
        ),
        React.createElement(
          'div',
          { className: 'grid grid-cols-2 gap-4' },
          ...SERVICES.map((service) =>
            React.createElement(ServiceCard, {
              key: service.id,
              id: service.id,
              name: service.name,
              arName: service.arName,
              frName: service.frName,
              description: '',
            })
          )
        )
      )
    ),
    section === 'appointment' && React.createElement(
      'main',
      { className: 'py-8' },
      React.createElement(Header, {
        title: 'Prendre rendez-vous',
        subtitle: 'Sélectionnez votre service et votre créneau',
        showBack: true,
      }),
      React.createElement(ServiceSelection, {
        selectedService,
        onSelect: setSelectedService,
        step: 1,
      }),
      selectedService && React.createElement(DateSelection, {
        selectedDate,
        onSelect: setSelectedDate,
        step: 2,
      }),
      selectedService && selectedDate && React.createElement(PatientInfo, {
        patientName,
        patientPhone,
        onNameChange: setPatientName,
        onPhoneChange: setPatientPhone,
      }),
      selectedService && selectedDate && patientName && patientPhone && React.createElement(Confirmation, {
        appointment: {
          doctor: 'DR M. KATTOU',
          day: selectedDate,
          time: '10:00',
          service: selectedService,
          queueNumber: '#21',
        },
      })
    ),
    section === 'queue' && React.createElement(
      'main',
      { className: 'py-8' },
      React.createElement(Header, {
        title: 'Votre file d\'attente',
        subtitle: 'Suivez votre position en temps réel',
        showBack: true,
      }),
      React.createElement(LiveQueue, {
        currentPatient: currentPatient.id,
        patientsBefore: queueState.patientsBefore,
        estimatedWait: queueState.estimatedWait,
        endTimeRange: queueState.endRange,
      }),
      React.createElement(RemoteWaiting, null),
      React.createElement(
        'div',
        { className: 'mt-8 pt-8 border-t border-border' },
        React.createElement(
          'h3',
          { className: 'text-sm text-gray-500 mb-4' },
          'Mode démonstration'
        ),
        React.createElement(
          'div',
          { className: 'grid grid-cols-2 gap-2' },
          React.createElement(
            'button',
            {
              onClick: callNext,
              className: 'btn btn-sm btn-outline',
            },
            'Appeler suivant')
          ),
          React.createElement(
            'button',
            {
              onClick: addDelay,
              className: 'btn btn-sm btn-outline',
            },
            'Retard 20 min')
          )
        )
      ),
    ),
    section === 'staff' && React.createElement(
      'main',
      { className: 'py-8' },
      React.createElement(Header, {
        title: 'Tableau de bord',
        subtitle: "Tableau de bord du Dr M. KATTOU",
        showBack: true,
      }),
      React.createElement(ReceptionDashboard, {
        currentPatient: currentPatient,
        queue: [
          { id: '#18', name: 'Mohamed', status: 'en-consultation' },
          { id: '#19', name: 'Sara', status: 'en-attente' },
          { id: '#20', name: 'Ahmed', status: 'en-attente' },
          { id: '#21', name: 'Ali', status: 'en-attente' },
        ],
        onCallNext: callNext,
        onComplete: (id) => {
          setCurrentPatient({ id, name: '' })
          setNotifications((prev) =>
            prev.filter((n) => n.id !== prev.length + 1)
          )
        },
        onDelay: addDelay,
        onEmergency: addEmergency,
      }),
      React.createElement(ETAComponent, null),
      React.createElement(WalkInPatient, {
        onAdd: (patient) => {
          setNotifications((prev) =>
            prev.concat([
              { id: notifications.length + 1, message: `Nouveau patient ${patient.name} ajouté.` },
            ])
          )
        },
      })
    ),
    // Demo mode overlay removed for production
    Footer
  )
}