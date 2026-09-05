import React from 'react'

type DoctorDashboardProps = {
  todayAppointments: Array<{
    id: string
    patient: string
    time: string
    service: string
    status: 'booked' | 'confirmed' | 'arrived' | 'in-consultation' | 'completed' | 'cancelled' | 'no-show'
  }>
  currentPatient?: { id: string; name: string }
  onStart: (id: string) => void
  onComplete: (id: string) => void
  onDelay: (id: string, minutes: number) => void
  onEmergency: (id: string) => void
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  todayAppointments,
  currentPatient,
  onStart,
  onComplete,
  onDelay,
  onEmergency,
}) => {
  const statusCounts = {
    booked: 0,
    confirmed: 0,
    arrived: 0,
    'in-consultation': 0,
    completed: 0,
    cancelled: 0,
    'no-show': 0,
  }

  todayAppointments.forEach((apt) => {
    if (statusCounts[apt.status] !== undefined) {
      statusCounts[apt.status as keyof typeof statusCounts]++
    }
  })

  return React.createElement(
    'div',
    { className: 'space-y-6' },
    React.createElement(
      'header',
      { className: 'bg-white border-rounded border-border p-6' },
      React.createElement(
        'h2',
        { className: 'text-xl font-bold text-navy' },
        "Tableau de bord du Dr"
      ),
      React.createElement('p', { className: 'text-gray-500' }, "DR M. KATTOU")
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-2 gap-4' },
      // Completed
      React.createElement(
        'div',
        { className: 'bg-white border-rounded border-border p-6' },
        React.createElement('h3', { className: 'text-sm text-gray-500 mb-2' }, 'Terminés'),
        React.createElement('p', { className: 'text-3xl font-bold text-green-600' }, statusCounts.completed)
      ),
      // Cancelled
      React.createElement(
        'div',
        { className: 'bg-white border-rounded border-border p-6' },
        React.createElement('h3', { className: 'text-sm text-gray-500 mb-2' }, 'Annulés'),
        React.createElement('p', { className: 'text-3xl font-bold text-red-500' }, statusCounts.cancelled)
      )
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-2 gap-4' },
      // Booked
      React.createElement(
        'div',
        { className: 'bg-white border-rounded border-border p-6' },
        React.createElement('h3', { className: 'text-sm text-gray-500 mb-2' }, 'Réservés'),
        React.createElement('p', { className: 'text-3xl font-bold text-navy' }, statusCounts.booked)
      ),
      // Today
      React.createElement(
        'div',
        { className: 'bg-white border-rounded border-border p-6' },
        React.createElement('h3', { className: 'text-sm text-gray-500 mb-2' }, 'Aujourd\'hui'),
        React.createElement('p', { className: 'text-3xl font-bold text-navy' }, todayAppointments.length)
      )
    ),
    // Current Patient
    currentPatient && React.createElement(
      'div',
      { className: 'bg-white border-rounded border-border p-6' },
      React.createElement(
        'h3',
        { className: 'text-xl font-bold text-navy mb-3' },
        'Patient actuel'
      ),
      React.createElement(
        'div',
        { className: 'flex items-start gap-4' },
        React.createElement(StatusBadge, {
          status: 'In Consultation',
        }),
        React.createElement(
          'div',
          { className: 'flex-1' },
          React.createElement('p', { className: 'font-medium' }, currentPatient.name),
          React.createElement('p', { className: 'text-sm text-gray-500' }, `#${currentPatient.id}`)
        )
      )
    ),
    // Actions
    React.createElement(
      'div',
      { className: 'grid grid-cols-2 gap-3 pt-6' },
      React.createElement(
        'button',
        {
          onClick: () => onStart(''),
          className: 'btn btn-primary w-full',
        },
        'Commencer')
      ),
      React.createElement(
        'button',
        {
          onClick: () => onComplete(''),
          className: 'btn btn-outline w-full',
        },
        'Terminer')
      )
    )
  )
}