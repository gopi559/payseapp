import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import Input from '../../Reusable/Input'
import AmountInput from '../../Reusable/AmountInput'
import Button from '../../Reusable/Button'
import { sendService } from './send.service'

const SendStart = () => {
  const navigate = useNavigate()
  const balance = useSelector((state) => state.wallet?.balance ?? 0)
  const [mobile, setMobile] = useState('')
  const [beneficiary, setBeneficiary] = useState(null)
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')
  const [validating, setValidating] = useState(false)

  const handleValidate = async () => {
    const trimmed = mobile.trim()
    if (!trimmed) {
      setError('Please enter beneficiary mobile number')
      return
    }
    setError('')
    setValidating(true)
    try {
      const { data } = await sendService.validateBeneficiary(trimmed)
      setBeneficiary({
        user_id: data.user_id,
        reg_mobile: data.reg_mobile ?? trimmed,
        first_name: data.first_name ?? '',
        middle_name: data.middle_name ?? null,
        last_name: data.last_name ?? '',
      })
    } catch (err) {
      setBeneficiary(null)
      const msg = err?.message || 'Beneficiary not found. Please check the mobile number.'
      setError(msg)
      toast.error(msg)
    } finally {
      setValidating(false)
    }
  }

  const beneficiaryName = beneficiary
    ? [beneficiary.first_name, beneficiary.middle_name, beneficiary.last_name].filter(Boolean).join(' ') || beneficiary.reg_mobile
    : ''

  const handleContinue = () => {
    if (!beneficiary) {
      setError('Please validate beneficiary first')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (balance > 0 && parseFloat(amount) > balance) {
      setError('Insufficient balance')
      return
    }
    sessionStorage.setItem('sendData', JSON.stringify({
      beneficiary: { ...beneficiary, displayName: beneficiaryName },
      amount,
      remarks,
    }))
    navigate('/customer/send/confirm')
  }

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark mb-4 sm:mb-6">Send Money</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-5">
            <Input
              label="Beneficiary mobile number"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value)
                setBeneficiary(null)
                setError('')
              }}
              placeholder="e.g. +93998877665"
              disabled={!!beneficiary}
            />

            {!beneficiary ? (
              <Button onClick={handleValidate} fullWidth size="md" disabled={validating || !mobile.trim()}>
                {validating ? 'Validating...' : 'Validate beneficiary'}
              </Button>
            ) : (
              <>
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm">
                  <span className="text-gray-500">Beneficiary: </span>
                  <span className="font-medium text-brand-dark">{beneficiaryName}</span>
                </div>

                <AmountInput
                  label="Amount"
                  value={amount}
                  onChange={setAmount}
                  maxAmount={balance > 0 ? balance : undefined}
                />

                <Input
                  label="Remarks (Optional)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Testing SendMoney via Web"
                />

                <div className="pt-2 flex gap-2">
                  <Button onClick={handleContinue} fullWidth size="md">
                    Continue
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setBeneficiary(null)
                      setMobile('')
                      setAmount('')
                      setRemarks('')
                      setError('')
                    }}
                  >
                    Change
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default SendStart

