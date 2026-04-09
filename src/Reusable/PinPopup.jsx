import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from './Button'
import THEME_COLORS from '../theme/colors'

const PinPopup = ({
  open,
  onConfirm,
  onCancel,
  loading = false,
  length = 4,
  title,
  subtitle,
}) => {
  const { t } = useTranslation()
  const [pin, setPin] = useState(Array(length).fill(''))
  const popupColors = THEME_COLORS.popup

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setPin(Array(length).fill(''))
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open, length])

  if (!open) return null

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return

    const next = [...pin]
    next[index] = value
    setPin(next)

    if (value && index < length - 1) {
      document.getElementById(`pin-${index + 1}`)?.focus()
    }
  }

  const pinValue = pin.join('')

  return (
    <div
      className="fixed inset-0 z-50 px-4 md:pl-[17.99rem] flex items-end"
      style={{ backgroundColor: popupColors.backdrop }}
    >
      <div
className="w-full max-w-[380px] rounded-3xl p-5 mb-0 ml-[6rem] md:ml-[27rem]"
        style={{
          backgroundColor: popupColors.panelBackground,
          border: `1px solid ${popupColors.panelBorder}`,
        }}
      >
        <div
          className="mx-auto mb-5 h-1.5 w-20 rounded-full"
          style={{ backgroundColor: popupColors.confirmTransaction.handle }}
        />

        <h2
          className="text-[1.65rem] font-semibold"
          style={{ color: popupColors.title }}
        >
          {title || t('wallet_pin')}
        </h2>

        <p className="mt-2 text-sm" style={{ color: popupColors.subtitle }}>
          {subtitle || t('enter_wallet_pin')}
        </p>

        <div className="mt-5 flex justify-center gap-2.5">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              autoFocus={index === 0}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="h-12 w-12 rounded-[18px] border text-center text-xl font-semibold focus:outline-none"
              style={{
                backgroundColor: popupColors.inputBackground,
                borderColor: popupColors.otp.cellBorder,
                color: popupColors.title,
              }}
            />
          ))}
        </div>

        <div className="mt-5 space-y-3">
          <Button
            fullWidth
            onClick={() => onConfirm(pinValue)}
            disabled={loading || pinValue.length !== length}
          >
            {loading ? t('processing') : t('continue')}
          </Button>

          <Button
            fullWidth
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PinPopup