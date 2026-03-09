import React from 'react'
import { useTranslation } from 'react-i18next'
import ChipIcon from '../../../assets/Chip.svg'
import WifiIcon from '../../../assets/wifi.svg'

const formatExpiry = () => '--/--'

const OtherCardPreview = ({ card, onClick, selectable = true, fullWidth = false }) => {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={() => selectable && onClick?.(card.id)}
      className={`relative h-[200px] sm:h-[320px] rounded-2xl overflow-hidden shadow-xl text-left transition-transform ${
        fullWidth ? 'w-full' : 'w-full max-w-[320px] sm:max-w-[400px]'
      } ${selectable ? 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer' : 'cursor-default'}`}
      style={{ backgroundColor: card.color_code || '#e5e7eb' }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-white/20" />

      <svg
        className="absolute top-0 left-0 w-full h-16 sm:h-20 opacity-30 fill-white/20"
        viewBox="0 0 480 80"
        preserveAspectRatio="none"
      >
        <path d="M0 40 Q120 0 240 40 T480 40 L480 80 L0 80 Z" />
      </svg>

      <span className="absolute top-3 left-4 bg-white text-gray-800 text-xs px-3 py-1 rounded-full font-semibold z-20">
        {card.external_inst_name?.trim() || t('other_bank')}
      </span>

      <span className="absolute top-3 right-4 text-gray-800 font-bold text-lg z-20">
        {card.inst_short_name || ''}
      </span>

      <img src={ChipIcon} alt="Chip" className="absolute top-14 left-4 w-10 sm:w-12 z-20" draggable={false} />

      <img
        src={WifiIcon}
        alt="Contactless"
        className="absolute top-16 sm:top-18 right-4 w-8 sm:w-9 z-20"
        draggable={false}
      />

      <div className="absolute left-4 right-4 top-28 sm:top-32 text-gray-800 text-base sm:text-lg font-mono tracking-[0.3em] z-20 truncate">
        {card.masked_card || '**** **** **** ****'}
      </div>

      <div className="absolute left-4 bottom-4 z-20 text-gray-800">
        <p className="text-xs text-gray-600">{t('cardholder')}</p>
        <p className="font-semibold text-sm sm:text-base truncate max-w-[180px]">
          {card.cardholder_name || t('not_available')}
        </p>
      </div>

      <div className="absolute right-4 bottom-4 z-20 text-right">
        <p className="text-xs text-gray-600">{t('valid_thru')}</p>
        <p className="font-semibold text-sm sm:text-base">{formatExpiry()}</p>
      </div>
    </button>
  )
}

export default OtherCardPreview
