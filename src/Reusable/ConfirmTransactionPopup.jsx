import React, { useEffect } from 'react'
import Button from './Button'
import { HiExclamationTriangle } from 'react-icons/hi2'
import { formatCardNumber } from '../utils/formatCardNumber'
import THEME_COLORS from '../theme/colors'

const ConfirmTransactionPopup = ({
  open,
  card,
  amount,
  to,
  description,
  mobile,
  loading,
  onSendOtp,
  onCancel,
}) => {
  const popupColors = THEME_COLORS.popup
  const confirmColors = THEME_COLORS.popup.confirmTransaction

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => (document.body.style.overflow = '')
  }, [open])

  if (!open) return null

  const fromCardNumber = card?.card_number ? formatCardNumber(card.card_number) : null
  const fromCardholderName = card?.cardholder_name || card?.name_on_card

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: popupColors.backdrop }}
    >
      <div
        className="w-full max-w-md rounded-t-3xl px-5 pt-4 pb-6 ml-0 md:ml-72"
        style={{ backgroundColor: popupColors.panelBackground, borderTop: `1px solid ${popupColors.panelBorder}` }}
      >
        <div
          className="w-12 h-1 rounded-full mx-auto mb-4"
          style={{ backgroundColor: confirmColors.handle }}
        />

        <div className="flex items-center gap-3 mb-4">
          <HiExclamationTriangle className="w-6 h-6" style={{ color: popupColors.accent }} />
          <h2 className="text-xl font-semibold" style={{ color: popupColors.title }}>Confirm Transaction</h2>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p style={{ color: confirmColors.label }}>From</p>
            {fromCardNumber ? (
              <div>
                <p className="font-medium font-mono" style={{ color: confirmColors.value }}>{fromCardNumber}</p>
                {fromCardholderName && (
                  <p className="text-xs mt-1" style={{ color: confirmColors.value }}>{fromCardholderName}</p>
                )}
              </div>
            ) : (
              <p className="font-medium" style={{ color: confirmColors.value }}>Wallet Balance</p>
            )}
          </div>

          <div>
            <p style={{ color: confirmColors.label }}>To</p>
            {typeof to === 'string' ? (
              <p className="font-medium" style={{ color: confirmColors.value }}>{to}</p>
            ) : (
              <div className="font-medium" style={{ color: confirmColors.value }}>{to}</div>
            )}
          </div>

          <div className="flex justify-between">
            <span style={{ color: confirmColors.label }}>Mobile</span>
            <span className="font-medium font-mono" style={{ color: confirmColors.value }}>
              {mobile?.replace(/^\+93\s?/, '')}
            </span>
          </div>

          <div className="flex justify-between pt-2">
            <span style={{ color: confirmColors.label }}>Amount</span>
            <span className="font-semibold" style={{ color: confirmColors.value }}>
              {Number(amount).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span style={{ color: confirmColors.label }}>Description</span>
            <span style={{ color: confirmColors.value }}>{description}</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button fullWidth onClick={onSendOtp} disabled={loading}>
            {loading ? 'Sending OTP...' : 'Confirm Transaction'}
          </Button>

          <Button fullWidth variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel Transaction
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmTransactionPopup
