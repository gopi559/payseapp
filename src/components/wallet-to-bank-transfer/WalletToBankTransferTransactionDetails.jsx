import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IoArrowBack, IoInformationCircleOutline } from 'react-icons/io5'
import { HiOutlineBuildingLibrary, HiOutlineWallet, HiOutlineUser } from 'react-icons/hi2'
import { FaClock, FaExchangeAlt, FaFingerprint, FaMoneyBillWave, FaDesktop } from 'react-icons/fa'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import Button from '../../Reusable/Button'
import PAYSEY_LOGO_URL from '../../assets/PayseyPaylogoGreen.png'
import { formatPrintDateTime, openTransactionPrintWindow } from '../../utils/transactionPrint'

const maskAccount = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return null
  return raw.length <= 4 ? raw : `****${raw.slice(-4)}`
}

const WalletToBankTransferTransactionDetails = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('walletToBankTransferSuccess')
      if (!raw) {
        navigate('/customer/home')
        return
      }

      setDetails(JSON.parse(raw))
    } catch {
      navigate('/customer/home')
    }
  }, [navigate])

  if (!details) return null

  const amount = Number(details?.txn_amount ?? details?.amount ?? 0).toFixed(2)

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
            { label: t('transaction_id'), value: details?.txn_id ?? details?.rrn ?? '-' },
            { label: t('rrn'), value: details?.rrn ?? '-' },
            { label: t('external_reference_number'), value: details?.external_ref_num ?? '-' },
            { label: t('transaction_type'), value: details?.txn_type ?? t('wallet_to_bank') },
            { label: t('description'), value: details?.txn_desc ?? t('cash_out') },
            { label: t('date_time'), value: formatPrintDateTime(details?.txn_time ?? new Date().toISOString(), 'en-US') },
            { label: t('amount'), value: amount },
            { label: t('currency'), value: details?.currency ?? details?.gb?.ccy ?? 'AFN' },
            { label: t('channel'), value: details?.channel_type ?? t('channel_web') },
            { label: t('status'), value: t('success') },
            { label: t('remarks'), value: details?.remarks ?? '-' },
          ],
        },
        {
          title: t('sender_details'),
          rows: [
            { label: t('wallet'), value: details?.from ?? t('wallet') },
            { label: t('wallet_number'), value: details?.wallet_no ?? '-' },
          ],
        },
        {
          title: t('receiver_details'),
          rows: [
            { label: t('bank'), value: details?.to_bank_name ?? '-' },
            { label: t('account_number'), value: maskAccount(details?.to_account_number) },
            { label: t('full_name'), value: details?.to_account_holder_name ?? '-' },
          ],
        },
      ],
    })
  }

  return (
    <MobileScreenContainer>
      <div className="min-h-screen bg-[#F5FAF6]">
        <div className="px-4 pt-4 pb-5 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => navigate('/customer/home')}
              className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#357219]"
            >
              <IoArrowBack className="w-[18px] h-[18px]" />
            </button>
            <h1 className="text-xl font-semibold text-[#357219]">{t('transaction_details')}</h1>
          </div>

          <div className="bg-brand-secondary rounded-[22px] p-5 mb-5 text-white shadow-[0_12px_34px_rgba(21,128,61,0.18)]">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl text-brand-secondary">V</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('transaction_completed')}</h2>
            <p className="text-[1.75rem] font-bold mb-3">{amount}</p>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-sm font-medium">{t('money_sent')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[22px] border border-gray-200 p-4 mb-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-secondary rounded flex items-center justify-center">
              <IoInformationCircleOutline className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">{t('transaction_details')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FaFingerprint className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('rrn')}</p>
                <p className="text-sm font-medium text-gray-800 break-all">{details?.rrn ?? '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaExchangeAlt className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('transaction_type')}</p>
                <p className="text-sm font-medium text-gray-800">{details?.txn_type ?? t('wallet_to_bank')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('description')}</p>
                <p className="text-sm font-medium text-gray-800">{details?.txn_desc ?? t('cash_out')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaClock className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('date_time')}</p>
                <p className="text-sm font-medium text-gray-800">{formatPrintDateTime(details?.txn_time ?? new Date().toISOString(), 'en-US')}</p>
              </div>
            </div>

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
                <p className="text-sm font-medium text-gray-800">{details?.channel_type ?? t('channel_web')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[22px] border border-gray-200 p-4 mb-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-secondary rounded flex items-center justify-center">
              <HiOutlineBuildingLibrary className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">{t('sender_details')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HiOutlineBuildingLibrary className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('wallet')}</p>
                <p className="text-sm font-medium text-gray-800">{details?.from ?? t('wallet')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <HiOutlineWallet className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('wallet_number')}</p>
                <p className="text-sm font-medium text-gray-800">{details?.wallet_no ?? '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[22px] border border-gray-200 p-4 mb-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-secondary rounded flex items-center justify-center">
              <HiOutlineWallet className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">{t('receiver_details')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HiOutlineBuildingLibrary className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('bank')}</p>
                <p className="text-sm font-medium text-gray-800">{details?.to_bank_name ?? '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <HiOutlineUser className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('full_name')}</p>
                <p className="text-sm font-medium text-gray-800">{details?.to_account_holder_name ?? '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <HiOutlineBuildingLibrary className="w-5 h-5 text-brand-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{t('account_number')}</p>
                <p className="text-sm font-medium text-gray-800 font-mono">{maskAccount(details?.to_account_number) ?? '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <Button
            onClick={handleDownloadPdf}
            variant="outline"
            fullWidth
            className="border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white"
          >
            {t('download_pdf')}
          </Button>
        </div>

        <Button
          onClick={() => {
            sessionStorage.removeItem('walletToBankTransferSuccess')
            sessionStorage.removeItem('walletToBankTransferAccount')
            navigate('/customer/home')
          }}
          fullWidth
        >
          {t('done')}
        </Button>
        </div>
      </div>
    </MobileScreenContainer>
  )
}

export default WalletToBankTransferTransactionDetails
