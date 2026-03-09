import React from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t, i18n } = useTranslation()
  const statusColors = THEME_COLORS.status
  const resolvedTitle = typeof title === 'string' && i18n.exists(title) ? t(title) : title
  const resolvedMessage =
    typeof message === 'string' && i18n.exists(message) ? t(message) : message
  const resolvedButtonText =
    typeof buttonText === 'string' && i18n.exists(buttonText) ? t(buttonText) : buttonText

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] px-6 ${className}`}>
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: statusColors.successBackground }}>
        <span className="text-5xl font-bold" style={{ color: statusColors.successText }}>{icon}</span>
      </div>

      <h2 className="text-2xl font-bold mb-3" style={{ color: statusColors.successText }}>{resolvedTitle}</h2>

      {resolvedMessage && (
        <p className="text-center mb-8 max-w-md" style={{ color: statusColors.pendingText }}>{resolvedMessage}</p>
      )}

      {onDone && (
        <Button onClick={onDone} fullWidth className="max-w-xs">
          {resolvedButtonText}
        </Button>
      )}
    </div>
  )
}

export default SuccessScreen
