import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import ConfirmCard from '../../Reusable/ConfirmCard'
import Button from '../../Reusable/Button'
import OtpInput from '../../Reusable/OtpInput'
import cashInService from './cashIn.service'
import { generateStan } from '../../utils/generateStan'

const getCashInErrorMessage = (error, t, fallbackKey) => {
  const message = String(error?.message || '').trim().toLowerCase()

  if (message === 'transaction failed: transaction processed') {
    return t('cash_in_transaction_already_processed')
  }

  return error?.message || t(fallbackKey)
}

const CashInConfirm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [cashInData, setCashInData] = useState(null)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpError, setOtpError] = useState('')

  useEffect(() => {
    const data = sessionStorage.getItem('cashInData')
    if (!data) {
      navigate('/customer/cash-in')
      return
    }
    setCashInData(JSON.parse(data))
  }, [navigate])

  const handleSendOtp = async () => {
    if (!cashInData) {
      setError(t('session_expired_start_again_cash_in'))
      return
    }
    setLoading(true)
    setError('')
    setOtpError('')
    try {
      const stan = generateStan()
      const { data } = await cashInService.sendOtp({
        card_number: cashInData.card_number,
        cvv: cashInData.cvv,
        expiry_date: cashInData.expiry_date,
        txn_amount: cashInData.txn_amount,
      })
      const rrn = data?.rrn ?? ''
      const finalStan = data?.stan ?? stan
      const updatedData = { ...cashInData, rrn, stan: finalStan }
      sessionStorage.setItem('cashInData', JSON.stringify(updatedData))
      setCashInData(updatedData)
      setOtpSent(true)
      setOtp('')
      toast.success(t('otp_sent_successfully'))
    } catch (err) {
      const msg = getCashInErrorMessage(err, t, 'failed_to_send_otp_try_again')
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOtp = async () => {
    if (!otp || otp.length < 4) {
      setOtpError(t('please_enter_otp_received'))
      return
    }
    if (!cashInData?.rrn || !cashInData?.stan) {
      setError(t('session_expired_start_again_cash_in'))
      return
    }
    setLoading(true)
    setOtpError('')
    setError('')
    try {
      const { data: transactionData } = await cashInService.confirmCardToWallet({
        card_number: cashInData.card_number,
        txn_amount: cashInData.txn_amount,
        cvv: cashInData.cvv,
        expiry_date: cashInData.expiry_date,
        otp,
        rrn: cashInData.rrn,
        stan: cashInData.stan,
      })
      sessionStorage.removeItem('cashInData')
      sessionStorage.setItem('cashInSuccess', JSON.stringify({
        ...transactionData,
        card_number: cashInData.card_number,
        card_name: cashInData.card_name,
        txn_amount: cashInData.txn_amount,
        cvv: cashInData.cvv,
        expiry_date: cashInData.expiry_date,
      }))
      toast.success(t('cash_in_successful'))
      setTimeout(() => {
        navigate('/customer/cash-in/success')
      }, 800)
    } catch (err) {
      const msg = getCashInErrorMessage(err, t, 'invalid_or_expired_otp')
      setOtpError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!cashInData) return null

  const maskedCard = cashInData.card_number
    ? `${cashInData.card_number.slice(0, 4)} **** **** ${cashInData.card_number.slice(-4)}`
    : '-'

  return (
    <MobileScreenContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">
          {otpSent ? t('enter_otp') : t('confirm_transaction')}
        </h1>

        {error && (
          <div className="border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {!otpSent ? (
          <>
            <ConfirmCard
              title={t('confirm_transaction')}
              items={[
                { label: t('card'), value: maskedCard },
                { label: t('card_name'), value: cashInData.card_name || t('not_available') },
                { label: t('amount'), value: `${parseFloat(cashInData.txn_amount).toFixed(2)}` },
              ]}
              total={parseFloat(cashInData.txn_amount)}
            />
            <p className="text-sm text-gray-500 mt-2 mb-4">
              {t('click_send_otp_instructions')}
            </p>
            <div className="mt-6 space-y-3">
              <Button onClick={handleSendOtp} fullWidth disabled={loading}>
                {loading ? t('sending_otp') : t('send_otp')}
              </Button>
              <Button
                onClick={() => navigate('/customer/cash-in')}
                variant="outline"
                fullWidth
                disabled={loading}
              >
                {t('cancel')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-gray-200 px-4 py-3 mb-4">
              <p className="text-sm text-gray-600">
                {t('otp_sent_confirm_instructions')}
              </p>
            </div>
            <OtpInput
              length={4}
              onChange={setOtp}
              error={otpError}
              disabled={loading}
            />
            <div className="mt-4 space-y-2">
              <Button onClick={handleConfirmOtp} fullWidth disabled={loading || otp.length !== 4}>
                {loading ? t('verifying') : t('confirm')}
              </Button>
              <Button
                onClick={() => navigate('/customer/cash-in')}
                variant="outline"
                fullWidth
                disabled={loading}
              >
                {t('cancel')}
              </Button>
            </div>
          </>
        )}
      </div>
    </MobileScreenContainer>
  )
}

export default CashInConfirm
