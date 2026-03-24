import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaCarSide, FaShoppingBag } from 'react-icons/fa'
import { MdFastfood } from 'react-icons/md'
import { BsBasketFill, BsThreeDots } from 'react-icons/bs'
import { toast } from 'react-toastify'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import AmountInput from '../../Reusable/AmountInput'
import Input from '../../Reusable/Input'
import THEME_COLORS from '../../theme/colors'
import requestMoneyService from './requestMoney.service'
import { buildRemarks } from './requestMoney.utils'

const categories = [
  { key: 'food', icon: <MdFastfood size={20} /> },
  { key: 'travel', icon: <FaCarSide size={18} /> },
  { key: 'grocery', icon: <BsBasketFill size={18} /> },
  { key: 'shopping', icon: <FaShoppingBag size={18} /> },
  { key: 'others', icon: <BsThreeDots size={20} /> },
]

const RequestAmount = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const beneficiary = location.state?.beneficiary
  const contentCard = THEME_COLORS.contentCard
  const menuGreen = THEME_COLORS.header.background
  const menuGreenHover = THEME_COLORS.sidebar.logoutHoverBackground

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('others')
  const [autoDescription, setAutoDescription] = useState(true)
  const [loading, setLoading] = useState(false)

  const parsedAmount = useMemo(() => Number(amount), [amount])

  useEffect(() => {
    if (!beneficiary?.user_id) {
      navigate('/customer/request-money', { replace: true })
    }
  }, [beneficiary?.user_id, navigate])

  if (!beneficiary?.user_id) return null

  useEffect(() => {
    if (!autoDescription) return
    setDescription(selectedCategory === 'others' ? '' : t(`request_category_${selectedCategory}`))
  }, [selectedCategory, autoDescription, t])

  const handleSubmit = async () => {
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error(t('please_enter_valid_amount'))
      return
    }

    setLoading(true)
    try {
      const remarks = buildRemarks({
        category: t(`request_category_${selectedCategory}`),
        note: description,
        isOther: selectedCategory === 'others',
      })
      const { data } = await requestMoneyService.createRequestMoney({
        cust_id: beneficiary.user_id,
        entity_type: beneficiary.entity_type,
        amount: parsedAmount,
        remarks,
      })

      const successPayload = {
        ...data,
        to_name: beneficiary.name,
        to_mobile: beneficiary.reg_mobile,
        amount: parsedAmount,
        remarks,
        created_at: new Date().toISOString(),
      }

      sessionStorage.setItem('requestMoneySuccess', JSON.stringify(successPayload))
      navigate('/customer/request-money/success')
    } catch (error) {
      toast.error(error?.message || t('failed_to_create_request'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileScreenContainer>
      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        <h1 className="text-xl font-semibold" style={{ color: contentCard.title }}>
          {t('request_money')}
        </h1>

        <div
          className="text-sm p-3 rounded"
          style={{
            backgroundColor: contentCard.background,
            border: `1px solid ${contentCard.border}`,
            color: contentCard.subtitle,
          }}
        >
          {t('beneficiary_name')}: <strong>{beneficiary.name}</strong>
          <div className="mt-1">{beneficiary.reg_mobile}</div>
        </div>

        <AmountInput
          label={t('amount')}
          value={amount}
          onChange={setAmount}
        />

        <Input
          label={t('description')}
          value={description}
          onChange={(e) => {
            const value = e.target.value
            setDescription(value)
            setAutoDescription(value.trim() === '')
          }}
          placeholder={t('add_description')}
        />

        <div>
          <p className="text-xs font-medium mb-2" style={{ color: contentCard.subtitle }}>
            {t('category')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => {
              const active = selectedCategory === category.key
              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.key)
                    setAutoDescription(true)
                  }}
                  className="h-10 rounded-md text-sm font-medium flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: active ? menuGreen : contentCard.background,
                    color: active ? THEME_COLORS.common.white : contentCard.title,
                    border: `1px solid ${active ? menuGreen : contentCard.border}`,
                  }}
                >
                  {category.icon}
                  <span>{t(`request_category_${category.key}`)}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            style={{ backgroundColor: menuGreen, color: THEME_COLORS.common.white }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = menuGreenHover
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = menuGreen
            }}
          >
            {loading ? t('processing') : t('continue')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/customer/request-money')}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              backgroundColor: contentCard.background,
              border: `1px solid ${contentCard.border}`,
              color: contentCard.title,
            }}
          >
            {t('back')}
          </button>
        </div>
      </div>
    </MobileScreenContainer>
  )
}

export default RequestAmount
