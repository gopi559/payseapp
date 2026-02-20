import React from 'react'
import { formatAmount } from '../utils/formatAmount'
import THEME_COLORS from '../theme/colors'

const ConfirmCard = ({
  title = 'Confirm Transaction',
  items = [],
  total,
  className = '',
}) => {
  const contentCard = THEME_COLORS.contentCard

  return (
    <div
      className={`rounded-xl shadow-sm p-6 ${className}`}
      style={{
        backgroundColor: contentCard.background,
        border: `1px solid ${contentCard.border}`,
      }}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: contentCard.title }}>{title}</h3>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 border-b last:border-0"
            style={{ borderColor: contentCard.divider }}
          >
            <span style={{ color: contentCard.subtitle }}>{item.label}</span>
            <span className="font-medium" style={{ color: contentCard.title }}>{item.value}</span>
          </div>
        ))}
      </div>

      {total && (
        <div className="mt-4 pt-4 border-t-2" style={{ borderColor: contentCard.border }}>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold" style={{ color: contentCard.title }}>Total</span>
            <span className="text-2xl font-bold" style={{ color: contentCard.accentText }}>
              {typeof total === 'number' ? formatAmount(total) : total}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConfirmCard
