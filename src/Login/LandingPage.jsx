import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Input from '../Reusable/Input'
import MobileInput from '../Reusable/MobileInput'
import Button from '../Reusable/Button'
import logoImage from '../assets/Paysey Payment Logo white.png'
import Lottie from 'lottie-react'
import illustrationData from '../assets/login-illstration-payse.json'

const LandingPage = () => {
  const navigate = useNavigate()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const [mobileNumber, setMobileNumber] = useState('+93')
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/customer/home" replace />
  }

  const handleContinue = (e) => {
    e.preventDefault()
    setError('')
    const digitsOnly = (mobileNumber || '').replace(/\D/g, '')
    if (!mobileNumber || digitsOnly.length < 10) {
      setError('Please enter a valid mobile number')
      return
    }
    // Ensure +93 prefix is included
    const finalMobile = mobileNumber.startsWith('+93') ? mobileNumber : `+93${mobileNumber.replace(/^\+?\d+/, '').replace(/\D/g, '')}`
    navigate('/', { state: { mobile: finalMobile.trim() } })
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-primary via-brand-action to-brand-surface relative overflow-hidden">
        <div className="absolute top-8 left-8 z-10">
          <img src={logoImage} alt="Paysey Payment Logo" className="h-12 w-auto" />
        </div>
        <div className="flex items-center justify-center w-full h-full p-8">
          <div className="w-full max-w-lg">
            <Lottie
              animationData={illustrationData}
              loop
              autoplay
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-brand-surfaceMuted flex items-center justify-center px-4 py-8 relative">
        <div className="lg:hidden absolute top-4 left-4 z-10">
          <img src={logoImage} alt="Paysey Payment Logo" className="h-10 w-auto" />
        </div>

        <div className="w-full max-w-md relative z-0">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-brand-primary mb-2">Customer Portal</h1>
            <p className="text-gray-700 mb-1">Welcome</p>
            <p className="text-sm text-brand-primary">
              Manage Your Money Seamlessly On One Platform
            </p>
          </div>

          <form onSubmit={handleContinue} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <MobileInput
              label="Mobile Number"
              value={mobileNumber}
              onChange={(e) => {
                setMobileNumber(e.target.value)
              }}
              placeholder="e.g. 998877665"
              required
              autoFocus
            />
            <Button type="submit" fullWidth disabled={!mobileNumber || mobileNumber.replace(/\D/g, '').length < 10}>
              Continue
            </Button>
            <p className="text-center text-sm text-gray-500">
              Enter your registered mobile number. You will verify with OTP on the next screen.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
