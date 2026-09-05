import React from 'react'

type EmergencyPatientProps = {
  onAdd: (patient: { name: string; phone: string }) => void
  onConfirm: () => void
}

export const EmergencyPatient: React.FC<EmergencyPatientProps> = ({
  onAdd,
  onConfirm,
}) => {
  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')

  return React.createElement(
    'div',
    { className: 'bg-white border-rounded border-border p-8' },
    React.createElement(
      'h2',
      { className: 'text-xl font-bold text-red-600 mb-6' },
      'Nouvelle urgence'
    ),
    React.createElement(
      'p',
      { className: 'text-gray-600 mb-8' },
      'Cette action modifiera l\'ordre estimé de la file. Le patient urgence seraPriorité.'
    ),
    React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
      React.createElement('input', {
        type: 'text',
        placeholder: 'Nom du patient',
        value: name,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
        className: 'w-full border-rounded border border-gray-300 px-4 py-3 rounded-xl text-body placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy',
      }),
      React.createElement('input', {
        type: 'tel',
        placeholder: 'Téléphone',
        value: phone,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value),
        className: 'w-full border-rounded border border-gray-300 px-4 py-3 rounded-xl text-body placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-navy',
      })
    ]),
    React.createElement(
      'div',
      { className: 'mt-8 pt-8 border-t border-border' },
      React.createElement(
        'button',
        {
          onClick: () => {
            if (name && phone) {
              onAdd({ name, phone })
              onConfirm()
            }
          },
          className: 'btn btn-primary w-full',
        },
        'Ajouter comme urgence')
      ),
      React.createElement(
        'button',
        {
          onClick: onConfirm,
          className: 'btn btn-outline w-full mt-2',
        },
        'Annuler')
      )
    )
  )
}