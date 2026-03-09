import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import THEME_COLORS from '../../theme/colors'

const ActionTile = ({ actionId, icon, labelKey, route, onClick, isComponent = false, isImage = false }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const colors = THEME_COLORS.home.actionTile
  const isPrimaryCircle = actionId === 'cash_in' || actionId === 'cash_out'

  const handleClick = () => {
    if (onClick) onClick()
    else if (route) navigate(route)
  }

  const renderIcon = () => {
    if (isImage && React.isValidElement(icon)) {
      const existing = icon.props.className || ''
      return React.cloneElement(icon, {
        className: `w-9 h-9 object-contain ${isPrimaryCircle ? 'brightness-0 invert' : ''} ${existing}`.trim(),
      })
    }

    if (isComponent) {
      return <span className="text-[34px] leading-none">{icon}</span>
    }

    return <span className="text-[34px] leading-none">{icon}</span>
  }

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-start bg-transparent border-0 shadow-none p-0 transition-transform duration-200 hover:scale-105 active:scale-95"
      type="button"
    >
      <div
        className="flex items-center justify-center rounded-full bg-[#357219] text-white w-[72px] h-[72px] lg:w-[76px] lg:h-[76px]"
        style={{
          backgroundColor: isPrimaryCircle ? colors.iconBg : '#DDE5DE',
          color: isPrimaryCircle ? colors.iconText : colors.iconBg,
        }}
      >
        {renderIcon()}
      </div>

      <span className="mt-3.5 text-base font-medium text-center leading-tight" style={{ color: colors.labelText }}>
        {t(labelKey)}
      </span>
    </button>
  )
}

export default ActionTile
