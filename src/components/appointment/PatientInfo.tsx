import React from 'react'

type PatientInfoProps = {
  patientName: string
  patientPhone: string
  onNameChange: (name: string) => void
  onPhoneChange: (phone: string) => void
}

export const PatientInfo: React.FC<PatientInfoProps> = ({
  patientName,
  patientPhone,
  onNameChange,
  onPhoneChange,
}) => {
  return React.createElement(
    'div',
    { className: 'space-y-4' },
    React.createElement(
      'h2',
      { className: 'text-2xl font-bold text-navy mb-6' },
      'Informations du patient')
    ),
    React.createElement('div', {
      className: 'grid grid-cols-2 gap-4',
    }, [
      React.createElement('input', {
        type: 'text',
        placeholder: 'Nom complet',
        value: patientName,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          onNameChange(e.target.value),
        className: 'w-full border-rounded border border-gray-300 px-4 py-3 rounded-xl text-body placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy',
      }),
      React.createElement('input', {
        type: 'tel',
        placeholder: 'Téléphone',
        value: patientPhone,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          onPhoneChange(e.target.value),
        className: 'w-full border-rounded border border-gray-300 px-4 py-3 rounded-xl text-body placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy',
      }),
    ])
  )
}