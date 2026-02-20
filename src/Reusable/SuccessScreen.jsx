import React from 'react'
import Button from './Button'
import THEME_COLORS from '../theme/colors'

const SuccessScreen = ({
  icon = 'V',
  title = 'Success!',
  message,
  onDone,
  buttonText = 'Done',
  className = '',
}) => {
  const statusColors = THEME_COLORS.status

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] px-6 ${className}`}>
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: statusColors.successBackground }}>
        <span className="text-5xl font-bold" style={{ color: statusColors.successText }}>{icon}</span>
      </div>

      <h2 className="text-2xl font-bold mb-3" style={{ color: statusColors.successText }}>{title}</h2>

      {message && (
        <p className="text-center mb-8 max-w-md" style={{ color: statusColors.pendingText }}>{message}</p>
      )}

      {onDone && (
        <Button onClick={onDone} fullWidth className="max-w-xs">
          {buttonText}
        </Button>
      )}
    </div>
  )
}

export default SuccessScreen
