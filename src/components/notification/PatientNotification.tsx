import React from 'react'

type Notification = {
  id: number
  message: string
  type: 'info' | 'warning' | 'success'
}

export const PatientNotification: React.FC<{
  notifications: Notification[]
  onClose: (id: number) => void
}> = ({
  notifications,
  onClose,
}) => {
  return React.createElement(
    'div',
    { className: 'space-y-3' },
    notifications.map((notif) =>
      React.createElement(
        'div',
        {
          key: notif.id,
          className: `p-4 rounded-xl flex items-start gap-3 ${
            notif.type === 'success'
              ? 'bg-green-50 border-green-200'
              : notif.type === 'warning'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-blue-50 border-blue-200'
          }`,
        },
        React.createElement('span', {
          className: `w-8 h-8 rounded-full flex-shrink-0 ${
            notif.type === 'success'
              ? 'bg-green-500'
              : notif.type === 'warning'
                ? 'bg-amber-500'
                : 'bg-blue-500'
          } flex-none`,
        }),
        React.createElement(
          'div',
          { className: 'flex-1 min-w-0' },
          React.createElement(
            'p',
            { className: 'font-medium text-body' },
            notif.message
          )
        ),
        React.createElement(
          'button',
          {
            onClick: () => onClose(notif.id),
            className: 'text-gray-400 hover:text-gray-600',
          },
          '×'
        )
      )
    )
  )
}