import React from 'react'
import Button from './Button'

const SuccessScreen = ({
  icon = '✓',
  title = 'Success!',
  message,
  onDone,
  buttonText = 'Done',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] px-6 ${className}`}>
      <div className="w-24 h-24 rounded-full bg-brand-success flex items-center justify-center mb-6">
        <span className="text-5xl text-white font-bold">{icon}</span>
      </div>
      
      <h2 className="text-2xl font-bold text-brand-dark mb-3">{title}</h2>
      
      {message && (
        <p className="text-gray-600 text-center mb-8 max-w-md">{message}</p>
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

