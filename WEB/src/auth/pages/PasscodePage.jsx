import React, { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PasscodeInput from '../components/PasscodeInput'
import { authService } from '../auth.service'
import { ROUTES } from '../../config/routes'

const PasscodePage = () => {
  const navigate = useNavigate()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const isPasscodeSet = useSelector((state) => state.auth.isPasscodeSet)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Redirect if not authenticated (should come from login/OTP first)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN)
    }
  }, [isAuthenticated, navigate])
  
  // Redirect if already authenticated and passcode is set
  if (isAuthenticated && isPasscodeSet) {
    return <Navigate to="/customer/home" replace />
  }
  
  const handlePasscodeComplete = async (passcode) => {
    setError('')
    setLoading(true)
    
    try {
      if (!isPasscodeSet) {
        // First time - set passcode
        const result = await authService.setPasscode(passcode)
        if (result.success) {
          navigate('/customer/home')
        }
      } else {
        // Verify passcode
        const result = await authService.verifyPasscode(passcode)
        if (result.success) {
          navigate('/customer/home')
        } else {
          setError(result.error || 'Invalid passcode')
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-surfaceMuted to-brand-surfaceLight flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">🔒</span>
            </div>
            <h1 className="text-2xl font-bold text-brand-dark mb-2">
              {isPasscodeSet ? 'Enter Passcode' : 'Set Passcode'}
            </h1>
            <p className="text-gray-600">
              {isPasscodeSet
                ? 'Enter your 6-digit passcode'
                : 'Create a 6-digit passcode for security'}
            </p>
          </div>
          
          <PasscodeInput
            onComplete={handlePasscodeComplete}
            error={error}
          />
          
          {loading && (
            <p className="text-center text-sm text-gray-500 mt-4">
              {isPasscodeSet ? 'Verifying...' : 'Setting up...'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PasscodePage


