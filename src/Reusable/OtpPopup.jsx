import React, { useEffect, useState } from 'react'
import Button from './Button'

const OtpPopup = ({
  open,
  onConfirm,
  onCancel,
  loading,
  length = 4, // ✅ default 4 digits
}) => {
  const [otp, setOtp] = useState(Array(length).fill(''))

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setOtp(Array(length).fill('')) // reset on open
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-xl ml-0 md:ml-72">
        <h2 className="text-lg font-semibold mb-2">Enter OTP</h2>

        <p className="text-sm text-gray-500 mb-4">
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
              className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
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
          className="w-full mt-4 text-gray-500 text-sm"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default OtpPopup
