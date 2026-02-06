import React from 'react'

const MobileInput = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  className = '',
  prefix = '+93',
  ...props
}) => {
  const handleChange = (e) => {
    const inputValue = e.target.value
    // Remove any non-digit characters
    const digitsOnly = inputValue.replace(/\D/g, '')
    
    // Call onChange with prefix + digits
    if (onChange) {
      const fullValue = prefix + digitsOnly
      onChange({
        ...e,
        target: {
          ...e.target,
          value: fullValue
        }
      })
    }
  }

  // Extract digits after prefix for display
  let displayValue = ''
  if (value) {
    if (value.startsWith(prefix)) {
      displayValue = value.slice(prefix.length)
    } else {
      // If value doesn't start with prefix, extract digits only
      displayValue = value.replace(/^\+\d+/, '').replace(/\D/g, '')
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-700 pointer-events-none">
          {prefix}
        </div>
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder || 'e.g. 998877665'}
          disabled={disabled}
          className={`
            w-full pl-12 pr-3 py-2 rounded-md border text-sm
            ${error ? 'border-red-400' : 'border-gray-300'}
            focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200
            bg-white transition-colors
            ${className}
          `}
          maxLength={12}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default MobileInput

