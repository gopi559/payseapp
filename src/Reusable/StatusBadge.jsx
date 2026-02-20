import React from 'react'
import THEME_COLORS from '../theme/colors'

const StatusBadge = ({ status, className = '' }) => {
  const statusColors = THEME_COLORS.status

  const statusConfig = {
    completed: {
      label: 'Completed',
      bg: statusColors.successBackground,
      text: statusColors.successText,
    },
    pending: {
      label: 'Pending',
      bg: statusColors.pendingBackground,
      text: statusColors.pendingText,
    },
    failed: {
      label: 'Failed',
      bg: statusColors.failedBackground,
      text: statusColors.failedText,
    },
    processing: {
      label: 'Processing',
      bg: statusColors.infoBackground,
      text: statusColors.infoText,
    },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  )
}

export default StatusBadge
