import React from 'react'

type QueueItemProps = {
  patientId: string
  patientName?: string
  status: 'current' | 'waiting' | 'completed'
  isYou?: boolean
}

export const QueueItem: React.FC<QueueItemProps> = ({
  patientId,
  patientName,
  status,
  isYou = false,
}) => {
  const statusStyles: Record<string, { color: string; bg: string }> = {
    current: { color: '#1a237e', bg: '#e8eaf6' },
    waiting: { color: '#6b7280', bg: '#f3f4f6' },
    completed: { color: '#6b7280', bg: '#d1fae5' },
  }

  return React.createElement(
    'div',
    {
      className: `flex items-center gap-3 px-4 py-3 rounded-xl ${
        isYou ? 'bg-navy text-white' : `bg-${statusStyles[status].bg} text-${statusStyles[status].color}`
      } ${status === 'current' ? 'font-medium' : ''}`,
    },
    React.createElement('span', { className: 'font-semibold' }, patientId),
    patientName ? React.createElement('span', { className: 'text-sm' }, patientName) : null,
    React.createElement('span', { className: 'ml-auto' }, status)
  )
}