import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { HiArrowDownLeft } from 'react-icons/hi2'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import Input from '../../Reusable/Input'
import AmountInput from '../../Reusable/AmountInput'
import { sendService } from '../send/send.service'
import { receiveService } from './receive.service'

const ReceivePage = () => {
  const user = useSelector((state) => state.auth?.user)
  const walletId = useSelector((state) => state.wallet?.walletId)

  const [mobile, setMobile] = useState('')
  const [beneficiary, setBeneficiary] = useState(null)
  const [validating, setValidating] = useState(false)
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestError, setRequestError] = useState('')

  const currentUserId = user?.reg_info?.id ?? user?.reg_info?.user_id ?? user?.user_id ?? user?.id
  const currentUserMobile = (user?.reg_info?.mobile ?? user?.reg_info?.reg_mobile ?? user?.mobile ?? '').toString().trim()

  const handleValidateBeneficiary = async () => {
    const trimmed = mobile.trim()
    if (!trimmed) {
      setRequestError('Please enter beneficiary mobile number')
      return
    }
    setRequestError('')
    setValidating(true)
    try {
      const { data } = await sendService.validateBeneficiary(trimmed)
      const benUserId = data.user_id
      const benMobile = (data.reg_mobile ?? trimmed).toString().trim()
      if (benUserId != null && benUserId === currentUserId) {
        setBeneficiary(null)
        const msg = 'You cannot request money from yourself. Please enter a different mobile number.'
        setRequestError(msg)
        toast.error(msg)
        return
      }
      if (benMobile && currentUserMobile && benMobile === currentUserMobile) {
        setBeneficiary(null)
        const msg = 'You cannot request money from yourself. Please enter a different mobile number.'
        setRequestError(msg)
        toast.error(msg)
        return
      }
      setBeneficiary({
        user_id: data.user_id,
        reg_mobile: data.reg_mobile ?? trimmed,
        reg_email: data.reg_email ?? '',
        first_name: data.first_name ?? '',
        middle_name: data.middle_name ?? null,
        last_name: data.last_name ?? '',
      })
    } catch (err) {
      setBeneficiary(null)
      const msg = err?.message || 'Beneficiary not found. Please check the mobile number.'
      setRequestError(msg)
      toast.error(msg)
    } finally {
      setValidating(false)
    }
  }

  const beneficiaryName = beneficiary
    ? [beneficiary.first_name, beneficiary.middle_name, beneficiary.last_name].filter(Boolean).join(' ') || beneficiary.reg_mobile
    : ''

  const handleRequestMoney = async (e) => {
    e?.preventDefault?.()
    if (!beneficiary) {
      setRequestError('Please validate beneficiary first')
      return
    }
    if (beneficiary.user_id != null && beneficiary.user_id === currentUserId) {
      setRequestError('You cannot request money from yourself. Please enter a different mobile number.')
      toast.error('You cannot request money from yourself.')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setRequestError('Please enter a valid amount')
      return
    }
    setRequestLoading(true)
    setRequestError('')
    try {
      await receiveService.requestMoney(beneficiary.user_id, parseFloat(amount), remarks || '')
      toast.success('Request sent successfully')
      setBeneficiary(null)
      setMobile('')
      setAmount('')
      setRemarks('')
    } catch (err) {
      const msg = err?.message || 'Request money failed'
      setRequestError(msg)
      toast.error(msg)
    } finally {
      setRequestLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark shrink-0">
          Receive Money
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 shrink-0">
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 sm:w-36 sm:h-36 bg-brand-surfaceMuted rounded-xl flex items-center justify-center mb-3">
              <HiArrowDownLeft className="w-12 h-12 text-brand-primary" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Your Wallet ID</p>
            <p className="text-base sm:text-lg font-bold text-brand-dark font-mono break-all text-center">
              {walletId ?? '—'}
            </p>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm sm:text-base font-semibold text-brand-dark mb-3">Share Details</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Name</span>
                <span className="font-medium text-brand-dark truncate max-w-[60%] text-right">
                  {user?.reg_info?.first_name ?? user?.name ?? 'User'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Wallet ID</span>
                <span className="font-medium text-brand-dark font-mono break-all text-right max-w-[60%]">
                  {walletId ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Request Money</h2>
          {requestError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 text-sm">
              {requestError}
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Beneficiary mobile number"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value)
                setBeneficiary(null)
                setRequestError('')
              }}
              placeholder="e.g. +93998877665"
              disabled={!!beneficiary}
            />

            {!beneficiary ? (
              <Button
                onClick={handleValidateBeneficiary}
                disabled={validating || !mobile.trim()}
              >
                {validating ? 'Validating...' : 'Validate beneficiary'}
              </Button>
            ) : (
              <>
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-600">Name</span>
                    <span className="font-medium text-brand-dark text-right">
                      {beneficiaryName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium text-brand-dark text-right truncate max-w-[60%]">
                      {beneficiary.reg_email || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-600">User ID</span>
                    <span className="font-medium text-brand-dark text-right">
                      {beneficiary.user_id}
                    </span>
                  </div>
                </div>

                <AmountInput
                  label="Amount"
                  value={amount}
                  onChange={setAmount}
                />
                <Input
                  label="Remarks (Optional)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Testing SendMoney via Web"
                />
                <div className="flex gap-2">
                  <Button onClick={handleRequestMoney} disabled={requestLoading}>
                    {requestLoading ? 'Sending...' : 'Request Money'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setBeneficiary(null)
                      setMobile('')
                      setAmount('')
                      setRemarks('')
                      setRequestError('')
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

export default ReceivePage
