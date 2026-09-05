import React from 'react'

type ServiceCardProps = {
  id: string
  name: string
  arName?: string
  frName?: string
  description?: string
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  name,
  arName,
  frName,
  description,
}) => {
  const nameToShow = arName || frName || name

  return React.createElement(
    'div',
    {
      className: `bg-white border-rounded border border-border p-5 hover:border-navy transition-colors cursor-pointer`,
      'data-service': id,
    },
    React.createElement('div', {
      className: 'w-12 h-12 rounded-md bg-navy flex items-center justify-center mb-4',
    }),
    React.createElement(
      'h3',
      { className: 'text-xl font-medium text-navy mb-1' },
      nameToShow || name
    ),
    description && React.createElement('p', {
      className: 'text-gray-500 text-sm',
      dangerouslySetInnerHTML: { __html: description },
    })
  )
}