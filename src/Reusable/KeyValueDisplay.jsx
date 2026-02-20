import React from 'react'
import { formatTableDateTime } from '../utils/formatDate'
import THEME_COLORS from '../theme/colors'

const KeyValueDisplay = ({
  data,
  excludedKeys = ['id', 'txn_short_desc'],
  nestedExcludedKeys = {
    debit_details: ['user_id'],
    credit_details: ['user_id'],
  },
  labels = {},
  formatters = {},
  emptyValue = '—',
  className = '',
}) => {
  const contentCard = THEME_COLORS.contentCard

  if (!data || typeof data !== 'object') {
    return <div className={`text-sm ${className}`} style={{ color: contentCard.subtitle }}>{emptyValue}</div>
  }

  const formatSingleValue = (v) => {
    if (typeof v === 'boolean') return v ? 'Yes' : 'No'
    if (v === null || v === undefined || v === '') return emptyValue
    if (
      typeof v === 'string' &&
      (v.includes('T') || v.match(/^\d{4}-\d{2}-\d{2}/)) &&
      !Number.isNaN(Date.parse(v))
    ) {
      return formatTableDateTime(v)
    }
    if (typeof v === 'object') return null
    return String(v)
  }

  const renderObject = (obj, exclude = []) =>
    Object.entries(obj)
      .filter(([k]) => !exclude.includes(k))
      .map(([k, v]) => {
        const formatted = formatSingleValue(v)
        return (
          <div key={k} className="flex flex-wrap justify-between gap-x-3 text-sm">
            <span style={{ color: contentCard.subtitle }} className="capitalize">{k.replace(/_/g, ' ')}:</span>
            <span className="font-medium" style={{ color: contentCard.title }}>
              {formatted !== null ? formatted : JSON.stringify(v)}
            </span>
          </div>
        )
      })

  const renderValue = (key, value) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (value === null || value === undefined || value === '') return emptyValue
    if (
      typeof value === 'string' &&
      (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}/)) &&
      !Number.isNaN(Date.parse(value))
    ) {
      return formatTableDateTime(value)
    }
    if (Array.isArray(value)) {
      return (
        <div className="space-y-3">
          {value.map((item, idx) => (
            <div
              key={idx}
              className="rounded border px-3 py-2 space-y-1"
              style={{ borderColor: contentCard.divider, backgroundColor: contentCard.accentBackground }}
            >
              {renderObject(item, nestedExcludedKeys[key] || [])}
            </div>
          ))}
        </div>
      )
    }
    if (typeof value === 'object') {
      return (
        <div className="rounded border px-3 py-2 space-y-1" style={{ borderColor: contentCard.divider, backgroundColor: contentCard.accentBackground }}>
          {renderObject(value)}
        </div>
      )
    }
    return String(value)
  }

  const entries = Object.entries(data).filter(([key]) => !excludedKeys.includes(key))

  return (
    <div className={`w-full min-w-0 ${className}`}>
      {entries.map(([key, value]) => {
        const label = labels[key] ?? key
        const displayValue =
          typeof formatters[key] === 'function'
            ? formatters[key](value)
            : renderValue(key, value)
        const isReactNode =
          typeof displayValue === 'object' &&
          displayValue !== null &&
          React.isValidElement(displayValue)

        return (
          <div
            key={key}
            className="grid grid-cols-[minmax(140px,auto)_1fr] gap-4 items-center py-3 border-b last:border-0"
            style={{ borderColor: contentCard.divider }}
          >
            <span className="text-sm" style={{ color: contentCard.subtitle }}>{label}</span>
            {isReactNode ? (
              <div className="text-sm font-medium" style={{ color: contentCard.title }}>
                {displayValue}
              </div>
            ) : (
              <span className="text-sm font-medium text-right break-words" style={{ color: contentCard.title }}>
                {displayValue}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default KeyValueDisplay
