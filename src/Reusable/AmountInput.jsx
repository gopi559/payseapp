import React, { useState, useEffect } from 'react'
import { formatAmount } from '../utils/formatAmount'
import THEME_COLORS from '../theme/colors'
import AfganCurrency from '../assets/afgan_currency_green.svg'

const AmountInput = ({
  value,
  onChange,
  label = 'Amount',
  maxAmount,
  className = '',
  readOnly = false,
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState(value || '')
  const inputColors = THEME_COLORS.input

  useEffect(() => {
    setDisplayValue(value ?? '')
  }, [value])

  const handleChange = (e) => {
    if (readOnly || disabled) return
    const input = e.target.value.replace(/[^\d.]/g, '')
    const parts = input.split('.')

    if (parts.length > 2) return
    if (parts[1] && parts[1].length > 2) return

    setDisplayValue(input)
    onChange(input)
  }

  const handleKeyPress = (e) => {
    if (readOnly || disabled) return
    if (e.key === 'Enter') {
      onChange(displayValue)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-medium mb-1.5" style={{ color: inputColors.text }}>
          {label}
        </label>
      )}

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <img src={AfganCurrency} alt="AFN" className="w-6 h-6 object-contain" />
        </span>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="0.00"
          readOnly={readOnly}
          disabled={disabled}
          className="w-full pl-11 pr-3 py-2.5 text-xl font-semibold rounded-md border"
          style={{ borderColor: inputColors.border, color: inputColors.text, backgroundColor: inputColors.background }}
        />
      </div>

      {maxAmount && (
        <p className="mt-1.5 text-xs" style={{ color: inputColors.placeholder }}>
          Available: {formatAmount(maxAmount)}
        </p>
      )}
    </div>
  )
}

export default AmountInput
