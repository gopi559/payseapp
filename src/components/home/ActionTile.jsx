// src/components/home/ActionTile.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import THEME_COLORS from '../../theme/colors'

const ActionTile = ({
  icon,
  label,
  route,
  onClick,
  isComponent = false,
  isImage = false,
}) => {
  const navigate = useNavigate()
  const colors = THEME_COLORS.home.actionTile

  const handleClick = () => {
    if (onClick) onClick()
    else if (route) navigate(route)
  }

  const renderIcon = () => {
    if (isImage && React.isValidElement(icon)) {
      const existing = icon.props.className || ''
      return React.cloneElement(icon, {
        className: `w-12 h-12 sm:w-14 sm:h-14 object-contain ${existing}`.trim(),
      })
    }

    if (isComponent) {
      return (
        <span
          className="text-4xl sm:text-5xl flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14"
          style={{ color: colors.iconText }}
        >
          {icon}
        </span>
      )
    }

    return (
      <span className="text-4xl sm:text-5xl flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14">
        {icon}
      </span>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center bg-transparent p-0 active:scale-95 transition-transform duration-200"
    >
      <div
        className="flex items-center justify-center mb-3 w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-sm"
        style={{
          backgroundColor: colors.iconBg,
        }}
      >
        {renderIcon()}
      </div>

      <span
        className="text-sm sm:text-base font-medium text-center leading-tight"
        style={{ color: colors.labelText }}
      >
        {label}
      </span>
    </button>
  )
}

export default ActionTile
