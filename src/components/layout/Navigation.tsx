import React from 'react'

type NavItem = {
  label: string
  href: string
  icon?: string
}

export const Navigation: React.FC = () => {
  const navItems: NavItem[] = [
    { label: 'Accueil', href: '#' },
    { label: 'Services', href: '#services' },
    { label: 'À propos', href: '#about' },
    { label: 'Contact', href: '#contact' },
    { label: 'Prendre rendez-vous', href: '#booking' },
  ]

  return React.createElement(
    'nav',
    {
      className: 'bg-white/80 backdrop-blur-md border-b border-border rounded-xl px-6 py-3',
    },
    React.createElement(
      'div',
      { className: 'max-w-7xl mx-auto flex items-center justify-between' },
      React.createElement(
        'div',
        { className: 'flex items-center gap-8' },
        navItems.map((item, index) =>
          React.createElement(
            'a',
            {
              key: index,
              href: item.href,
              className: 'text-gray-700 hover:text-navy transition-colors text-sm',
            },
            item.label
          )
        )
      ),
      React.createElement(
        'a',
        {
          href: '#',
          className: 'btn btn-primary text-sm',
        },
        'Prendre rendez-vous'
      )
    )
  )
}