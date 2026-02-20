import React, { useState, useRef, useEffect } from 'react'
import THEME_COLORS from '../theme/colors'

const OtpInput = ({ length = 6, onComplete, onChange, error, disabled = false }) => {
  const [digits, setDigits] = useState(Array(length).fill(''))
  const inputRefs = useRef([])
  const popupColors = THEME_COLORS.popup

  useEffect(() => {
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus()
    }
  }, [disabled])

  const handleChange = (index, value) => {
    if (!/^\d$/.test(value) && value !== '') return

    const newDigits = [...digits]
    newDigits[index] = value
    setDigits(newDigits)

    const otpValue = newDigits.join('')

    if (onChange) {
      onChange(otpValue)
    }

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newDigits.every((d) => d !== '') && onComplete) {
      onComplete(otpValue)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, length)
    const newDigits = Array(length).fill('')

    pastedData.split('').forEach((char, i) => {
      if (i < length && /^\d$/.test(char)) {
        newDigits[i] = char
      }
    })

    setDigits(newDigits)
    const otpValue = newDigits.join('')

    if (onChange) {
      onChange(otpValue)
    }

    if (newDigits.every((d) => d !== '') && onComplete) {
      onComplete(otpValue)
    } else {
      const nextEmptyIndex = newDigits.findIndex((d) => d === '')
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus()
      }
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-center gap-3 mb-4">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className="w-14 h-14 text-center text-2xl font-bold rounded-lg border disabled:cursor-not-allowed"
            style={{
              borderColor: popupColors.otp.cellBorder,
              backgroundColor: digits[index] ? popupColors.inputBackground : popupColors.panelBackground,
              color: popupColors.title,
              opacity: disabled ? 0.7 : 1,
            }}
          />
        ))}
      </div>
      {error && (
        <p className="text-center text-sm mt-2" style={{ color: popupColors.title }}>{error}</p>
      )}
    </div>
  )
}

export default OtpInput
