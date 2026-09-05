import React from 'react'

type Language = {
  code: string
  name: string
  nativeName: string
}

const languages: Language[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'en', name: 'English', nativeName: 'English' },
]

export const LanguageSwitcher: React.FC = () => {
  return React.createElement(
    'div',
    { className: 'flex items-center gap-2' },
    languages.map((lang) =>
      React.createElement(
        'button',
        {
          key: lang.code,
          className: 'px-3 py-1 rounded text-sm border border-gray-300 hover:border-navy transition-colors ${
            lang.code === 'ar' ? 'border-navy text-navy' : ''
          }',
        },
        lang.nativeName
      )
    )
  )
}