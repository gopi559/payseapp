import React, { useState } from 'react'
import THEME_COLORS from '../theme/colors'

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const buttonColors = THEME_COLORS.button

  const baseClasses =
    'font-medium rounded-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow'

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  const resolveBackground = () => {
    if (disabled) return buttonColors.disabled
    if (variant === 'secondary') return buttonColors.secondary
    if (isHovered) return buttonColors.primaryHover
    return buttonColors.primary
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${baseClasses} ${sizeClasses[size]} ${widthClass} ${className}`}
      style={{
        backgroundColor: resolveBackground(),
        color: buttonColors.text,
        borderStyle: 'solid',
        borderWidth: 0,
      }}
    >
      {children}
    </button>
  )
}

export default Button
