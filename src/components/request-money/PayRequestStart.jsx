import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import Input from '../../Reusable/Input'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'
import THEME_COLORS from '../../theme/colors'

import { sendService } from '../send/send.service'
import requestMoneyService from './requestMoney.service'

const PayRequestStart = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state) => state.auth?.user)
  const balance = useSelector((state) => state.wallet?.balance ?? 0)
  const request = location.state?.request
  const contentCard = THEME_COLORS.contentCard
  const menuGreen = THEME_COLORS.header.background
  const menuGreenHover = THEME_COLORS.sidebar.logoutHoverBackground

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
      t('beneficiary'),
    [request?.req_cust_fname, request?.req_cust_lname, request?.req_cust_mobile, t]
  )

  if (!request?.id) return null

  const amount = Number(request?.amount || 0)
  const remarks = request?.remarks || ''

  const handleContinue = () => {
    if (!amount || amount <= 0) {
      toast.error(t('invalid_request_amount'))
      return
    }
    if (balance > 0 && amount > Number(balance)) {
      toast.error(t('insufficient_balance'))
      return
    }
    setStep('CONFIRM')
  }

  return (
    <MobileScreenContainer>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl font-semibold" style={{ color: contentCard.title }}>
          {t('pay_request')}
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
            {t('beneficiary_name')}: <strong>{beneficiaryName}</strong>
          </div>

          <Input label={t('beneficiary_mobile_number')} value={request?.req_cust_mobile || ''} disabled />
          <Input label={t('amount')} value={amount ? Number(amount).toFixed(2) : '0.00'} disabled />
          <Input label={t('remarks')} value={remarks} disabled />

          <button
            type="button"
            onClick={handleContinue}
            className="w-full px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow"
            style={{ backgroundColor: menuGreen, color: THEME_COLORS.common.white }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = menuGreenHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = menuGreen
            }}
          >
            {t('continue')}
          </button>
        </div>
      </div>

      <ConfirmTransactionPopup
        open={step === 'CONFIRM'}
        amount={amount}
        to={beneficiaryName}
        mobile={request?.req_cust_mobile}
        description={t('paid_request')}
        loading={loading}
        onSendOtp={async () => {
          setLoading(true)
          try {
            await sendService.generateTransactionOtp('MOBILE', senderMobile)
            toast.success(t('otp_sent'))
            setStep('OTP')
          } catch (e) {
            toast.error(e.message || t('failed_to_send_otp'))
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
              remarks: remarks || t('request_payment'),
              entity_type: request?.req_cust_type ?? 'CUST',
            })

            sessionStorage.setItem(
              'payRequestSuccess',
              JSON.stringify({
                ...(data || {}),
                txn_id: data?.txn_id ?? data?.id ?? data?.money_reqid,
                rrn: data?.rrn ?? data?.txn_rrn ?? null,
                amount,
                remarks: remarks || t('request_payment'),
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
            toast.error(e.message || t('payment_failed'))
          } finally {
            setLoading(false)
          }
        }}
        onCancel={() => setStep(null)}
      />
    </MobileScreenContainer>
  )
}

export default PayRequestStart
