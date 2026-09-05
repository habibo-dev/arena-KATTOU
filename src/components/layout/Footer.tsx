import React from 'react'

export const Footer: React.FC = () => {
  return React.createElement(
    'footer',
    {
      className: 'bg-gray-50 py-12 mt-auto',
    },
    React.createElement(
      'div',
      { className: 'max-w-7xl mx-auto px-6' },
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 md:grid-cols-2 gap-8 mb-6' },
        React.createElement(
          'div',
          { className: 'text-gray-600 text-sm' },
          'DR M. KATTOU',
          React.createElement('br', null),
          'Chirurgien Dentiste'
        ),
        React.createElement(
          'div',
          { className: 'text-gray-600 text-sm' },
          'B22 Bloc 05 N°135 Hay Salam',
          React.createElement('br', null),
          'Khemis Miliana, Aïn Defla'
        )
      ),
      React.createElement(
        'div',
        { className: 'pt-t border-t border-border/20' },
        React.createElement(
          'p',
          { className: 'text-xs text-gray-500' },
          '2026 DR M. KATTOU - Tous droits réservés'
        )
      )
    )
  )
}