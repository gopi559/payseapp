import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaCarSide, FaShoppingBag } from 'react-icons/fa'
import { MdFastfood } from 'react-icons/md'
import { BsBasketFill, BsThreeDots } from 'react-icons/bs'
import { IoChevronForward } from 'react-icons/io5'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import Input from '../../Reusable/Input'
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

  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Others')
  const [loading, setLoading] = useState(false)

  const parsedAmount = useMemo(() => Number(amount), [amount])

  useEffect(() => {
    if (!beneficiary?.user_id) {
      navigate('/customer/request-money', { replace: true })
    }
  }, [beneficiary?.user_id, navigate])

  if (!beneficiary?.user_id) return null

  const handleSubmit = async () => {
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setLoading(true)
    try {
      const remarks = buildRemarks({ category: selectedCategory, note })
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
      <div className="h-screen bg-[#dff3e8] flex justify-start">
        <div className="w-full max-w-md mx-auto px-6 pt-10 relative">

          <div className="text-center mb-8">
            <h2 className="text-[24px] font-semibold text-black">
              Requesting from {beneficiary.name}
            </h2>
            <p className="mt-1 text-[17px] text-black">
              {beneficiary.reg_mobile}
            </p>
          </div>

          <div className="rounded-3xl border-[4px] border-emerald-500 bg-white/60 px-5 py-6 mb-8">
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                const next = e.target.value.replace(/[^\d.]/g, '')
                if ((next.match(/\./g) || []).length > 1) return
                setAmount(next)
              }}
              placeholder="0.00"
              className="w-full bg-transparent text-center text-[72px] leading-none text-gray-400 outline-none"
            />
          </div>

          <div className="mb-8">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note"
              className="!h-24 !rounded-3xl !border-[3px] !border-emerald-500 !text-[22px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-20">
            {categories.map((category) => {
              const active = selectedCategory === category.label
              return (
                <button
                  key={category.label}
                  type="button"
                  onClick={() => setSelectedCategory(category.label)}
                  className={`h-14 rounded-2xl border-2 text-[20px] font-semibold flex items-center justify-center gap-2 ${
                    active
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-white/80 text-black border-emerald-600'
                  }`}
                >
                  {category.icon}
                  <span>{category.label}</span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="absolute bottom-6 right-6 w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg disabled:opacity-70"
          >
            <IoChevronForward size={32} />
          </button>

        </div>
      </div>
    </PageContainer>
  )
}

export default RequestAmount