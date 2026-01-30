import React from 'react'

const StatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    completed: {
      label: 'Completed',
      bg: 'bg-brand-success',
      text: 'text-white',
    },
    pending: {
      label: 'Pending',
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
    },
    failed: {
      label: 'Failed',
      bg: 'bg-red-100',
      text: 'text-red-800',
    },
    processing: {
      label: 'Processing',
      bg: 'bg-blue-100',
      text: 'text-blue-800',
    },
  }
  
  const config = statusConfig[status] || statusConfig.pending
  
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
    </span>
  )
}

export default StatusBadge

