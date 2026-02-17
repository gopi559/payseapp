import React, { useEffect } from 'react'
import Button from './Button'
import { HiExclamationTriangle } from 'react-icons/hi2'

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

  const maskedCard = `${card.cardholder_name} •••• ${card.card_number.slice(-4)}`

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
<div className="w-full max-w-md bg-white rounded-t-3xl px-5 pt-4 pb-6 shadow-2xl ml-0 md:ml-72">

        {/* Handle */}
        <div className="w-12 h-1 bg-green-300 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <HiExclamationTriangle className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-semibold">Confirm Transaction</h2>
        </div>

        {/* Details */}
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-gray-500">From</p>
            <p className="text-green-600 font-medium">{maskedCard}</p>
          </div>

          <div>
            <p className="text-gray-500">To</p>
            <p className="text-green-600 font-medium">
              Wallet
            </p>
          </div>

          <div className="flex justify-between pt-2">
            <span className="text-gray-600">Amount</span>
            <span className="text-green-600 font-semibold">
              ₹{Number(amount).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Description</span>
            <span className="text-green-600">
              Add money to wallet
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Button
            fullWidth
            onClick={onSendOtp}
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Confirm Transaction'}
          </Button>

          <Button
            fullWidth
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel Transaction
          </Button>
        </div>

      </div>
    </div>
  )
}

export default ConfirmTransactionPopup
