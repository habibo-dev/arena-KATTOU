import React from 'react'

type ConfirmationProps = {
  appointment: {
    doctor: string
    day: string
    time: string
    service: string
    queueNumber: string
  }
}

export const Confirmation: React.FC<ConfirmationProps> = ({
  appointment,
}) => {
  return React.createElement(
    'div',
    { className: 'space-y-6' },
    React.createElement(
      'div',
      { className: 'bg-white border-rounded border-border p-8 text-center' },
      React.createElement('div', {
        className: 'w-20 h-20 rounded-full bg-navy mx-auto mb-6 flex items-center justify-center',
      }),
      React.createElement('h2', {
        className: 'text-3xl font-bold text-navy mb-4',
      }, 'Votre rendez-vous est confirmé'),
      React.createElement('p', { className: 'text-gray-600 mb-6' }, 'Merci de votre confiance.'),
      React.createElement(
        'div',
        { className: 'grid grid-cols-2 gap-4 mx-auto' },
        React.createElement(
          'div',
          { className: 'text-left' },
          React.createElement('p', { className: 'text-sm text-gray-500' }, 'Médecin'),
          React.createElement('p', { className: 'font-medium' }, appointment.doctor)
        ),
        React.createElement(
          'div',
          { className: 'text-left' },
          React.createElement('p', { className: 'text-sm text-gray-500' }, 'Date'),
          React.createElement('p', { className: 'font-medium' }, appointment.day)
        ),
        React.createElement(
          'div',
          { className: 'text-left' },
          React.createElement('p', { className: 'text-sm text-gray-500' }, 'Heure'),
          React.createElement('p', { className: 'font-medium' }, appointment.time)
        ),
        React.createElement(
          'div',
          { className: 'text-left' },
          React.createElement('p', { className: 'text-sm text-gray-500' }, 'Num. dossier'),
          React.createElement('p', { className: 'font-medium' }, `#${appointment.queueNumber}`)
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'pt-8 border-t border-border' },
      React.createElement(
        'p',
        { className: 'text-sm text-gray-500' },
        'Veuillez arriver 10 minutes avant l\'heure de votre rendez-vous.'
      )
    )
  )
}