import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import THEME_COLORS from '../theme/colors'

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const { t, i18n } = useTranslation()
  const inputColors = THEME_COLORS.input
  const resolvedLabel = typeof label === 'string' && i18n.exists(label) ? t(label) : label
  const resolvedPlaceholder =
    typeof placeholder === 'string' && i18n.exists(placeholder) ? t(placeholder) : placeholder

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium mb-1.5" style={{ color: inputColors.text }}>
          {resolvedLabel}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={resolvedPlaceholder}
        disabled={disabled}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        className={`w-full px-3 py-2 rounded-md border text-sm transition-colors disabled:cursor-not-allowed placeholder-[var(--input-placeholder)] ${className}`}
        style={{
          color: inputColors.text,
          backgroundColor: inputColors.background,
          borderColor: error ? '#dc2626' : isFocused ? inputColors.focusBorder : inputColors.border,
          outline: error ? '1px solid #dc2626' : isFocused ? `1px solid ${inputColors.focusBorder}` : 'none',
          '--input-placeholder': inputColors.placeholder,
          opacity: disabled ? 0.7 : 1,
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm" style={{ color: '#dc2626' }}>
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
