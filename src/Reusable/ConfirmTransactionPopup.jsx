import React, { useEffect } from 'react'
import Button from './Button'

const ConfirmTransactionPopup = ({
  open,
  card,
  amount,
  loading,
  onSendOtp,
  onCancel,
}) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => (document.body.style.overflow = '')
  }, [open])

  if (!open || !card) return null

  const masked =
    card.card_number.slice(0, 4) +
    ' **** **** ' +
    card.card_number.slice(-4)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-6">

        <p className="text-sm text-gray-500 mb-4">Confirm Transaction</p>

        <div className="space-y-2 mb-6">
          <div>{masked}</div>
          <div>{card.cardholder_name}</div>
          <div className="font-semibold">₹{amount}</div>
        </div>

        <Button fullWidth onClick={onSendOtp} disabled={loading}>
          {loading ? 'Sending OTP…' : 'Send OTP'}
        </Button>

        <button onClick={onCancel} className="w-full mt-4 text-sm text-gray-500">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default ConfirmTransactionPopup
