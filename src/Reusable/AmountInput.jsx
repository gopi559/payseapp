import React, { useState, useEffect } from 'react'
import { formatAmount } from '../utils/formatAmount'
import THEME_COLORS from '../theme/colors'

const AmountInput = ({
  value,
  onChange,
  label = 'Amount',
  maxAmount,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value || '')
  const inputColors = THEME_COLORS.input

  useEffect(() => {
    setDisplayValue(value ?? '')
  }, [value])

  const handleChange = (e) => {
    const input = e.target.value.replace(/[^\d.]/g, '')
    const parts = input.split('.')

    if (parts.length > 2) return
    if (parts[1] && parts[1].length > 2) return

    setDisplayValue(input)
    onChange(input)
  }

  const handleKeyPress = (e) => {
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
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold" style={{ color: inputColors.text }}>
          Rs
        </div>

        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="0.00"
          className="w-full pl-12 pr-3 py-2.5 text-xl font-semibold rounded-md border"
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
