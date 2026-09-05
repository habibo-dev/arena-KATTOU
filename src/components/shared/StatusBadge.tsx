import React from 'react'

type StatusBadgeProps = {
  status: 'Booked' | 'Confirmed' | 'Arrived' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled' | 'No-show' | 'Skipped' | 'Emergency'
  size?: 'sm' | 'md' | 'lg'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const colors: Record<string, string> = {
    Booked: '#6b7280',
    Confirmed: '#3b82f6',
    Arrived: '#10b981',
    Waiting: '#f59e0b',
    'In Consultation': '#8b5cf6',
    Completed: '#10b981',
    Cancelled: '#ef4444',
    'No-show': '#6b7280',
    Skipped: '#f59e0b',
    Emergency: '#dc2626',
  }
  const bgColors: Record<string, string> = {
    Booked: '#e5e7eb',
    Confirmed: '#bfdbfe',
    Arrived: '#d1fae5',
    Waiting: '#fef3c7',
    'In Consultation': '#e9d8fd',
    Completed: '#d1fae5',
    Cancelled: ' #fee2e2',
    'No-show': '#e5e7eb',
    Skipped: '#fef3c7',
    Emergency: 'fee2e2',
  }
  const fontColors: Record<string, string> = {
    Booked: '#374151',
    Confirmed: '#1e40af',
    Arrived: '#059669',
    Waiting: '#d97706',
    'In Consultation': '#6d28d9',
    Completed: '#059669',
    Cancelled: '#dc2626',
    'No-show': '#374151',
    Skipped: '#d97706',
    Emergency: '#b91c1c',
  }

  const sizeStyles: Record<string, { padding: string; fontSize: string }> = {
    sm: { padding: '0.5rem 0.75rem', fontSize: '0.75rem' },
    md: { padding: '0.75rem 1rem', fontSize: '0.875rem' },
    lg: { padding: '1rem 1.25rem', fontSize: '1rem' },
  }

  return React.createElement(
    'span',
    {
      className: `inline-flex items-center px-${size === 'sm' ? '2' : size === 'md' ? '3' : '4'} py-${size === 'sm' ? '1' : size === 'md' ? '2' : '2.5'} rounded-full text-xs font-medium text-${fontColors[status]} bg-${bgColors[status]} border border-${colors[status]}/30`,
      'data-status': status,
    },
    status
  )
}