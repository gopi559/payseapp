import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from './Button'
import THEME_COLORS from '../theme/colors'

const OtpPopup = ({
  open,
  onConfirm,
  onCancel,
  loading,
  length = 4,
}) => {
  const { t } = useTranslation()
  const [otp, setOtp] = useState(Array(length).fill(''))
  const popupColors = THEME_COLORS.popup

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setOtp(Array(length).fill(''))
    }
    return () => (document.body.style.overflow = '')
  }, [open, length])

  if (!open) return null

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const otpValue = otp.join('')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-3 md:pl-[18.6rem]"
      style={{ backgroundColor: popupColors.backdrop }}
    >
      <div
        className="w-full max-w-[380px] rounded-3xl p-5"
        style={{
          backgroundColor: popupColors.panelBackground,
          border: `1px solid ${popupColors.panelBorder}`,
        }}
      >
        <h2
          className="text-lg font-semibold mb-2"
          style={{ color: popupColors.title }}
        >
          {t('enter_otp')}
        </h2>

        <p
          className="text-sm mb-4"
          style={{ color: popupColors.subtitle }}
        >
          {t('enter_otp_sent_registered_mobile', { length })}
        </p>

        <div className="flex justify-center gap-3 mb-5">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-12 h-12 text-center text-xl font-bold border rounded-xl focus:outline-none"
              style={{
                backgroundColor: popupColors.inputBackground,
                borderColor: popupColors.otp.cellBorder,
                color: popupColors.title,
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="space-y-2 w-fit ml-6">
          <Button
            disabled={otpValue.length !== length || loading}
            onClick={() => onConfirm(otpValue)}
            className="w-[300px]"
          >
            {loading ? t('processing') : t('complete_transaction')}
          </Button>

          <Button
            onClick={onCancel}
            className="w-[300px]"
          >
            {t('cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OtpPopup
