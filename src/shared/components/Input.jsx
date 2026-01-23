import React from 'react'

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
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 rounded-md border text-sm
          ${error ? 'border-red-400' : 'border-gray-300'}
          focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary
          disabled:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200
          bg-white transition-colors
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default Input

