import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import PageContainer from '../../Reusable/PageContainer'
import Input from '../../Reusable/Input'
import Button from '../../Reusable/Button'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'
import THEME_COLORS from '../../theme/colors'

import { sendService } from '../send/send.service'
import requestMoneyService from './requestMoney.service'

const PayRequestStart = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state) => state.auth?.user)
  const balance = useSelector((state) => state.wallet?.balance ?? 0)
  const request = location.state?.request
  const contentCard = THEME_COLORS.contentCard

  const senderMobile =
    user?.reg_info?.mobile ??
    user?.reg_info?.reg_mobile ??
    user?.mobile ??
    ''

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(null)

  useEffect(() => {
    if (!request?.id) {
      navigate('/customer/request-money/received', { replace: true })
    }
  }, [navigate, request?.id])

  const beneficiaryName = useMemo(
    () =>
      [request?.req_cust_fname, request?.req_cust_lname].filter(Boolean).join(' ').trim() ||
      request?.req_cust_mobile ||
      'Beneficiary',
    [request?.req_cust_fname, request?.req_cust_lname, request?.req_cust_mobile]
  )

  if (!request?.id) return null

  const amount = Number(request?.amount || 0)
  const remarks = request?.remarks || ''

  const handleContinue = () => {
    if (!amount || amount <= 0) return toast.error('Invalid request amount')
    if (balance > 0 && amount > Number(balance)) return toast.error('Insufficient balance')
    setStep('CONFIRM')
  }

  return (
    <PageContainer>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl font-semibold" style={{ color: contentCard.title }}>
          Pay Request
        </h1>

        <div className="space-y-3">
          <div
            className="text-sm p-3 rounded"
            style={{
              backgroundColor: contentCard.background,
              border: `1px solid ${contentCard.border}`,
              color: contentCard.subtitle,
            }}
          >
            Beneficiary Name: <strong>{beneficiaryName}</strong>
          </div>

          <Input label="Beneficiary Mobile Number" value={request?.req_cust_mobile || ''} disabled />
          <Input label="Amount" value={amount ? Number(amount).toFixed(2) : '0.00'} disabled />
          <Input label="Remarks" value={remarks} disabled />

          <Button type="button" fullWidth onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>

      <ConfirmTransactionPopup
        open={step === 'CONFIRM'}
        amount={amount}
        to={beneficiaryName}
        mobile={request?.req_cust_mobile}
        description="Paid Request"
        loading={loading}
        onSendOtp={async () => {
          setLoading(true)
          try {
            await sendService.generateTransactionOtp('MOBILE', senderMobile)
            toast.success('OTP sent')
            setStep('OTP')
          } catch (e) {
            toast.error(e.message || 'Failed to send OTP')
          } finally {
            setLoading(false)
          }
        }}
        onCancel={() => setStep(null)}
      />

      <OtpPopup
        open={step === 'OTP'}
        loading={loading}
        length={6}
        onConfirm={async (otp) => {
          setLoading(true)
          try {
            await sendService.verifyTransactionOtp('MOBILE', senderMobile, otp)

            const { data } = await requestMoneyService.payRequestMoney({
              money_reqid: request.id,
              amount,
              remarks: remarks || 'Request Payment',
            })

            sessionStorage.setItem(
              'payRequestSuccess',
              JSON.stringify({
                ...(data || {}),
                txn_id: data?.txn_id ?? data?.id ?? data?.money_reqid,
                rrn: data?.rrn ?? data?.txn_rrn ?? null,
                amount,
                remarks: remarks || 'Request Payment',
                beneficiary_name: beneficiaryName,
                beneficiary_mobile: request?.req_cust_mobile,
                txn_time: data?.txn_time ?? data?.last_modified_on ?? new Date().toISOString(),
                channel_type: data?.channel_type ?? 'WEB',
                flow_type: 'PAID_REQUEST',
              })
            )

            setStep(null)
            navigate('/customer/send/success')
          } catch (e) {
            toast.error(e.message || 'Payment failed')
          } finally {
            setLoading(false)
          }
        }}
        onCancel={() => setStep(null)}
      />
    </PageContainer>
  )
}

export default PayRequestStart
