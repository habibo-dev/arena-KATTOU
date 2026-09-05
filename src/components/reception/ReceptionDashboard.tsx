import React from 'react'
import { StatusBadge } from '../shared/StatusBadge'

type ReceptionDashboardProps = {
  currentPatient?: { id: string; name: string; status: string }
  queue: Array<{ id: string; name: string; status: string }>
  onCallNext: () => void
  onComplete: (id: string) => void
  onDelay: (id: string, minutes: number) => void
  onEmergency: (id: string) => void
}

export const ReceptionDashboard: React.FC<ReceptionDashboardProps> = ({
  currentPatient,
  queue,
  onCallNext,
  onComplete,
  onDelay,
  onEmergency,
}) => {
  return React.createElement(
    'div',
    { className: 'space-y-6' },
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 gap-6' },
      // Current Patient
      React.createElement(
        'div',
        { className: 'bg-white border-rounded border-border p-6' },
        React.createElement(
          'h2',
          { className: 'text-xl font-bold text-navy mb-4' },
          'Patient en consultation')
        ),
        currentPatient && React.createElement(
          'div',
          { className: 'flex items-start gap-4' },
          React.createElement(StatusBadge, {
            status: currentPatient.status,
          }),
          React.createElement(
            'div',
            { className: 'flex-1' },
            React.createElement('p', { className: 'font-medium' }, currentPatient.name),
            React.createElement('p', { className: 'text-sm text-gray-500' }, `#${currentPatient.id}`)
          )
        )
      ),
      // Queue List
      React.createElement(
        'div',
        { className: 'bg-white border-rounded border-border p-6' },
        React.createElement(
          'h2',
          { className: 'text-xl font-bold text-navy mb-4' },
          'File d\'attente')
        ),
        React.createElement(
          'div',
          { className: 'space-y-3' },
          queue.map((patient) => React.createElement(
            'div',
            {
              key: patient.id,
              className: 'flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-navy/5 transition-colors',
            },
            React.createElement('span', {
              className: 'w-10 h-10 rounded-md flex items-center justify-center font-medium',
            }, `#${patient.id}`),
            React.createElement(
              'div',
              { className: 'flex-1' },
              React.createElement('p', { className: 'font-medium' }, patient.name),
              React.createElement('p', { className: 'text-xs text-gray-500' }, patient.status)
            ),
            patient.status === 'waiting' && React.createElement(
              'span',
              { className: 'text-xs px-2 py-1 rounded bg-yellow/10 text-yellow-500' },
              'En attente')
          ))
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-2 gap-4 pt-6' },
      React.createElement(
        'button',
        {
          onClick: onCallNext,
          className: 'btn btn-primary w-full',
        },
        'Appeler le suivant'
      ),
      React.createElement(
        'button',
        {
          onClick: () => onComplete(currentPatient?.id || ''),
          className: 'btn btn-outline w-full',
        },
        'Terminé'
      )
    )
  )
}