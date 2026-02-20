import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import PasscodeInput from '../../Login/PasscodeInput'
import Button from '../../Reusable/Button'
import authService from '../../Login/auth.service.jsx'
import THEME_COLORS from '../../theme/colors'

const ChangePasscode = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [newPasscode, setNewPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const contentCard = THEME_COLORS.contentCard

  const handleOldPasscode = async (passcode) => {
    setLoading(true)
    const result = await authService.verifyPasscode(passcode)
    setLoading(false)

    if (result.success) {
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
      navigate('/customer/profile')
    } else {
      setError('Failed to update passcode')
    }
  }

  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold mb-6" style={{ color: contentCard.title }}>Change Passcode</h1>

        <div
          className="rounded-xl shadow-sm p-6"
          style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}
        >
          {step === 1 && (
            <div>
              <p className="mb-6 text-center" style={{ color: contentCard.subtitle }}>Enter your current passcode</p>
              <PasscodeInput onComplete={handleOldPasscode} error={error} />
              {loading && <p className="text-center text-sm mt-4" style={{ color: contentCard.subtitle }}>Verifying...</p>}
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="mb-6 text-center" style={{ color: contentCard.subtitle }}>Enter your new passcode</p>
              <PasscodeInput onComplete={handleNewPasscode} error={error} />
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="mb-6 text-center" style={{ color: contentCard.subtitle }}>Confirm your new passcode</p>
              <PasscodeInput onComplete={handleConfirmPasscode} error={error} />
              {loading && <p className="text-center text-sm mt-4" style={{ color: contentCard.subtitle }}>Updating...</p>}
            </div>
          )}
        </div>

        <Button
          onClick={() => navigate('/customer/profile')}
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
