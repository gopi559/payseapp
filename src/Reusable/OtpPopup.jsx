import React, { useEffect, useState } from 'react'
import Button from './Button'
import THEME_COLORS from '../theme/colors'

const OtpPopup = ({
  open,
  onConfirm,
  onCancel,
  loading,
  length = 4,
}) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: popupColors.backdrop }}
    >
      <div
        className="w-full max-w-[420px] rounded-3xl p-6 ml-0 md:ml-72"
        style={{ backgroundColor: popupColors.panelBackground, border: `1px solid ${popupColors.panelBorder}` }}
      >
        <h2 className="text-lg font-semibold mb-2" style={{ color: popupColors.title }}>Enter OTP</h2>

        <p className="text-sm mb-4" style={{ color: popupColors.subtitle }}>
          Enter The {length}-Digit OTP Sent To Your Registered Mobile Number
        </p>

        <div className="flex justify-between gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl border rounded-xl focus:outline-none"
              style={{
                backgroundColor: popupColors.inputBackground,
                borderColor: popupColors.otp.cellBorder,
                color: popupColors.title,
              }}
            />
          ))}
        </div>

        <Button
          fullWidth
          disabled={otpValue.length !== length || loading}
          onClick={() => onConfirm(otpValue)}
        >
          {loading ? 'Processing...' : 'Complete Transaction'}
        </Button>

        <button
          className="w-full mt-4 text-sm"
          style={{ color: popupColors.subtitle }}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default OtpPopup
