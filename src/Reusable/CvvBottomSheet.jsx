import React, { useState } from 'react'
import Button from './Button'
import THEME_COLORS from '../theme/colors'

const CvvBottomSheet = ({ open, onClose, onSubmit, loading }) => {
  const [cvv, setCvv] = useState('')
  const popupColors = THEME_COLORS.popup

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: popupColors.backdrop }}>
      <div
        className="w-full rounded-t-3xl p-5"
        style={{ backgroundColor: popupColors.panelBackground, borderTop: `1px solid ${popupColors.panelBorder}` }}
      >
        <h2 className="text-lg font-semibold mb-3" style={{ color: popupColors.title }}>
          Enter CVV2 to check balance
        </h2>

        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={cvv}
          onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
          placeholder="CVV2"
          className="w-full border rounded-xl px-4 py-3 text-lg mb-4"
          style={{
            backgroundColor: popupColors.inputBackground,
            borderColor: popupColors.inputBorder,
            color: popupColors.title,
          }}
        />

        <Button
          fullWidth
          disabled={cvv.length < 3 || loading}
          onClick={() => onSubmit(cvv)}
        >
          {loading ? 'Checking...' : 'Check Balance'}
        </Button>

        <button
          className="w-full mt-3"
          style={{ color: popupColors.subtitle }}
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default CvvBottomSheet
