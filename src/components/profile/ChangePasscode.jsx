import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import PasscodeInput from '../../Login/PasscodeInput'
import Button from '../../Reusable/Button'
import { ROUTES } from '../../config/routes'
import { authService } from '../../Login/auth.service'

const ChangePasscode = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: old passcode, 2: new passcode, 3: confirm
  const [oldPasscode, setOldPasscode] = useState('')
  const [newPasscode, setNewPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleOldPasscode = async (passcode) => {
    setLoading(true)
    const result = await authService.verifyPasscode(passcode)
    setLoading(false)
    
    if (result.success) {
      setOldPasscode(passcode)
      setStep(2)
      setError('')
    } else {
      setError('Incorrect passcode')
    }
  }
  
  const handleNewPasscode = (passcode) => {
    setNewPasscode(passcode)
    setStep(3)
    setError('')
  }
  
  const handleConfirmPasscode = async (passcode) => {
    if (passcode !== newPasscode) {
      setError('Passcodes do not match')
      return
    }
    
    setLoading(true)
    const result = await authService.setPasscode(passcode)
    setLoading(false)
    
    if (result.success) {
      navigate(ROUTES.PROFILE)
    } else {
      setError('Failed to update passcode')
    }
  }
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Change Passcode</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          {step === 1 && (
            <div>
              <p className="text-gray-600 mb-6 text-center">Enter your current passcode</p>
              <PasscodeInput onComplete={handleOldPasscode} error={error} />
              {loading && <p className="text-center text-sm text-gray-500 mt-4">Verifying...</p>}
            </div>
          )}
          
          {step === 2 && (
            <div>
              <p className="text-gray-600 mb-6 text-center">Enter your new passcode</p>
              <PasscodeInput onComplete={handleNewPasscode} error={error} />
            </div>
          )}
          
          {step === 3 && (
            <div>
              <p className="text-gray-600 mb-6 text-center">Confirm your new passcode</p>
              <PasscodeInput onComplete={handleConfirmPasscode} error={error} />
              {loading && <p className="text-center text-sm text-gray-500 mt-4">Updating...</p>}
            </div>
          )}
        </div>
        
        <Button
          onClick={() => navigate(ROUTES.PROFILE)}
          variant="outline"
          fullWidth
          className="mt-6"
        >
          Cancel
        </Button>
      </div>
    </PageContainer>
  )
}

export default ChangePasscode


