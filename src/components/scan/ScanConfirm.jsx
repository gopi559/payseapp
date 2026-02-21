import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageContainer from '../../Reusable/PageContainer'
import AmountInput from '../../Reusable/AmountInput'
import ConfirmCard from '../../Reusable/ConfirmCard'
import Button from '../../Reusable/Button'
import THEME_COLORS from '../../theme/colors'

const ScanConfirm = () => {
  const navigate = useNavigate()
  const balance = useSelector((state) => state.wallet.balance)
  const [amount, setAmount] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const contentCard = THEME_COLORS.contentCard

  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return
    }
    if (parseFloat(amount) > balance) {
      return
    }
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/customer/send/success')
    }, 1500)
  }

  if (showConfirm) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: contentCard.title }}>
            Confirm Payment
          </h1>

          <ConfirmCard
            items={[
              { label: 'Merchant', value: 'QR Merchant' },
              { label: 'Amount', value: `${parseFloat(amount).toFixed(2)}` },
            ]}
            total={parseFloat(amount)}
          />

          <div className="mt-4 sm:mt-6 space-y-3">
            <Button onClick={handleConfirm} fullWidth size="md" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Payment'}
            </Button>
            <Button
              onClick={() => setShowConfirm(false)}
              variant="outline"
              fullWidth
              size="md"
              disabled={loading}
            >
              Back
            </Button>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: contentCard.title }}>
          Enter Amount
        </h1>

        <div
          className="rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6"
          style={{ backgroundColor: contentCard.background, borderColor: contentCard.border }}
        >
          <div className="text-center mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm mb-1 sm:mb-2" style={{ color: contentCard.subtitle }}>Paying to</p>
            <p className="text-sm sm:text-lg font-semibold" style={{ color: contentCard.title }}>QR Merchant</p>
          </div>

          <AmountInput
            value={amount}
            onChange={setAmount}
            maxAmount={balance}
          />

          <div className="pt-4">
            <Button onClick={handleContinue} fullWidth size="md">
              Continue
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default ScanConfirm


