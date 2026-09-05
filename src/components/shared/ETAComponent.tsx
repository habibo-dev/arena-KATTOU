import React from 'react'

type ETAConfig = {
  averageConsultation: number
  patientsBefore: number
  estimatedRemaining: number
}

export const ETAComponent: React.FC<ETAConfig> = ({
  averageConsultation = 20,
  patientsBefore = 3,
  estimatedRemaining = 15,
}) => {
  const totalEstimated = patientsBefore * averageConsultation + estimatedRemaining
  const startMin = Math.floor(totalEstimated / 60)
  const startSec = totalEstimated % 60
  const endMin = startMin + Math.ceil(averageConsultation / 60)
  const endSec = averageConsultation % 60

  const startTime = `${startMin.toString().padStart(2, '0')}:${startSec
    .toString()
    .padStart(2, '0')}`
  const endTime = `${endMin.toString().padStart(2, '0')}:${endSec
    .toString()
    .padStart(2, '0')}`

  const rangeLabel =
    patientsBefore > 0
      ? `${startTime} – ${endTime}`
      : `Estimé autour de ${startTime}`

  return React.createElement(
    'div',
    { className: 'bg-white border-rounded border-border p-6' },
    React.createElement(
      'h2',
      { className: 'text-xl font-bold text-navy mb-4' },
      'Temps d\'attente estimé'
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-2 gap-4 mb-6' },
      React.createElement(
        'div',
        { className: 'text-center' },
        React.createElement('p', { className: 'text-sm text-gray-500' }, 'Moyenne par consultation'),
        React.createElement('p', { className: 'text-3xl font-bold' }, `${averageConsultation} min`)
      ),
      React.createElement(
        'div',
        { className: 'text-center' },
        React.createElement('p', { className: 'text-sm text-gray-500' }, 'Patients devant'),
        React.createElement('p', { className: 'text-3xl font-bold' }, patientsBefore)
      )
    ),
    React.createElement(
      'div',
      { className: 'pt-4 border-t border-border' },
      React.createElement(
        'p',
        { className: 'text-lg font-medium' },
        `Plage estimée: ${rangeLabel}`
      ),
      React.createElement(
        'p',
        { className: 'text-sm text-gray-500 mt-2 block' },
        'Le temps peut varier selon la durée des cas en cours.'
      )
    )
  )
}