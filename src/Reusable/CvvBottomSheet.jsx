import React, { useState } from 'react'
import Button from './Button'

const CvvBottomSheet = ({ open, onClose, onSubmit, loading }) => {
  const [cvv, setCvv] = useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="w-full bg-white rounded-t-3xl p-5">
        <h2 className="text-lg font-semibold mb-3">
          Enter CVV2 to check balance
        </h2>

        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={cvv}
          onChange={(e) =>
            setCvv(e.target.value.replace(/\D/g, ''))
          }
          placeholder="CVV2"
          className="w-full border-2 border-brand-secondary rounded-xl px-4 py-3 text-lg mb-4"
        />

        <Button
          fullWidth
          disabled={cvv.length < 3 || loading}
          onClick={() => onSubmit(cvv)}
        >
          {loading ? 'Checking...' : 'Check Balance'}
        </Button>

        <button
          className="w-full mt-3 text-gray-500"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default CvvBottomSheet
