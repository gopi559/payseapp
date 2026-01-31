import React, { useState, useEffect } from 'react'

import Input from '../Reusable/Input'
import Button from '../Reusable/Button'
import OtpInput from '../Reusable/OtpInput'
import useLogin from '../Hooks/useLogin'

const LoginForm = () => {
  const { sendOtp, verifyOtp, errorMessage, showModal, setShowModal } = useLogin()
  const [mobileNumber, setMobileNumber] = useState('')
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

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setShowModal(false)

    const digitsOnly = mobileNumber.replace(/\D/g, '')
    if (!mobileNumber || digitsOnly.length < 10) {
      setError('Please enter a valid mobile number')
      return
    }

    setLoading(true)
    try {
      const result = await sendOtp(mobileNumber)
      if (result.success) {
        setOtpSent(true)
        setCountdown(60)
        setIsFlipped(true)
      } else {
        setError(result.error || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
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
        setCountdown(60)
        setOtp('')
      } else {
        setError(result.error || 'Failed to resend OTP')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (enteredOtp) => {
    if (!enteredOtp || enteredOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }
    setError('')
    setShowModal(false)
    setLoading(true)
    try {
      const result = await verifyOtp(mobileNumber, enteredOtp)
      if (!result.success) {
        setError(result.error || 'Invalid OTP')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleOtpChange = (enteredOtp) => {
    setOtp(enteredOtp)
  }
  
  const handleBackToMobile = () => {
    setIsFlipped(false)
    setOtp('')
    setError('')
    setShowModal(false)
  }

  const CardHeader = () => (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold text-brand-primary mb-2">Customer Portal</h1>
      <p className="text-gray-700 mb-1">Welcome back</p>
      <p className="text-sm text-brand-primary">Manage Your Money Seamlessly On One Platform</p>
    </div>
  )
  
  return (
    <div className="w-full">
      <div className="relative w-full" style={{ perspective: "1000px" }}>
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
            <CardHeader />
            <form onSubmit={handleSendOtp} className="space-y-6">
              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                  <span>{displayError}</span>
                  {showModal && (
                    <button type="button" onClick={clearError} className="text-red-600 hover:underline ml-2">
                      Dismiss
                    </button>
                  )}
                </div>
              )}
              
              <Input
                label="Mobile Number"
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  let value = e.target.value.trim()
                  value = value.replace(/[^\d+]/g, '')
                  if (value.includes('+')) {
                    value = `+${value.replace(/\+/g, '')}`
                  }
                  const maxLen = value.startsWith('+') ? 16 : 15
                  setMobileNumber(value.slice(0, maxLen))
                }}
                placeholder="e.g. +9711234567890"
                required
                autoFocus
              />
              
              <Button
                type="submit"
                fullWidth
                  disabled={loading || !mobileNumber || mobileNumber.replace(/\D/g, '').length < 10}
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </Button>
              
              <p className="text-center text-sm text-gray-500">
                Enter your registered mobile number (with or without country code)
              </p>
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
            <CardHeader />
            <div className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  OTP sent to <span className="font-semibold text-brand-dark">{mobileNumber}</span>
                </p>
                <p className="text-xs text-gray-500">Enter the 6-digit OTP</p>
              </div>
              
              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                  <span>{displayError}</span>
                  {showModal && (
                    <button type="button" onClick={clearError} className="text-red-600 hover:underline ml-2">
                      Dismiss
                    </button>
                  )}
                </div>
              )}

              <OtpInput
                onComplete={handleOtpChange}
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
                  {loading ? 'Verifying...' : 'Submit'}
                </Button>
                
                <button
                  type="button"
                  onClick={handleBackToMobile}
                  className="text-sm text-brand-primary hover:underline"
                >
                  ← Change Mobile Number
                </button>
                
                <div className="text-sm text-gray-600">
                  Didn't receive OTP?{' '}
                  {countdown > 0 ? (
                    <span className="text-gray-400">Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-brand-primary hover:underline font-medium"
                      disabled={loading}
                    >
                      Resend OTP
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

