import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { IoArrowBack, IoChevronDown } from 'react-icons/io5'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import Button from '../../Reusable/Button'
import cashInBankTransferService from './cashInBankTransfer.service'

const ToggleRow = ({ label, checked, onChange, bordered = false }) => (
  <div className={`${bordered ? 'border-t border-[#E5E7EB] pt-4 mt-4' : ''} flex items-center justify-between gap-4`}>
    <div className="max-w-[210px] text-[0.98rem] font-semibold leading-7 text-[#111827]">{label}</div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[34px] w-[64px] shrink-0 items-center rounded-full border transition-all duration-200 ${
        checked
          ? 'border-[#B9D8A8] bg-[#B9D8A8] shadow-[inset_0_1px_2px_rgba(255,255,255,0.35)]'
          : 'border-[#AAB39F] bg-[#EEF1E5] shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)]'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1/2 h-[24px] w-[24px] -translate-y-1/2 rounded-full transition-all duration-200 ${
          checked
            ? 'left-[35px] bg-[#178500] shadow-[0_4px_10px_rgba(23,133,0,0.28)]'
            : 'left-[4px] bg-[#8A9387] shadow-[0_4px_10px_rgba(138,147,135,0.22)]'
        }`}
      />
    </button>
  </div>
)

const CashInBankTransferAddAccount = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [bankOptions, setBankOptions] = useState([])
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [isDefault, setIsDefault] = useState(true)
  const [isCashInDefault, setIsCashInDefault] = useState(false)
  const [loading, setLoading] = useState(false)
  const [banksLoading, setBanksLoading] = useState(true)

  useEffect(() => {
    const loadBanks = async () => {
      setBanksLoading(true)
      try {
        const { data } = await cashInBankTransferService.fetchBankMasterList()
        const normalizedBanks = data
          .map((item) => ({
            id: item.id,
            bank_id: item.id,
            name: item.bank_name,
            shortCode: item.bank_short_code || '',
            code: item.bank_code || item.id,
            shortName: item.bank_short_name || item.bank_name,
          }))
          .filter((item) => item.name)

        setBankOptions(normalizedBanks)
        setBankName(normalizedBanks[0]?.name || '')
      } catch (error) {
        toast.error(error?.message || t('failed_to_load_bank_list'))
      } finally {
        setBanksLoading(false)
      }
    }

    loadBanks()
  }, [])

  const canSave = useMemo(
    () => bankName && accountNumber.trim() && accountHolderName.trim(),
    [bankName, accountHolderName, accountNumber]
  )

  const handleSave = async () => {
    if (!canSave) {
      toast.error(t('please_complete_bank_account_form'))
      return
    }

    setLoading(true)
    try {
      await cashInBankTransferService.saveAccount({
        bankName,
        bankMeta: bankOptions.find((item) => item.name === bankName) || null,
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim(),
        isDefault,
        isCashInDefault,
      })
      toast.success(t('bank_account_saved'))
      navigate('/customer/cash-in/bank-transfer')
    } catch (error) {
      toast.error(error?.message || t('failed_to_save_bank_account'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileScreenContainer>
      <div className="min-h-full bg-[#F5FAF6]">
        <div className="px-4 pt-4 pb-5 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => navigate('/customer/cash-in/bank-transfer')}
              className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#357219]"
              aria-label={t('go_back')}
            >
              <IoArrowBack size={18} />
            </button>
            <h1 className="text-xl font-semibold text-[#357219]">{t('add_bank_account')}</h1>
          </div>

          <h2 className="text-[2rem] font-semibold text-[#111827]">{t('add_bank_account')}</h2>

          <section className="mt-4 rounded-[22px] bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
            <label className="block text-[0.98rem] font-semibold text-[#111827]">
              {t('select_bank_required')}
            </label>
            <div className="relative mt-3">
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                disabled={banksLoading || bankOptions.length === 0}
                className="w-full appearance-none rounded-[18px] border border-[#BED3B8] bg-white px-5 py-4 text-[0.98rem] text-[#111827] outline-none"
              >
                {bankOptions.length === 0 ? (
                  <option value="">
                    {banksLoading ? t('loading_banks') : t('no_banks_available')}
                  </option>
                ) : (
                  bankOptions.map((option) => (
                    <option key={option.id || option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))
                )}
              </select>
              <IoChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2F7D12]" size={20} />
            </div>

            <label className="mt-6 block text-[0.98rem] font-semibold text-[#111827]">
              {t('account_number_required')}
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/[^\dA-Za-z]/g, '').slice(0, 24))}
              placeholder={t('enter_account_number')}
              className="mt-3 w-full rounded-[18px] border border-[#BED3B8] bg-white px-5 py-4 text-[0.98rem] text-[#111827] outline-none"
            />

            <label className="mt-6 block text-[0.98rem] font-semibold text-[#111827]">
              {t('full_name_required')}
            </label>
            <input
              type="text"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder={t('enter_full_name')}
              className="mt-3 w-full rounded-[18px] border border-[#BED3B8] bg-white px-5 py-4 text-[0.98rem] text-[#111827] outline-none"
            />
          </section>

          <section className="mt-5 rounded-[22px] bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
            <ToggleRow label={t('bank_account_default_one')} checked={isDefault} onChange={setIsDefault} />
            <ToggleRow
              label={t('bank_account_default_cash_in')}
              checked={isCashInDefault}
              onChange={setIsCashInDefault}
              bordered
            />
          </section>

          <div className="mt-5 pb-2">
            <Button fullWidth onClick={handleSave} disabled={!canSave || loading}>
              {loading ? t('saving') : t('save_bank_account')}
            </Button>
          </div>
        </div>
      </div>
    </MobileScreenContainer>
  )
}

export default CashInBankTransferAddAccount
