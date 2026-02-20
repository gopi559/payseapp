import React, { useState } from 'react'
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
  const inputColors = THEME_COLORS.input

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium mb-1.5" style={{ color: inputColors.text }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
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
          borderColor: isFocused ? inputColors.focusBorder : inputColors.border,
          outline: isFocused ? `1px solid ${inputColors.focusBorder}` : 'none',
          '--input-placeholder': inputColors.placeholder,
          opacity: disabled ? 0.7 : 1,
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm" style={{ color: inputColors.text }}>
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
