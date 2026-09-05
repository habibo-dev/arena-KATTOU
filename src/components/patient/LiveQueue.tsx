import React from 'react'
import { QueueItem } from '../shared/QueueItem'
import { QueueDemoData } from '../utils/constants'

type LiveQueueProps = {
  currentPatient?: string
  patientsBefore?: number
  estimatedWait?: number
  endTimeRange?: string
}

export const LiveQueue: React.FC<LiveQueueProps> = ({
  currentPatient = QUEUE_DEMO_DATA.currentPatient,
  patientsBefore = QUEUE_DEMO_DATA.patientsBefore,
  estimatedWait = QUEUE_DEMO_DATA.estimatedWait,
  endTimeRange = QUEUE_DEMO_DATA.endTimeRange,
}) => {
  const demoPatients = QUEUE_DEMO_DATA.nextPatients

  return React.createElement(
    'div',
    { className: 'space-y-6' },
    React.createElement(
      'div',
      { className: 'bg-white border-rounded border-border p-6' },
      React.createElement(
        'h2',
        { className: 'text-2xl font-bold text-navy mb-6' },
        'Votre tour'
      ),
      React.createElement('div', {
        className: 'text-6xl font-bold text-navy mb-4',
      }, currentPatient),
      React.createElement(
        'div',
        { className: 'text-lg text-gray-500 mb-2' },
        'Patient actuel:'
      ),
      currentPatient && currentPatient !== '#0' && React.createElement(
        'div',
        { className: 'bg-gray-100 p-4 rounded-xl mb-6' },
        React.createElement('p', { className: 'text-gray-700' }, '#18 En consultation')
      ),
      React.createElement(
        'div',
        { className: 'grid grid-cols-3 gap-4' },
        demoPatients.map((patientId, i) => {
          const isCurrent = patientId === currentPatient.replace('#', '')
          const status = isCurrent ? 'Current' : 'Waiting'
          return React.createElement(QueueItem, {
            key: patientId,
            patientId,
            patientName: isCurrent ? 'Mohamed' : undefined,
            status: isCurrent ? 'current' : 'waiting',
            isYou: i === 2, // Last patient is "you"
          })
        })
      )
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-2 gap-4 pt-6 border-t border-border' },
      React.createElement(
        'div',
        { className: 'text-center' },
        React.createElement('p', { className: 'text-sm text-gray-500' }, 'Patients devant'),
        React.createElement('p', { className: 'font-medium' }, patientsBefore)
      ),
      React.createElement(
        'div',
        { className: 'text-center' },
        React.createElement('p', { className: 'text-sm text-gray-500' }, 'Temps estimé'),
        React.createElement('p', { className: 'font-medium' }, `${estimatedWait} min`)
      ),
      React.createElement(
        'div',
        { className: 'text-center' },
        React.createElement('p', { className: 'text-sm text-gray-500' }, 'Jusqu\'à'),
        React.createElement('p', { className: 'font-medium' }, endTimeRange)
      )
    )
  )
}