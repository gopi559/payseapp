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

  // null | 'CVV' | 'CONFIRM' | 'OTP'
  const [step, setStep] = useState(null)

  const [selectedCard, setSelectedCard] = useState(null)
  const [cvvData, setCvvData] = useState(null)
  const [txnMeta, setTxnMeta] = useState(null)
  const [loading, setLoading] = useState(false)

  /* ---------------- FETCH CARDS ---------------- */
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

  /* ---------------- STEP 1 → CVV POPUP ---------------- */
  const handleContinue = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid amount')
      return
    }

    setSelectedCard(cards[activeIndex])
    setStep('CVV')
  }

  /* ---------------- STEP 2 → CONFIRM POPUP ---------------- */
  const handleCvvConfirm = ({ cvv, expiry }) => {
    setCvvData({ cvv, expiry })
    setStep('CONFIRM')
  }

  /* ---------------- STEP 3 → SEND OTP ---------------- */
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
      toast.error(e.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- STEP 4 → CONFIRM OTP ---------------- */
  const handleConfirmOtp = async (otp) => {
    if (!txnMeta?.rrn || !txnMeta?.stan) {
      toast.error('Session expired. Please try again.')
      resetFlow()
      return
    }

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

      resetFlow()
      navigate('/customer/cash-in/success')
    } catch (e) {
      toast.error(e.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- RESET (CANCEL / FAIL SAFE) ---------------- */
  const resetFlow = () => {
    setStep(null)
    setCvvData(null)
    setTxnMeta(null)
    setLoading(false)
  }

  return (
    <PageContainer>
      <div className="px-4 py-4 max-w-md mx-auto">

        {/* Card carousel */}
        <div
          ref={scrollRef}
          onScroll={() => {
            const c = scrollRef.current
            if (!c) return
            setActiveIndex(Math.round(c.scrollLeft / c.offsetWidth))
          }}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
        >
          {cards.map((card) => (
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
          <Button
            fullWidth
            onClick={handleContinue}
            disabled={!amount || Number(amount) <= 0}
          >
            Continue
          </Button>
        </div>
      </div>

      {/* CVV POPUP */}
      <CvvPopup
        open={step === 'CVV'}
        loading={loading}
        onClose={resetFlow}
        onConfirm={handleCvvConfirm}
      />

      {/* CONFIRM POPUP */}
      <ConfirmTransactionPopup
        open={step === 'CONFIRM'}
        card={selectedCard}
        amount={amount}
        loading={loading}
        onSendOtp={handleSendOtp}
        onCancel={resetFlow}
      />

      {/* OTP POPUP */}
      <OtpPopup
        open={step === 'OTP'}
        loading={loading}
        onConfirm={handleConfirmOtp}
        onCancel={resetFlow}
      />
    </PageContainer>
  )
}

export default CashInCardList
