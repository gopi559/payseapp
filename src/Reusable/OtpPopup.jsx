import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import OtpInput from './OtpInput'
import Button from './Button'
import { HiX, HiCheckCircle } from 'react-icons/hi'

/**
 * Reusable OTP Popup Component
 * 
 * @param {boolean} isOpen - Controls popup visibility
 * @param {function} onClose - Callback when popup closes
 * @param {function} onVerify - Async function that verifies OTP and completes transaction
 * @param {function} onSendOtp - Async function that sends OTP
 * @param {string} mobileNumber - Mobile number to display (where OTP is sent)
 * @param {string} title - Optional title for the popup
 * @param {string} successMessage - Optional success message (default: "Transaction successful!")
 */
const OtpPopup = ({
  isOpen,
  onClose,
  onVerify,
  onSendOtp,
  mobileNumber = '',
  title = 'Enter OTP',
  successMessage = 'Transaction successful!',
}) => {
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Reset state when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      setOtp('')
      setOtpError('')
      setOtpSent(false)
      setShowSuccess(false)
      // Auto-send OTP when popup opens
      if (onSendOtp) {
        const sendOtp = async () => {
          setSendingOtp(true)
          setOtpError('')
          try {
            await onSendOtp()
            setOtpSent(true)
            setOtp('')
            toast.success('OTP sent successfully')
          } catch (err) {
            const msg = err?.message || 'Failed to send OTP. Please try again.'
            setOtpError(msg)
            toast.error(msg)
          } finally {
            setSendingOtp(false)
          }
        }
        sendOtp()
      }
    } else {
      // Reset all state when closing
      setOtp('')
      setOtpError('')
      setOtpSent(false)
      setShowSuccess(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleSendOtp = async () => {
    if (!onSendOtp) return
    setSendingOtp(true)
    setOtpError('')
    try {
      await onSendOtp()
      setOtpSent(true)
      setOtp('')
      toast.success('OTP sent successfully')
    } catch (err) {
      const msg = err?.message || 'Failed to send OTP. Please try again.'
      setOtpError(msg)
      toast.error(msg)
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter the 6-digit OTP')
      return
    }
    if (!onVerify) {
      setOtpError('Verification function not provided')
      return
    }
    setLoading(true)
    setOtpError('')
    try {
      await onVerify(otp)
      // Show success message
      setShowSuccess(true)
      toast.success(successMessage)
      // Auto-close after 1.5 seconds
      setTimeout(() => {
        setShowSuccess(false)
        if (onClose) {
          onClose(true) // Pass true to indicate success
        }
      }, 1500)
    } catch (err) {
      const msg = err?.message || 'Invalid or expired OTP. Please try again.'
      setOtpError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading && !sendingOtp) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            disabled={loading || sendingOtp}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <HiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {showSuccess ? (
            // Success State
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <HiCheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Success!</h3>
              <p className="text-gray-600">{successMessage}</p>
            </div>
          ) : (
            <>
              {/* OTP Info */}
              {mobileNumber && (
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 mb-6">
                  <p className="text-sm text-gray-600">
                    {otpSent ? (
                      <>
                        OTP sent to <span className="font-medium text-gray-800">{mobileNumber}</span>
                      </>
                    ) : (
                      <>
                        Sending OTP to <span className="font-medium text-gray-800">{mobileNumber}</span>...
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* OTP Input */}
              <div className="mb-6">
                <OtpInput
                  length={6}
                  onChange={setOtp}
                  error={otpError}
                  disabled={loading || sendingOtp || !otpSent}
                />
              </div>

              {/* Error Message */}
              {otpError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {otpError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!otpSent ? (
                  <Button
                    onClick={handleSendOtp}
                    fullWidth
                    disabled={sendingOtp}
                  >
                    {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleVerify}
                    fullWidth
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify & Confirm'}
                  </Button>
                )}
                <Button
                  onClick={handleClose}
                  variant="outline"
                  fullWidth
                  disabled={loading || sendingOtp}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default OtpPopup

