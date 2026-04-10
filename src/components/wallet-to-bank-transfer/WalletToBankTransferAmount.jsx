import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { HiOutlineBuildingLibrary, HiOutlineWallet } from 'react-icons/hi2'
import { IoArrowBack, IoArrowDownCircle } from 'react-icons/io5'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import Button from '../../Reusable/Button'
import AmountInput from '../../Reusable/AmountInput'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import PinPopup from '../../Reusable/PinPopup'
import walletToBankTransferService from './walletToBankTransfer.service'

const formatBalance = (value) => {
  const amount = Number(value || 0)
  if (Number.isNaN(amount)) return '0.00'
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const maskAccountNumber = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return '----'
  return raw.length <= 4 ? raw : `**${raw.slice(-4)}`
}

const normalizeWalletNumber = (value) => String(value || '').replace(/[^\d]/g, '').trim()

const WalletToBankTransferAmount = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const walletBalance = useSelector((state) => state.wallet?.balance ?? 0)
  const walletId = useSelector((state) => state.wallet?.walletId ?? '')
  const walletNumber = normalizeWalletNumber(walletId)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [pinPopupOpen, setPinPopupOpen] = useState(false)
  const [confirmData, setConfirmData] = useState(null)
  const [pendingTransferData, setPendingTransferData] = useState(null)

  const selectedAccount = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('walletToBankTransferAccount') || 'null')
    } catch {
      return null
    }
  }, [])
  const beneficiaryWalletNumber = normalizeWalletNumber(selectedAccount?.accountNumber)

  const handleContinue = () => {
    if (!selectedAccount) {
      toast.error(t('please_add_bank_account_first'))
      navigate('/customer/wallet-to-bank-transfer')
      return
    }

    if (!amount || Number(amount) <= 0) {
      toast.error(t('please_enter_valid_amount'))
      return
    }

    const preparedPreview = {
      account: selectedAccount,
      amount,
      walletNo: beneficiaryWalletNumber || walletNumber,
      currency: 'AFN',
      remarks: t('web_gb_push_remarks'),
      authData: '',
    }

    setPendingTransferData(preparedPreview)
    setConfirmData(preparedPreview)
  }

  const handleOpenPinPopup = () => {
    if (!pendingTransferData) return
    setConfirmData(null)
    setPinPopupOpen(true)
  }

  const handlePinConfirm = async (pinValue) => {
    if (!pinValue || pinValue.length !== 4) {
      toast.error(t('enter_wallet_pin'))
      return
    }

    setPinPopupOpen(false)
    setLoading(true)
    try {
      const baseTransfer = pendingTransferData || {
        account: selectedAccount,
        amount,
        walletNo: beneficiaryWalletNumber || walletNumber,
        currency: 'AFN',
        remarks: t('web_gb_push_remarks'),
        authData: '',
      }

      const preparedTransfer = {
        ...baseTransfer,
        pin: pinValue,
        wallet_no: beneficiaryWalletNumber || walletNumber,
      }

      sessionStorage.setItem('walletToBankTransferData', JSON.stringify(preparedTransfer))
      await handleSubmitTransfer(preparedTransfer)
    } catch (error) {
      toast.error(error?.message || t('bank_transfer_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTransfer = async (transferData = confirmData) => {
    if (!transferData) return

    try {
      const { data } = await walletToBankTransferService.submitBankTransferPush({
        pin: transferData.pin,
        wallet_no: transferData.wallet_no || transferData.walletNo || beneficiaryWalletNumber || walletNumber,
        amount: transferData.amount,
        currency: transferData.currency,
        remarks: transferData.remarks,
        auth_data: transferData.authData,
      })

      const rrn = data?.rrn
      let fetchedTransaction = null

      if (rrn) {
        try {
          const { data: rrnData } = await walletToBankTransferService.fetchTransactionByRrn(rrn)
          fetchedTransaction = rrnData
        } catch {}
      }

      const successPayload = {
        ...(fetchedTransaction || {}),
        rrn: data?.rrn,
        txn_id: data?.txn_id || data?.rrn,
        txn_amount: data?.amount ?? transferData.amount,
        amount: data?.amount ?? transferData.amount,
        txn_time: new Date().toISOString(),
        txn_type: t('wallet_to_bank'),
        txn_desc: t('cash_out'),
        channel_type: t('channel_web'),
        status: 1,
        wallet_no: data?.wallet_no || transferData.wallet_no || transferData.walletNo || beneficiaryWalletNumber || walletNumber,
        external_ref_num: data?.external_ref_num || transferData.external_ref_num,
        to_bank_name: transferData.account?.bankName,
        to_account_number: transferData.account?.accountNumber,
        to_account_holder_name: transferData.account?.accountHolderName,
        from: t('wallet'),
        currency: transferData.currency || 'AFN',
        gb: data?.gb || {},
        remarks: transferData.remarks,
      }

      sessionStorage.setItem('walletToBankTransferSuccess', JSON.stringify(successPayload))
      sessionStorage.removeItem('walletToBankTransferData')
      setConfirmData(null)
      setPendingTransferData(null)
      toast.success(t('cash_out_successful'))
      navigate('/customer/wallet-to-bank-transfer/success')
    } catch (error) {
      toast.error(error?.message || t('bank_transfer_failed'))
    } finally {
      setLoading(false)
    }
  }

  if (!selectedAccount) return null

  return (
    <MobileScreenContainer>
      <div className="min-h-full bg-[#F5FAF6]">
        <div className="px-4 pt-4 pb-5 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => navigate('/customer/wallet-to-bank-transfer')}
              className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#357219]"
              aria-label={t('go_back')}
            >
              <IoArrowBack size={18} />
            </button>
            <h1 className="text-xl font-semibold text-[#357219]">{t('cash_out')}</h1>
          </div>

          <h2 className="text-[2rem] font-semibold text-[#111827]">{t('set_amount')}</h2>

          <section className="mt-5 rounded-[22px] bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-[18px] bg-[#EEF7EF] flex items-center justify-center text-[#2F7D12]">
                <HiOutlineWallet size={21} />
              </div>
              <div className="flex-1">
                <div className="text-[1.15rem] font-semibold text-[#111827]">{t('wallet')}</div>
                <div className="mt-1 text-sm text-[#6B7280]">{formatBalance(walletBalance)}</div>
                <div className="mt-1 text-sm text-[#6B7280]">
                  {t('wallet_number')}: {walletId || '-'}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <AmountInput label={t('amount')} value={amount} onChange={setAmount} />
            </div>
          </section>

          <div className="my-4 flex justify-center text-black">
            <IoArrowDownCircle size={44} />
          </div>

          <section className="rounded-[22px] bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-[18px] bg-[#F2F4F7] flex items-center justify-center text-[#111827]">
                  <HiOutlineBuildingLibrary size={21} />
                </div>
                <div>
                  <div className="text-[1.15rem] font-semibold text-[#111827]">{selectedAccount.bankName}</div>
                  <div className="mt-1 text-sm text-[#6B7280]">
                    {t('bank_account_masked', { number: maskAccountNumber(selectedAccount.accountNumber) })}
                  </div>
                  <div className="text-sm text-[#6B7280]">{selectedAccount.accountHolderName}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/customer/wallet-to-bank-transfer')}
                className="text-sm font-semibold text-[#2F7D12]"
              >
                {t('change')}
              </button>
            </div>

            <div className="mt-5">
              <Button fullWidth onClick={handleContinue} disabled={loading || !amount || Number(amount) <= 0}>
                {loading ? t('verifying') : t('confirm')}
              </Button>
            </div>
          </section>
        </div>
      </div>

      <PinPopup
        open={pinPopupOpen}
        loading={loading}
        onConfirm={handlePinConfirm}
        onCancel={() => setPinPopupOpen(false)}
      />

      <ConfirmTransactionPopup
        open={Boolean(confirmData)}
        amount={confirmData?.amount || 0}
        description={t('cash_out')}
        showMobile={false}
        loading={loading}
        onSendOtp={handleOpenPinPopup}
        onCancel={() => {
          setConfirmData(null)
          setPendingTransferData(null)
        }}
        fromValue={t('wallet')}
        fromSubValue={walletId || ''}
        toValue={confirmData?.account?.bankName || '-'}
        toSubValue={t('bank_account_masked', { number: maskAccountNumber(confirmData?.account?.accountNumber) })}
        actionLabel={t('confirm_transaction')}
        cancelLabel={t('cancel')}
      />
    </MobileScreenContainer>
  )
}

export default WalletToBankTransferAmount
