import React, { useState } from 'react'
import { formatAmount } from '../utils/formatAmount'

const AmountInput = ({
  value,
  onChange,
  label = 'Amount',
  maxAmount,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value || '')
  
  const handleChange = (e) => {
    const input = e.target.value.replace(/[^\d.]/g, '')
    const parts = input.split('.')
    
    // Allow only 2 decimal places
    if (parts.length > 2) return
    if (parts[1] && parts[1].length > 2) return
    
    setDisplayValue(input)
    onChange(input)
  }
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onChange) {
      onChange(displayValue)
    }
  }
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-600">
          ₹
        </div>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="0.00"
          className="w-full pl-9 pr-3 py-2.5 text-xl font-semibold rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-brand-dark bg-white transition-colors"
        />
      </div>
      {maxAmount && (
        <p className="mt-1.5 text-xs text-gray-500">
          Available: {formatAmount(maxAmount)}
        </p>
      )}
    </div>
  )
}

export default AmountInput

