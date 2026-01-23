import React from 'react'

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
  const baseClasses = 'font-medium rounded-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow'
  
  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-brand-action',
    secondary: 'bg-brand-secondary text-white hover:bg-brand-soft',
    outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-surfaceMuted',
    ghost: 'text-brand-primary hover:bg-brand-surfaceMuted',
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button


