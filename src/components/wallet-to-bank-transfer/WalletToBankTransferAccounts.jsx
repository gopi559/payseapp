import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { HiOutlineBuildingLibrary } from 'react-icons/hi2'
import { IoAdd, IoArrowBack, IoInformationCircleOutline, IoTrashOutline } from 'react-icons/io5'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import Button from '../../Reusable/Button'
import walletToBankTransferService from './walletToBankTransfer.service'

const getMaskedAccountNumber = (value) => {
  const digits = String(value || '').replace(/\s/g, '')
  if (digits.length <= 4) return digits || '----'
  return `**${digits.slice(-4)}`
}

const WalletToBankTransferAccounts = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const { data } = await walletToBankTransferService.fetchLinkedAccounts()
        setAccounts(Array.isArray(data) ? data : [])
      } catch (error) {
        const fallback = walletToBankTransferService.getStoredAccounts()
        setAccounts(fallback)
      }
    }

    loadAccounts()
  }, [])

  useEffect(() => {
    if (!accounts.length) {
      setSelectedId('')
      return
    }

    const preferred = accounts.find((item) => item.isDefault || item.isCashOutDefault) || accounts[0]
    setSelectedId((prev) => prev || preferred.id)
  }, [accounts])

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedId) || null,
    [accounts, selectedId]
  )

  const handleContinue = () => {
    if (!selectedAccount) return
    sessionStorage.setItem('walletToBankTransferAccount', JSON.stringify(selectedAccount))
    navigate('/customer/wallet-to-bank-transfer/amount')
  }

  const handleRemoveAccount = async (event, accountId) => {
    event.stopPropagation()

    try {
      const { data } = await walletToBankTransferService.removeStoredAccount(accountId)
      const nextAccounts = Array.isArray(data) ? data : []
      setAccounts(nextAccounts)

      if (selectedId === accountId) {
        const nextSelected = nextAccounts.find((item) => item.isDefault || item.isCashOutDefault)?.id || nextAccounts[0]?.id || ''
        setSelectedId(nextSelected)
      }

      const currentSelected = sessionStorage.getItem('walletToBankTransferAccount')
      if (currentSelected) {
        try {
          const parsed = JSON.parse(currentSelected)
          if (parsed?.id === accountId) {
            sessionStorage.removeItem('walletToBankTransferAccount')
          }
        } catch {}
      }

      toast.success(t('beneficiary_removed'))
    } catch (error) {
      toast.error(error?.message || t('failed_to_remove_beneficiary'))
    }
  }

  return (
    <MobileScreenContainer>
      <div className="min-h-screen bg-[#F5FAF6]">
        <div className="px-4 pt-4 pb-5 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => navigate('/customer/cash-out')}
              className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#357219]"
              aria-label={t('go_back')}
            >
              <IoArrowBack size={18} />
            </button>
            <h1 className="text-xl font-semibold text-[#357219]">{t('cash_out')}</h1>
          </div>

          <h2 className="text-[2rem] leading-tight font-semibold text-[#111827]">
            {t('wallet_to_bank')}
          </h2>

          <section className="mt-4 rounded-[22px] bg-[#0D6F72] text-white p-4 shadow-[0_12px_34px_rgba(13,111,114,0.22)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-white/10 flex items-center justify-center">
                <IoInformationCircleOutline size={18} />
              </div>
              <h3 className="text-[1.1rem] font-semibold leading-tight">{t('how_transfers_work')}</h3>
            </div>
            <p className="mt-3 text-[0.95rem] leading-8 text-white/90">
              {t('wallet_to_bank_help_text')}
            </p>
          </section>

          <div className="mt-7 flex items-center justify-between">
            <h3 className="text-[1.95rem] font-semibold text-[#111827]">{t('bank_accounts')}</h3>
            <button
              type="button"
              onClick={() => navigate('/customer/wallet-to-bank-transfer/add-account')}
              className="text-sm font-semibold text-[#2F7D12]"
            >
              {t('add_new')}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {accounts.length ? (
              accounts.map((account) => {
                const isSelected = account.id === selectedId

                return (
                  <div
                    key={account.id}
                    className={`w-full rounded-[22px] border px-4 py-4 bg-white transition-all ${
                      isSelected
                        ? 'border-[#1E8C13] shadow-[0_16px_40px_rgba(47,125,18,0.14)]'
                        : 'border-[#E5E7EB] shadow-[0_8px_24px_rgba(15,23,42,0.08)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-[18px] bg-[#EEF7EF] flex items-center justify-center text-[#2F7D12]">
                          <HiOutlineBuildingLibrary size={21} />
                        </div>
                        <div>
                          <div className="text-[1.15rem] font-semibold text-[#111827]">{account.bankName}</div>
                          <div className="mt-1 text-sm leading-6 text-[#6B7280]">
                            {t('bank_account_masked', { number: getMaskedAccountNumber(account.accountNumber) })}
                          </div>
                          <button
                            type="button"
                            onClick={(event) => handleRemoveAccount(event, account.id)}
                            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#B42318]"
                          >
                            <IoTrashOutline size={16} />
                            {t('remove')}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedId(account.id)}
                          className="inline-flex items-center rounded-full bg-[#E8F7E8] px-4 py-2 text-[0.9rem] font-semibold text-[#2F7D12]"
                        >
                          {t('cash_out_badge')}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-[22px] border border-dashed border-[#C9D8CA] bg-white px-6 py-9 text-center shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                <div className="mx-auto w-11 h-11 rounded-[18px] bg-[#EEF7EF] flex items-center justify-center text-[#2F7D12]">
                  <IoAdd size={22} />
                </div>
                <h4 className="mt-4 text-[1.1rem] font-semibold text-[#111827]">{t('no_bank_accounts_yet')}</h4>
                <p className="mt-2 text-sm leading-7 text-[#6B7280]">{t('add_bank_account_to_continue')}</p>
                <div className="mt-4">
                  <Button onClick={() => navigate('/customer/wallet-to-bank-transfer/add-account')} fullWidth>
                    {t('add_bank_account')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {accounts.length > 0 && (
            <div className="mt-5">
              <Button fullWidth onClick={handleContinue} disabled={!selectedAccount}>
                {t('cash_out')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </MobileScreenContainer>
  )
}

export default WalletToBankTransferAccounts
