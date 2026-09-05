import React from 'react'

export const RemoteWaiting: React.FC = () => {
  return React.createElement(
    'div',
    { className: 'bg-white border-rounded border-border p-8 text-center' },
    React.createElement(
      'h2',
      { className: 'text-2xl font-bold text-navy mb-4' },
      'Peut-on attendre dehors ?'
    ),
    React.createElement(
      'p',
      { className: 'text-gray-600 mb-8 max-w-md mx-auto' },
      'Vous n\'êtes pas obligé de rester dans la salle d\'attente. Vous pouvez sortir de la clinique et nous vousNotifierons lorsque votre tour approche.'
    ),
    React.createElement(
      'div',
      { className: 'gap-4 pt-8 flex flex-col sm:flex-row justify-center' },
      React.createElement(
        'button',
        {
          className: 'btn btn-primary px-8 py-3 rounded-xl',
        },
        'M\'en aller temporairement'
      ),
      React.createElement(
        'button',
        {
          className: 'btn btn-outline px-8 py-3 rounded-xl',
        },
        'Rester à la clinique'
      )
    )
  )
}