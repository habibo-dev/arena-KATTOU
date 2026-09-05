import React from 'react'

export const Header: React.FC = ({
  title,
  subtitle,
  showBack = false,
}: {
  title: string
  subtitle?: string
  showBack?: boolean
}) => {
  return React.createElement(
    'header',
    {
      className: 'bg-white border-b border-border px-6 py-8 md:py-12',
    },
    React.createElement(
      'div',
      { className: 'max-w-7xl mx-auto text-center' },
      React.createElement('h1', {
        className: 'text-4xl md:text-5xl font-bold text-navy mb-3',
      }, title),
      subtitle && React.createElement('p', {
        className: 'text-gray-600 text-lg mb-6 max-w-2xl mx-auto',
      }, subtitle),
      showBack && React.createElement(
        'a',
        {
          href: '#',
          className: 'inline-flex items-center gap-2 text-gray-500 hover:text-navy transition-colors',
        },
        'Retour'
      )
    )
  )
}