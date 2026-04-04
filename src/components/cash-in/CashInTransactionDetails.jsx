import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { IoArrowBack, IoInformationCircleOutline } from 'react-icons/io5'
import { HiOutlineUser, HiOutlinePhone, HiOutlineCreditCard, HiOutlineBuildingOffice } from 'react-icons/hi2'
import { FaFingerprint, FaExchangeAlt, FaClock, FaMoneyBillWave, FaDesktop } from 'react-icons/fa'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import Button from '../../Reusable/Button'
import PAYSEY_LOGO_URL from '../../assets/PayseyPaylogoGreen.png'
import { formatPrintDateTime, openTransactionPrintWindow } from '../../utils/transactionPrint'
import cashInService from './cashIn.service'

const firstFilled = (...values) => {
  for (const value of values) {
    if (value == null) continue
    const text = String(value).trim()
    if (text && text !== '-' && text.toUpperCase() !== 'N/A') return value
  }
  return null
}

const getPrimaryEntry = (value) => (Array.isArray(value) ? value[0] ?? null : value ?? null)

const formatMaskedCard = (value) => {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  if (raw.includes('*') || raw.includes('X')) return raw

  const digits = raw.replace(/\D/g, '')
  if (digits.length < 8) return raw

  return `${digits.slice(0, 4)} **** **** ${digits.slice(-4)}`
}

const getDisplayName = (entry) =>
  firstFilled(
    entry?.cardholder_name,
    entry?.name_on_card,
    entry?.card_name,
    [entry?.first_name, entry?.middle_name, entry?.last_name].filter(Boolean).join(' ').trim(),
    entry?.customer_name,
    entry?.name
  )

const getDisplayMobile = (entry) =>
  firstFilled(entry?.mobile_number, entry?.mobile_no, entry?.cust_mobile, entry?.reg_mobile, entry?.phone)

const getDisplayAccount = (entry) =>
  firstFilled(entry?.account_number, entry?.acct_number, entry?.wallet_number, entry?.account_no, entry?.user_ref)

