import React, { useState, useEffect } from 'react'
import Button from './Button'
import { HiExclamationTriangle } from 'react-icons/hi2'
import THEME_COLORS from '../theme/colors'

const CvvPopup = ({ open, onClose, onConfirm, loading }) => {
  const [cvv, setCvv] = useState('')
  const [expiry, setExpiry] = useState('')
  const popupColors = THEME_COLORS.popup

  const expiryDigits = expiry.replace(/\D/g, '')
  const expiryMonth = Number(expiryDigits.slice(0, 2))
  const hasValidExpiry =
    expiryDigits.length === 4 &&
    Number.isInteger(expiryMonth) &&
    expiryMonth >= 1 &&
    expiryMonth <= 12

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = ''
      setCvv('')
      setExpiry('')
    }
  }, [open])

  if (!open) return null

  const handleContinue = () => {
    if (cvv.length !== 3 || !hasValidExpiry) return
    onConfirm({ cvv, expiry })
  }

  const handleExpiryChange = (value) => {
    let digits = value.replace(/[^\d]/g, '').slice(0, 4)

    if (digits.length >= 2) {
      const month = Number(digits.slice(0, 2))

      if (month > 12) {
        digits = `12${digits.slice(2)}`
      } else if (month === 0) {
        digits = `01${digits.slice(2)}`
      }
    }

    if (digits.length > 2) {
      setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`)
      return
    }

    setExpiry(digits)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: popupColors.backdrop }}
    >
<div className="relative ml-0 md:ml-[16.75rem]">
  
  
            <div
          className="w-full max-w-[409px] rounded-3xl p-5"
          style={{
            backgroundColor: popupColors.panelBackground,
            border: `1px solid ${popupColors.panelBorder}`,
          }}
        >
          <div className="flex items-center gap-3 mb-1">
            <HiExclamationTriangle
              className="w-6 h-6"
              style={{ color: popupColors.cvv.icon }}
            />
            <h2
              className="text-lg font-semibold"
              style={{ color: popupColors.title }}
            >
              Card Security Details
            </h2>
          </div>

          <p className="text-sm mb-4" style={{ color: popupColors.subtitle }}>
            Enter CVV2 And Expiry Date
          </p>

          {/* Adjusted Input Layout */}
<div className="grid grid-cols-2 gap-3 mb-6 justify-start w-fit -ml-3">            <input
              type="password"
              inputMode="numeric"
              maxLength={3}
              autoFocus
              value={cvv}
              onChange={(e) =>
                setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))
              }
              placeholder="CVV2"
              className="border rounded-xl px-4 py-3 text-lg focus:outline-none w-40"
              style={{
                backgroundColor: popupColors.inputBackground,
                borderColor: popupColors.inputBorder,
                color: popupColors.title,
              }}
            />

            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={expiry}
              onChange={(e) => handleExpiryChange(e.target.value)}
              placeholder="MM/YY"
              className="border rounded-xl px-4 py-3 text-lg focus:outline-none w-40"
              style={{
                backgroundColor: popupColors.inputBackground,
                borderColor: popupColors.inputBorder,
                color: popupColors.title,
              }}
            />
          </div>

          <Button
            fullWidth
            disabled={cvv.length !== 3 || !hasValidExpiry || loading}
            onClick={handleContinue}
          >
            {loading ? 'Processing...' : 'Continue'}
          </Button>

          <button
            className="w-full mt-4 text-sm"
            style={{ color: popupColors.subtitle }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default CvvPopup