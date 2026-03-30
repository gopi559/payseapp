import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MobileInput from '../Reusable/MobileInput'
import Button from '../Reusable/Button'
import OtpInput from '../Reusable/OtpInput'
import useLogin from '../Hooks/useLogin'

const OTP_EXPIRY_SECONDS = 120

const LoginForm = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { sendOtp, verifyOtp, errorMessage, showModal, setShowModal } = useLogin()
  const mobileFromState = location.state?.mobile ?? ''
  const [mobileNumber, setMobileNumber] = useState(mobileFromState || '+93')
  const [otp, setOtp] = useState('')
  const [isFlipped, setIsFlipped] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const displayError = showModal ? errorMessage : error

  const clearError = () => {
    setError('')
    setShowModal(false)
  }

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOtp = async (event) => {
    event.preventDefault()
    setError('')
    setShowModal(false)

    const digitsOnly = mobileNumber.replace(/\D/g, '')
    if (!mobileNumber || digitsOnly.length < 10) {
      setError(t('please_enter_valid_mobile_number'))
      return
    }

    setLoading(true)
    try {
      const result = await sendOtp(mobileNumber)
      if (result.success) {
        setOtpSent(true)
        setCountdown(OTP_EXPIRY_SECONDS)
        setIsFlipped(true)
      } else {
        setError(result.error || t('failed_to_send_otp'))
      }
    } catch (error) {
      setError(t('something_went_wrong'))
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return

    setError('')
    setShowModal(false)
    setLoading(true)

    try {
      const result = await sendOtp(mobileNumber)
      if (result.success) {
        setCountdown(OTP_EXPIRY_SECONDS)
        setOtp('')
      } else {
        setError(result.error || t('failed_to_resend_otp'))
      }
    } catch (error) {
      setError(t('something_went_wrong'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (enteredOtp) => {
    if (!enteredOtp || enteredOtp.length !== 6) {
      setError(t('please_enter_valid_otp'))
      return
    }

    setError('')
    setShowModal(false)
    setLoading(true)

    try {
      const result = await verifyOtp(mobileNumber, enteredOtp)
      if (!result.success) {
        setError(result.error || t('invalid_otp'))
      }
    } catch (error) {
      setError(t('something_went_wrong'))
    } finally {
      setLoading(false)
    }
  }

  const handleBackToMobile = () => {
    setIsFlipped(false)
    setOtp('')
    setError('')
    setShowModal(false)
  }

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ perspective: '1000px' }}>
        <div
          className="relative w-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div
            className="w-full relative bg-white rounded-2xl shadow-xl p-8 min-h-[500px] flex flex-col justify-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-brand-primary mb-2">{t('customer_portal')}</h1>
              <p className="text-gray-700 mb-1">{t('welcome_back')}</p>
              <p className="text-sm text-brand-primary">{t('manage_money')}</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                  <span>{displayError}</span>
                  {showModal && (
                    <button type="button" onClick={clearError} className="text-red-600 hover:underline ml-2">
                      {t('dismiss')}
                    </button>
                  )}
                </div>
              )}

              <MobileInput
                label="mobile_number"
                value={mobileNumber}
                onChange={(event) => {
                  setMobileNumber(event.target.value)
                }}
                placeholder="mobile_placeholder"
                required
                autoFocus
              />

              <Button
                type="submit"
                fullWidth
                disabled={loading || !mobileNumber || mobileNumber.replace(/\D/g, '').length < 10}
              >
                {loading ? t('sending_otp') : t('continue')}
              </Button>
            </form>
          </div>

          <div
            className="w-full absolute inset-0 bg-white rounded-2xl shadow-xl p-8 min-h-[500px] flex flex-col justify-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-brand-primary mb-2">{t('customer_portal')}</h1>
              <p className="text-gray-700 mb-1">{t('welcome_back')}</p>
              <p className="text-sm text-brand-primary">{t('manage_money')}</p>
            </div>

            <div className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">{t('otp_sent_to', { mobile: mobileNumber })}</p>
                <p className="text-xs text-gray-500">{t('enter_otp')}</p>
              </div>

              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                  <span>{displayError}</span>
                  {showModal && (
                    <button type="button" onClick={clearError} className="text-red-600 hover:underline ml-2">
                      {t('dismiss')}
                    </button>
                  )}
                </div>
              )}

              <OtpInput
                onComplete={setOtp}
                onChange={setOtp}
                error={error}
                disabled={loading}
              />

              <div className="text-center space-y-3">
                <Button
                  onClick={() => handleVerifyOtp(otp)}
                  fullWidth
                  disabled={loading || !otp || otp.length !== 6}
                >
                  {loading ? t('verifying') : t('submit')}
                </Button>

                <button
                  type="button"
                  onClick={handleBackToMobile}
                  className="text-sm text-brand-primary hover:underline"
                >
                  {t('change_mobile_number')}
                </button>

                <div className="text-sm text-gray-600">
                  {t('didnt_receive_otp')}{' '}
                  {countdown > 0 ? (
                    <span className="text-gray-400">{t('resend_in', { count: countdown })}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-brand-primary hover:underline font-medium"
                      disabled={loading}
                    >
                      {t('resend_otp')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
