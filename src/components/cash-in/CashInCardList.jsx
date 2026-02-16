import React, { useEffect, useRef, useState } from 'react'
import PageContainer from '../../Reusable/PageContainer'
import BankCard from '../../Reusable/BankCard'
import Button from '../../Reusable/Button'
import AmountInput from '../../Reusable/AmountInput'
import { BENIFICIARY_LIST } from '../../utils/constant'
import { getAuthToken, deviceId } from '../../services/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import cashInService from './cashIn.service'
import CvvPopup from '../../Reusable/CvvPopup'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'
import { generateStan } from '../../utils/generateStan'

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000]

const CashInCardList = () => {
  const navigate = useNavigate()
  const scrollRef = useRef(null)

  const [cards, setCards] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [amount, setAmount] = useState('')

  const [step, setStep] = useState(null) 
  // null | 'CVV' | 'CONFIRM' | 'OTP'

  const [selectedCard, setSelectedCard] = useState(null)
  const [cvvData, setCvvData] = useState(null)
  const [txnMeta, setTxnMeta] = useState(null)
  const [loading, setLoading] = useState(false)

  /* fetch cards */
  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const res = await fetch(BENIFICIARY_LIST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
          deviceInfo: JSON.stringify({
            device_type: 'WEB',
            device_id: deviceId,
          }),
        },
        body: JSON.stringify({ beneficiary_type: 1 }),
      })

      const data = await res.json()
      if (!res.ok || data.code !== 1) {
        throw new Error(data.message)
      }

      setCards(data.data || [])
    } catch (e) {
      toast.error(e.message || 'Failed to load cards')
    }
  }

  /* continue → CVV popup */
  const handleContinue = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter valid amount')
      return
    }

    setSelectedCard(cards[activeIndex])
    setStep('CVV')
  }

  /* CVV confirmed */
  const handleCvvConfirm = ({ cvv, expiry }) => {
    setCvvData({ cvv, expiry })
    setStep('CONFIRM')
  }

  /* Send OTP */
  const handleSendOtp = async () => {
    if (!selectedCard || !cvvData) return

    setLoading(true)
    try {
      const stan = generateStan()

      const { data } = await cashInService.sendOtp({
        card_number: selectedCard.card_number,
        cvv: cvvData.cvv,
        expiry_date: cvvData.expiry,
        txn_amount: amount,
      })

      setTxnMeta({
        rrn: data?.rrn,
        stan: data?.stan ?? stan,
      })

      setStep('OTP')
      toast.success('OTP sent')
    } catch (e) {
      toast.error(e.message || 'OTP failed')
    } finally {
      setLoading(false)
    }
  }

  /* Confirm OTP */
  const handleConfirmOtp = async (otp) => {
    setLoading(true)
    try {
      await cashInService.confirmCardToWallet({
        card_number: selectedCard.card_number,
        txn_amount: amount,
        cvv: cvvData.cvv,
        expiry_date: cvvData.expiry,
        otp,
        rrn: txnMeta.rrn,
        stan: txnMeta.stan,
      })

      setStep(null)
      navigate('/customer/cash-in/success')
    } catch (e) {
      toast.error(e.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="px-4 py-4 max-w-md mx-auto">

        {/* Cards */}
        <div
          ref={scrollRef}
          onScroll={() => {
            const c = scrollRef.current
            if (!c) return
            setActiveIndex(Math.round(c.scrollLeft / c.offsetWidth))
          }}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
        >
          {cards.map((card, i) => (
            <div key={card.id} className="snap-center shrink-0 w-full">
              <BankCard card={card} />
            </div>
          ))}
        </div>

        {/* Amount */}
        <AmountInput label="Add Amount" value={amount} onChange={setAmount} />

        <div className="grid grid-cols-5 gap-2 mt-4">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className="border rounded-full py-2 text-sm"
            >
              {a}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <Button fullWidth onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>

      {/* CVV */}
      <CvvPopup
        open={step === 'CVV'}
        loading={loading}
        onClose={() => setStep(null)}
        onConfirm={handleCvvConfirm}
      />

      {/* Confirm */}
      <ConfirmTransactionPopup
        open={step === 'CONFIRM'}
        card={selectedCard}
        amount={amount}
        loading={loading}
        onSendOtp={handleSendOtp}
        onCancel={() => setStep(null)}
      />

      {/* OTP */}
      <OtpPopup
        open={step === 'OTP'}
        loading={loading}
        onConfirm={handleConfirmOtp}
        onCancel={() => setStep(null)}
      />
    </PageContainer>
  )
}

export default CashInCardList
