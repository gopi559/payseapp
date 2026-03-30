import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const popupColors = THEME_COLORS.popup
  const confirmColors = THEME_COLORS.popup.confirmTransaction

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => (document.body.style.overflow = '')
  }, [open])

  if (!open) return null

  const fromCardNumber = card?.card_number
    ? formatCardNumber(card.card_number)
    : null

  const fromCardholderName =
    card?.display_cardholder_name ||
    card?.cardholder_name ||
    card?.cardholder_nick_name ||
    card?.name_on_card

  return (
<div
  className="fixed inset-0 z-50 flex items-end justify-center px-4 md:pl-[17.99rem]"
  style={{ backgroundColor: popupColors.backdrop }}
>
<div
  className="w-full max-w-[380px] rounded-3xl p-5 mb-0 ml-[1rem]"
  style={{
    backgroundColor: popupColors.panelBackground,
    border: `1px solid ${popupColors.panelBorder}`,
  }}
>
<div className="flex items-center gap-3 mb-4 w-fit">
            <HiExclamationTriangle
            className="w-6 h-6"
            style={{ color: popupColors.accent }}
          />
          <h2
            className="text-xl font-semibold"
            style={{ color: popupColors.title }}
          >
            {t('confirm_transaction')}
          </h2>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p style={{ color: confirmColors.label }}>{t('from_label')}</p>

            {fromCardNumber ? (
              <div>
                <p
                  className="font-medium font-mono"
                  style={{ color: confirmColors.value }}
                >
                  {fromCardNumber}
                </p>

                {fromCardholderName && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: confirmColors.value }}
                  >
                    {fromCardholderName}
                  </p>
                )}
              </div>
            ) : (
              <p className="font-medium" style={{ color: confirmColors.value }}>
                {t('wallet_balance')}
              </p>
            )}
          </div>

          <div>
            <p style={{ color: confirmColors.label }}>{t('to_label')}</p>
            {typeof to === 'string' ? (
              <p className="font-medium" style={{ color: confirmColors.value }}>
                {to}
              </p>
            ) : (
              <div className="font-medium" style={{ color: confirmColors.value }}>
                {to}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <span style={{ color: confirmColors.label }}>{t('mobile_number_label')}</span>
            <span
              className="font-medium font-mono"
              style={{ color: confirmColors.value }}
            >
              {mobile ? mobile.replace(/^\+93\s?/, '') : t('not_available')}
            </span>
          </div>

          <div className="flex justify-between pt-2">
            <span style={{ color: confirmColors.label }}>{t('amount')}</span>
            <span className="font-semibold" style={{ color: confirmColors.value }}>
              {Number(amount).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span style={{ color: confirmColors.label }}>{t('description')}</span>
            <span style={{ color: confirmColors.value }}>{description}</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button fullWidth onClick={onSendOtp} disabled={loading}>
            {loading ? t('sending_otp') : t('confirm_transaction')}
          </Button>

          <Button
            fullWidth
            onClick={onCancel}
            disabled={loading}
          >
            {t('cancel_transaction')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmTransactionPopup
