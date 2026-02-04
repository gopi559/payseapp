import React from 'react'

/**
 * Reusable key-value display for API/object data.
 * Lists all keys from `data` (except excludedKeys), with optional labels and custom formatters.
 */
const KeyValueDisplay = ({
  data,
  excludedKeys = [],
  labels = {},
  formatters = {},
  emptyValue = '—',
  className = '',
}) => {
  if (!data || typeof data !== 'object') {
    return (
      <div className={`text-sm text-gray-600 ${className}`}>
        {emptyValue}
      </div>
    )
  }

  const formatSingleValue = (v) => {
    if (typeof v === 'boolean') return v ? 'Yes' : 'No'
    if (v === null || v === undefined || v === '') return emptyValue
    // Show ISO date strings exactly as in API response (no timezone conversion)
    if (
      typeof v === 'string' &&
      v.includes('T') &&
      !Number.isNaN(Date.parse(v))
    ) {
      return v
    }
    if (typeof v === 'object') return null // handled below as block
    return String(v)
  }

  const renderValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    if (value === null || value === undefined || value === '') {
      return emptyValue
    }
    // Show ISO date strings exactly as in API response (no timezone conversion)
    if (
      typeof value === 'string' &&
      value.includes('T') &&
      !Number.isNaN(Date.parse(value))
    ) {
      return value
    }
    // Array of objects: show as readable blocks (e.g. debit_details, credit_details)
    if (
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((item) => item != null && typeof item === 'object' && !Array.isArray(item))
    ) {
      return (
        <div className="space-y-3 text-right">
          {value.map((item, idx) => (
            <div
              key={idx}
              className="rounded border border-gray-100 bg-gray-50/80 px-3 py-2 text-left"
            >
              {Object.entries(item).map(([k, v]) => {
                const formatted = formatSingleValue(v)
                return (
                  <div
                    key={k}
                    className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 py-1 text-sm"
                  >
                    <span className="text-gray-500 capitalize">
                      {k.replace(/_/g, ' ')}:
                    </span>
                    <span className="font-medium text-gray-800">
                      {formatted !== null ? formatted : JSON.stringify(v)}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )
    }
    // Single object (not array): show as key-value lines
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return (
        <div className="rounded border border-gray-100 bg-gray-50/80 px-3 py-2 text-left space-y-1">
          {Object.entries(value).map(([k, v]) => {
            const formatted = formatSingleValue(v)
            return (
              <div
                key={k}
                className="flex flex-wrap justify-between gap-x-3 text-sm"
              >
                <span className="text-gray-500 capitalize">
                  {k.replace(/_/g, ' ')}:
                </span>
                <span className="font-medium text-gray-800">
                  {formatted !== null ? formatted : JSON.stringify(v)}
                </span>
              </div>
            )
          })}
        </div>
      )
    }
    return String(value)
  }

  const entries = Object.entries(data).filter(
    ([key]) => !excludedKeys.includes(key)
  )

  return (
    <div className={`w-full min-w-0 ${className}`}>
      {entries.map(([key, value]) => {
        const label = labels[key] ?? key
        const displayValue =
          typeof formatters[key] === 'function'
            ? formatters[key](value)
            : renderValue(value)
        const isReactNode =
          typeof displayValue === 'object' &&
          displayValue !== null &&
          React.isValidElement(displayValue)
        return (
          <div
            key={key}
            className="grid grid-cols-[minmax(140px,auto)_1fr] gap-4 items-center py-3 border-b border-gray-200 last:border-0 min-w-0"
          >
            <span className="text-sm text-gray-600 shrink-0">{label}</span>
            {isReactNode ? (
              <div className="text-sm font-medium text-gray-800 min-w-0">
                {displayValue}
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-800 text-right break-words min-w-0 whitespace-pre-wrap">
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



