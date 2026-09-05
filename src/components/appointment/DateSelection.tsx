import React from 'react'

type DateSelectionProps = {
  selectedDate: string
  onSelect: (date: string) => void
  step: number
  minDate?: Date
}

export const DateSelection: React.FC<DateSelectionProps> = ({
  selectedDate,
  onSelect,
  step,
  minDate,
}) => {
  const today = new Date()
  const dates = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    dates.push(d.toLocaleDateString('fr-DZ', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }))
  }

  return React.createElement(
    'div',
    { className: 'space-y-4' },
    React.createElement(
      'h2',
      { className: 'text-2xl font-bold text-navy mb-6' },
      step === 2 ? 'Choisir une date' : 'Modifier la date')
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-2 gap-3' },
      dates.map((dateStr, i) => {
        const date = new Date()
        date.setDate(today.getDate() + i)
        const isSelected = selectedDate === dateStr
        return React.createElement(
          'div',
          {
            key: i,
            className: `border-rounded border ${
              isSelected ? 'border-navy' : 'border-border'
            } p-3 text-center cursor-pointer ${
              isSelected ? 'ring-2 ring-navy/20' : ''
            } hover:bg-navy/5 transition-colors`,
            onClick: () => onSelect(dateStr),
          },
          React.createElement('p', {
            className: 'font-medium',
          }, dateStr)
        )
      })
    )
  )
}