const CashInTransactionDetails = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)
  const walletId = useSelector((state) => state.wallet?.walletId)
  const [details, setDetails] = useState(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('cashInSuccess')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setDetails(parsed)

        const rrn = parsed?.rrn
        if (!rrn) return

        cashInService.fetchTransactionByRrn(rrn)
          .then(({ data }) => {
            if (!data) return
            const merged = { ...parsed, ...data }
            setDetails(merged)
            sessionStorage.setItem('cashInSuccess', JSON.stringify(merged))
          })
          .catch(() => {})
      } catch (_) {
        setDetails({})
      }
    } else {
      navigate('/customer/home')
    }
  }, [navigate])

  if (!details) return null

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-'
    try {
      const date = new Date(dateTimeStr)
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return dateTimeStr
    }
  }

  const regInfo = user?.reg_info || user
  const userKyc = user?.user_kyc || null
  const debitDetails = getPrimaryEntry(details?.debit_details)
  const creditDetails = getPrimaryEntry(details?.credit_details)

  const fallbackReceiverName = userKyc?.first_name || userKyc?.last_name
    ? [userKyc.first_name, userKyc.middle_name, userKyc.last_name].filter(Boolean).join(' ')
    : regInfo?.first_name || regInfo?.name || t('user')
  const fallbackReceiverMobile = regInfo?.mobile ?? regInfo?.reg_mobile ?? user?.mobile ?? ''
  const fallbackReceiverAccountNumber = walletId || regInfo?.user_ref || regInfo?.acct_number || null

  const amountValue = firstFilled(details?.txn_amount, details?.amount, details?.txnAmount)
  const amount = amountValue != null ? Number(amountValue).toFixed(2) : '0.00'
  const rrn = details?.rrn ?? ''
  const txnTime = details?.txn_time ?? details?.created_at ?? ''
  const txnType = details?.txn_type ?? 'CARD_TO_WALLET'
  const txnDesc = details?.txn_desc ?? details?.txn_short_desc ?? t('card_to_wallet')
  const channel = details?.channel_type ?? details?.channel ?? 'WEB'

  const senderCardNumber = firstFilled(
    details?.from_card_number,
    details?.card_number,
    details?.from_card,
    debitDetails?.masked_card,
    debitDetails?.card_number,
    debitDetails?.card_no
  )
  const maskedSenderCard = formatMaskedCard(senderCardNumber)
  const senderCardName = firstFilled(
    details?.from_card_name,
    details?.card_name,
    details?.display_cardholder_name,
    getDisplayName(debitDetails)
  )
  const senderMobile = getDisplayMobile(debitDetails)
  const senderAccountNumber = getDisplayAccount(debitDetails)

  const receiverName = firstFilled(getDisplayName(creditDetails), details?.to, fallbackReceiverName)
  const receiverMobile = firstFilled(
    details?.beneficiary_mobile,
    getDisplayMobile(creditDetails),
    fallbackReceiverMobile
  )
  const receiverCardNumber = formatMaskedCard(firstFilled(creditDetails?.masked_card, creditDetails?.card_number, creditDetails?.card_no))
  const receiverAccountNumber = firstFilled(
    details?.receiver_account_number,
    getDisplayAccount(creditDetails),
    fallbackReceiverAccountNumber
  )

  const handleDownloadPdf = () => {
    openTransactionPrintWindow({
      title: `${t('transaction_details')} ${details?.txn_id ?? ''}`,
      pageTitle: t('transaction_details'),
      logoUrl: PAYSEY_LOGO_URL,
      popupMessage: t('please_allow_popups_to_download_pdf'),
      sections: [
        {
          title: t('transaction_details'),
          rows: [
            { label: t('transaction_id'), value: details?.txn_id ?? '-' },
            { label: t('rrn'), value: details?.rrn ?? '-' },
            { label: t('transaction_type'), value: details?.txn_type ?? 'CARD_TO_WALLET' },
            { label: t('description'), value: details?.txn_desc ?? details?.txn_short_desc ?? t('card_to_wallet') },
            { label: t('date_time'), value: formatPrintDateTime(details?.txn_time ?? details?.created_at ?? '', 'en-US') },
            { label: t('amount'), value: details?.txn_amount != null ? `${Number(details.txn_amount).toFixed(2)}` : '0.00' },
            { label: t('channel'), value: details?.channel_type ?? 'WEB' },
            { label: t('status'), value: details?.status === 1 ? t('success') : String(details?.status ?? 'SUCCESS') },
            { label: t('fee_amount'), value: details?.fee_amount != null ? `${Number(details.fee_amount).toFixed(2)}` : '0.00' },
            { label: t('remarks'), value: details?.remarks ?? '-' },
          ],
        },
        {
          title: t('debit_details'),
          rows: [
            { label: t('card_number'), value: maskedSenderCard },
            { label: t('card_name'), value: senderCardName },
            { label: t('mobile_number_label'), value: senderMobile },
            { label: t('account_number'), value: senderAccountNumber },
          ].filter((row) => firstFilled(row.value)),
        },
        {
          title: t('credit_details'),
          rows: [
            { label: t('name'), value: receiverName },
            { label: t('mobile_number_label'), value: receiverMobile },
            { label: t('card_number'), value: receiverCardNumber },
            { label: t('account_number'), value: receiverAccountNumber },
          ].filter((row) => firstFilled(row.value)),
        },
      ],
    })
  }

  const handleDone = () => {
    sessionStorage.removeItem('cashInSuccess')
    navigate('/customer/home')
  }

  return (
    <MobileScreenContainer>
      <div className="bg-brand-secondary text-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/customer/home')}
          className="text-white hover:opacity-80 transition-opacity"
        >
          <IoArrowBack className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold flex-1">{t('transaction_details')}</h1>
        <button className="text-white hover:opacity-80 transition-opacity">
          <IoInformationCircleOutline className="w-6 h-6" />
        </button>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="bg-brand-secondary rounded-2xl p-6 mb-6 text-white">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl text-brand-secondary">V</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('transaction_completed')}</h2>
            <p className="text-3xl font-bold mb-4">{amount}</p>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm font-medium">{t('money_added')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-secondary rounded flex items-center justify-center">
              <IoInformationCircleOutline className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{t('transaction_details')}</h3>
          </div>

          <div className="space-y-3">
            {rrn && (
              <div className="flex items-start gap-3">
                <FaFingerprint className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('rrn')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{rrn}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <FaExchangeAlt className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('transaction_type')}</p>
                <p className="text-sm font-medium text-gray-800">{txnType}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('description')}</p>
                <p className="text-sm font-medium text-gray-800">{txnDesc}</p>
              </div>
            </div>

            {txnTime && (
              <div className="flex items-start gap-3">
                <FaClock className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('date_time')}</p>
                  <p className="text-sm font-medium text-gray-800">{formatDateTime(txnTime)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <FaMoneyBillWave className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('amount')}</p>
                <p className="text-sm font-medium text-gray-800">{amount}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaDesktop className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('channel')}</p>
                <p className="text-sm font-medium text-gray-800">{channel}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-secondary rounded flex items-center justify-center">
              <HiOutlineCreditCard className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{t('sender_details')}</h3>
          </div>

          <div className="space-y-3">
            {maskedSenderCard && (
              <div className="flex items-start gap-3">
                <HiOutlineCreditCard className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('card_number')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{maskedSenderCard}</p>
                </div>
              </div>
            )}

            {senderCardName && (
              <div className="flex items-start gap-3">
                <HiOutlineUser className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('card_name')}</p>
                  <p className="text-sm font-medium text-gray-800">{senderCardName}</p>
                </div>
              </div>
            )}

            {senderMobile && (
              <div className="flex items-start gap-3">
                <HiOutlinePhone className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('mobile_number_label')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{senderMobile}</p>
                </div>
              </div>
            )}

            {senderAccountNumber && (
              <div className="flex items-start gap-3">
                <HiOutlineBuildingOffice className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('account_number')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{senderAccountNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-secondary rounded flex items-center justify-center">
              <HiOutlineUser className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{t('receiver_details')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HiOutlineUser className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('name')}</p>
                <p className="text-sm font-medium text-gray-800">{receiverName}</p>
              </div>
            </div>

            {receiverMobile && (
              <div className="flex items-start gap-3">
                <HiOutlinePhone className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('mobile_number_label')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{receiverMobile}</p>
                </div>
              </div>
            )}

            {receiverCardNumber && (
              <div className="flex items-start gap-3">
                <HiOutlineCreditCard className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('card_number')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{receiverCardNumber}</p>
                </div>
              </div>
            )}

            {receiverAccountNumber && (
              <div className="flex items-start gap-3">
                <HiOutlineBuildingOffice className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{t('account_number')}</p>
                  <p className="text-sm font-medium text-gray-800 font-mono">{receiverAccountNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <Button
            onClick={handleDownloadPdf}
            variant="outline"
            fullWidth
            className="border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white"
          >
            {t('download_pdf')}
          </Button>
        </div>

        <div>
          <Button onClick={handleDone} fullWidth size="md">
            {t('done')}
          </Button>
        </div>
      </div>
    </MobileScreenContainer>
  )
}

export default CashInTransactionDetails
