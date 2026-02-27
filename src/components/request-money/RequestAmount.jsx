import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaCarSide, FaShoppingBag } from 'react-icons/fa'
import { MdFastfood } from 'react-icons/md'
import { BsBasketFill, BsThreeDots } from 'react-icons/bs'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import AmountInput from '../../Reusable/AmountInput'
import Input from '../../Reusable/Input'
import Button from '../../Reusable/Button'
import THEME_COLORS from '../../theme/colors'
import requestMoneyService from './requestMoney.service'
import { buildRemarks } from './requestMoney.utils'

const categories = [
  { label: 'Food', icon: <MdFastfood size={20} /> },
  { label: 'Travel', icon: <FaCarSide size={18} /> },
  { label: 'Grocery', icon: <BsBasketFill size={18} /> },
  { label: 'Shopping', icon: <FaShoppingBag size={18} /> },
  { label: 'Others', icon: <BsThreeDots size={20} /> },
]

const RequestAmount = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const beneficiary = location.state?.beneficiary
  const contentCard = THEME_COLORS.contentCard

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Others')
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
    setDescription(selectedCategory === 'Others' ? '' : selectedCategory)
  }, [selectedCategory, autoDescription])

  const handleSubmit = async () => {
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setLoading(true)
    try {
      const remarks = buildRemarks({ category: selectedCategory, note: description })
      const { data } = await requestMoneyService.createRequestMoney({
        cust_id: beneficiary.user_id,
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
      toast.error(error?.message || 'Failed to create request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        <h1 className="text-xl font-semibold" style={{ color: contentCard.title }}>
          Request Money
        </h1>

        <div
          className="text-sm p-3 rounded"
          style={{
            backgroundColor: contentCard.background,
            border: `1px solid ${contentCard.border}`,
            color: contentCard.subtitle,
          }}
        >
          Beneficiary Name: <strong>{beneficiary.name}</strong>
          <div className="mt-1">{beneficiary.reg_mobile}</div>
        </div>

        <AmountInput
          label="Amount"
          value={amount}
          onChange={setAmount}
        />

        <Input
          label="Description"
          value={description}
          onChange={(e) => {
            const value = e.target.value
            setDescription(value)
            setAutoDescription(value.trim() === '')
          }}
          placeholder="Add description"
        />

        <div>
          <p className="text-xs font-medium mb-2" style={{ color: contentCard.subtitle }}>
            Category
          </p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => {
              const active = selectedCategory === category.label
              return (
                <button
                  key={category.label}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.label)
                    setAutoDescription(true)
                  }}
                  className="h-10 rounded-md text-sm font-medium flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: active ? THEME_COLORS.brand.primary : contentCard.background,
                    color: active ? THEME_COLORS.common.white : contentCard.title,
                    border: `1px solid ${active ? THEME_COLORS.brand.primary : contentCard.border}`,
                  }}
                >
                  {category.icon}
                  <span>{category.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <Button
            type="button"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Continue'}
          </Button>
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
            Back
          </button>
        </div>
      </div>
    </PageContainer>
  )
}

export default RequestAmount
