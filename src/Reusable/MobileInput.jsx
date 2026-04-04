import React from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t, i18n } = useTranslation()
  const inputColors = THEME_COLORS.input
  const maxDigits = 9
  const resolvedLabel = typeof label === 'string' && i18n.exists(label) ? t(label) : label
  const resolvedPlaceholder =
    typeof placeholder === 'string' && i18n.exists(placeholder)
      ? t(placeholder)
      : placeholder || t('mobile_placeholder')
  const borderColor = error ? '#dc2626' : inputColors.border

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
          {resolvedLabel}
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
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          className={`w-full pl-12 pr-3 py-2 rounded-md border text-sm disabled:cursor-not-allowed ${className}`}
          style={{
            borderColor,
            backgroundColor: inputColors.background,
            color: inputColors.text,
            outline: error ? '1px solid #dc2626' : 'none',
            opacity: disabled ? 0.7 : 1,
          }}
          maxLength={maxDigits}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>{error}</p>
      )}
    </div>
  )
}

export default MobileInput
