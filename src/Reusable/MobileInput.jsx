import React from 'react'
import THEME_COLORS from '../theme/colors'

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
  const inputColors = THEME_COLORS.input
  const maxDigits = 9

  const handleChange = (e) => {
    const inputValue = e.target.value
    const digitsOnly = inputValue.replace(/\D/g, '').slice(0, maxDigits)

    if (onChange) {
      const fullValue = prefix + digitsOnly
      onChange({
        ...e,
        target: {
          ...e.target,
          value: fullValue,
        },
      })
    }
  }

  let displayValue = ''
  if (value) {
    if (value.startsWith(prefix)) {
      displayValue = value.slice(prefix.length).replace(/\D/g, '').slice(0, maxDigits)
    } else {
      displayValue = value.replace(/^\+\d+/, '').replace(/\D/g, '').slice(0, maxDigits)
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium mb-1.5" style={{ color: inputColors.text }}>
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none" style={{ color: inputColors.text }}>
          {prefix}
        </div>
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder || 'e.g. 998877665'}
          disabled={disabled}
          className={`w-full pl-12 pr-3 py-2 rounded-md border text-sm disabled:cursor-not-allowed ${className}`}
          style={{
            borderColor: inputColors.border,
            backgroundColor: inputColors.background,
            color: inputColors.text,
            opacity: disabled ? 0.7 : 1,
          }}
          maxLength={maxDigits}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm" style={{ color: inputColors.text }}>{error}</p>
      )}
    </div>
  )
}

export default MobileInput
