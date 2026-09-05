import React from 'react'

type WalkInProps = {
  onAdd: (patient: { name: string; phone: string; type: string }) => void
}

export const WalkInPatient: React.FC<WalkInProps> = ({
  onAdd,
}) => {
  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [type, setType] = React.useState<'appointment' | 'walk-in' | 'emergency'>(
    'walk-in'
  )

  return React.createElement(
    'div',
    { className: 'bg-white border-rounded border-border p-6' },
    React.createElement(
      'h2',
      { className: 'text-xl font-bold text-navy mb-6' },
      '+ Ajouter un patient')
    ),
    React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
      React.createElement('input', {
        type: 'text',
        placeholder: 'Nom',
        value: name,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
        className: 'w-full border-rounded border border-gray-300 px-4 py-3 rounded-xl text-body placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy',
      }),
      React.createElement('input', {
        type: 'tel',
        placeholder: 'Téléphone',
        value: phone,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value),
        className: 'w-full border-rounded border border-gray-300 px-4 py-3 rounded-xl text-body placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy',
      })
    ]),
    React.createElement(
      'div',
      { className: 'mt-4' },
      React.createElement(
        'select',
        {
          value: type,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
            setType(e.target.value as any),
          className: 'w-full border-rounded border border-gray-300 px-4 py-3 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-navy',
        },
        React.createElement('option', { value: 'appointment' }, 'Rendez-vous'),
        React.createElement('option', { value: 'walk-in' }, 'Patient marche'),
        React.createElement('option', { value: 'emergency' }, 'Urgence')
      )
    ),
    React.createElement(
      'div',
      { className: 'mt-6 pt-6 border-t border-border' },
      React.createElement(
        'button',
        {
          onClick: () => onAdd({ name, phone, type }),
          className: 'btn btn-primary w-full',
        },
        'Ajouter au système')
      )
    )
  )
}