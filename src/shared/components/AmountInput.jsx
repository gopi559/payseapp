import React, { useState } from 'react'
import { formatAmount } from '../../utils/formatAmount'

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
        <label className="block text-sm font-medium text-brand-dark mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-brand-dark">
          ₹
        </div>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="0.00"
          className="w-full pl-12 pr-4 py-4 text-3xl font-bold rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-brand-dark"
        />
      </div>
      {maxAmount && (
        <p className="mt-2 text-sm text-gray-600">
          Available: {formatAmount(maxAmount)}
        </p>
      )}
    </div>
  )
}

export default AmountInput

