import React, { useState, useEffect } from 'react'
import Button from './Button'
import { HiExclamationTriangle } from 'react-icons/hi2'
import THEME_COLORS from '../theme/colors'

const CvvPopup = ({ open, onClose, onConfirm, loading }) => {
  const [cvv, setCvv] = useState('')
  const [expiry, setExpiry] = useState('')
  const popupColors = THEME_COLORS.popup

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
    if (cvv.length !== 3 || expiry.length < 4) return
    onConfirm({ cvv, expiry })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: popupColors.backdrop }}
    >
      <div className="relative ml-0 md:ml-72">
        <div
          className="w-full max-w-[420px] rounded-3xl p-6"
          style={{ backgroundColor: popupColors.panelBackground, border: `1px solid ${popupColors.panelBorder}` }}
        >
          <div className="flex items-center gap-3 mb-1">
            <HiExclamationTriangle className="w-6 h-6" style={{ color: popupColors.cvv.icon }} />
            <h2 className="text-lg font-semibold" style={{ color: popupColors.title }}>
              Card Security Details
            </h2>
          </div>

          <p className="text-sm mb-4" style={{ color: popupColors.subtitle }}>
            Enter CVV And Expiry Date
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              autoFocus
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
              placeholder="CVV"
              className="border rounded-xl px-4 py-3 text-lg focus:outline-none"
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
              onChange={(e) => {
                let v = e.target.value.replace(/[^\d]/g, '')
                if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4)
                setExpiry(v)
              }}
              placeholder="MM/YY"
              className="border rounded-xl px-4 py-3 text-lg focus:outline-none"
              style={{
                backgroundColor: popupColors.inputBackground,
                borderColor: popupColors.inputBorder,
                color: popupColors.title,
              }}
            />
          </div>

          <Button
            fullWidth
            disabled={cvv.length < 3 || expiry.length < 4 || loading}
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
