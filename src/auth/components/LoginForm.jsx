import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../shared/components/Input'
import Button from '../../shared/components/Button'
import OtpInput from '../../shared/components/OtpInput'
import { authService } from '../auth.service'
import { ROUTES } from '../../config/routes'

const LoginForm = () => {
  const navigate = useNavigate()
  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [isFlipped, setIsFlipped] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  // Countdown timer for resend OTP
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])
  
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate mobile number
    if (!mobileNumber || mobileNumber.length < 10) {
      setError('Please enter a valid mobile number')
      return
    }
    
    setLoading(true)
    
    try {
      const result = await authService.sendOtp(mobileNumber)
      
      if (result.success) {
        setOtpSent(true)
        setCountdown(60) // 60 seconds countdown
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
    setLoading(true)
    
    try {
      const result = await authService.sendOtp(mobileNumber)
      
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
    setLoading(true)
    
    try {
      const result = await authService.verifyOtp(mobileNumber, enteredOtp)
      
      if (result.success) {
        navigate(ROUTES.PASSCODE)
      } else {
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
    // Don't auto-submit - user must click Submit button
  }
  
  const handleBackToMobile = () => {
    setIsFlipped(false)
    setOtp('')
    setError('')
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
        {/* Flip Card Container */}
        <div
          className="relative w-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front Side - Mobile Number Card */}
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
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <Input
                label="Mobile Number"
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setMobileNumber(value)
                }}
                placeholder="Enter your mobile number"
                required
                autoFocus
              />
              
              <Button
                type="submit"
                fullWidth
                disabled={loading || !mobileNumber || mobileNumber.length < 10}
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </Button>
              
              <p className="text-center text-sm text-gray-500">
                Demo: Enter any 10-digit mobile number
              </p>
            </form>
          </div>

          {/* Back Side - OTP Card */}
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
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
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

