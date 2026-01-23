import React from 'react'
import { formatAmount } from '../../utils/formatAmount'

const ConfirmCard = ({
  title = 'Confirm Transaction',
  items = [],
  total,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-brand-dark mb-4">{title}</h3>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <span className="text-gray-600">{item.label}</span>
            <span className="font-medium text-brand-dark">{item.value}</span>
          </div>
        ))}
      </div>
      
      {total && (
        <div className="mt-4 pt-4 border-t-2 border-brand-primary">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-brand-dark">Total</span>
            <span className="text-2xl font-bold text-brand-primary">
              {typeof total === 'number' ? formatAmount(total) : total}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConfirmCard


