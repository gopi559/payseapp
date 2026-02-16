import React, { useState, useEffect } from 'react'
import Button from './Button'

const CvvPopup = ({ open, onClose, onConfirm, loading }) => {
  const [cvv, setCvv] = useState('')
  const [expiry, setExpiry] = useState('')

  /* Lock background scroll */
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
    if (cvv.length < 3 || expiry.length < 4) return

    onConfirm({
      cvv,
      expiry,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 shadow-xl">

        {/* Title */}
        <h2 className="text-lg font-semibold mb-1">
          Card Security Details
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Enter CVV and expiry date
        </p>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* CVV */}
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            autoFocus
            value={cvv}
            onChange={(e) =>
              setCvv(e.target.value.replace(/\D/g, ''))
            }
            placeholder="CVV"
            className="
              bg-blue-50
              border
              rounded-xl
              px-4
              py-3
              text-lg
              focus:outline-none
              focus:ring-2
              focus:ring-green-500
            "
          />

          {/* Expiry */}
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={expiry}
            onChange={(e) => {
              let v = e.target.value.replace(/[^\d]/g, '')
              if (v.length > 2) v = v.slice(0, 2) + v.slice(2, 4)
              setExpiry(v)
            }}
            placeholder="MM/YY"
            className="
              bg-blue-50
              border
              rounded-xl
              px-4
              py-3
              text-lg
              focus:outline-none
              focus:ring-2
              focus:ring-green-500
            "
          />
        </div>

        {/* Action */}
        <Button
          fullWidth
          disabled={cvv.length < 3 || expiry.length < 4 || loading}
          onClick={handleContinue}
        >
          {loading ? 'Processing…' : 'Continue'}
        </Button>

        {/* Cancel */}
        <button
          className="w-full mt-4 text-gray-500 text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default CvvPopup
