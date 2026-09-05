import React from 'react'
import { SERVICES } from '../utils/constants'

type ServiceSelectionProps = {
  selectedService: string
  onSelect: (service: string) => void
  step: number
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  selectedService,
  onSelect,
  step,
}) => {
  return React.createElement(
    'div',
    { className: 'space-y-4' },
    React.createElement(
      'h2',
      { className: 'text-2xl font-bold text-navy mb-6' },
      step === 1
        ? 'Choisir un service'
        : 'Modifier le service'
    ),
    SERVICES.map((service) => {
      const isSelected = service.id === selectedService
      return React.createElement(
        'div',
        {
          key: service.id,
          className: `group bg-white border-rounded border ${
            isSelected ? 'border-navy' : 'border-border'
          } p-4 hover:border-navy transition-colors cursor-pointer ${
            isSelected ? 'ring-2 ring-navy/20' : ''
          }`,
          onClick: () => onSelect(service.id),
        },
        React.createElement('div', {
          className: 'w-10 h-10 rounded-md bg-navy/10 flex items-center justify-center mb-3',
        }),
        React.createElement(
          'h3',
          { className: 'text-base font-medium text-navy' },
          service.name
        ),
        service.frName && React.createElement('p', {
          className: 'text-xs text-gray-500',
          dangerouslySetInnerHTML: { __html: `Soins ${service.frName}` },
        })
      )
    })
  )
}