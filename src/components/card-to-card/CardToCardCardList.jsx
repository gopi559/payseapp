// src/components/card-to-card/CardToCardCardList.jsx

import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import PageContainer from '../../Reusable/PageContainer'
import BankCard from '../../Reusable/BankCard'
import AmountInput from '../../Reusable/AmountInput'
import Input from '../../Reusable/Input'
import Button from '../../Reusable/Button'

import CvvPopup from '../../Reusable/CvvPopup'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'

import cardToCardService from './cardToCard.service'
import { BENIFICIARY_LIST } from '../../utils/constant'
import { getAuthToken, deviceId } from '../../services/api'
import { generateStan } from '../../utils/generateStan'
import { CUSTOMER_BALANCE, CARD_CHECK_BALANCE } from '../../utils/constant'

const CardToCardCardList = () => {
  const navigate = useNavigate()
  const scrollRef = useRef(null)

  const [cards, setCards] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)

  const [amount, setAmount] = useState('')
  const [toCard, setToCard] = useState('')

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


const fetchCardBalance = async (cardIndex) => {
  try {
    const card = cards[cardIndex]

    const isInternalCard = !card.external_inst_name

    const res = await fetch(
      isInternalCard ? CUSTOMER_BALANCE : CARD_CHECK_BALANCE,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
          deviceInfo: JSON.stringify({
            device_type: 'WEB',
            device_id: deviceId,
          }),
        },
        ...(isInternalCard
          ? {}
          : {
              body: JSON.stringify({
                card_number: card.card_number,
              }),
            }),
      }
    )

    const json = await res.json()
    if (!res.ok || json.code !== 1) {
      throw new Error(json.message)
    }

    setCards((prev) =>
      isInternalCard
        ? prev.map((c) => ({
            ...c,
            balance: json.data.avail_bal,
          }))
        : prev.map((c, i) =>
            i === cardIndex
              ? { ...c, balance: json.data.avail_bal }
              : c
          )
    )
  } catch (e) {
    toast.error(e.message || 'Failed to fetch balance')
  }
}

  /* ---------------- STEP 1 → CVV ---------------- */
  const handleContinue = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter valid amount')
      return
    }

    if (!toCard || toCard.length !== 16) {
      toast.error('Enter valid destination card')
      return
    }

    const fromCard = cards[activeIndex]?.card_number
    if (fromCard === toCard) {
      toast.error('From and To card cannot be same')
      return
    }

    setSelectedCard(cards[activeIndex])
    setStep('CVV')
  }

  /* ---------------- STEP 2 → CONFIRM ---------------- */
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

      const { data } = await cardToCardService.sendOtp({
        from_card: selectedCard.card_number,
        to_card: toCard,
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
      const { data } = await cardToCardService.confirmCardToCard({
        from_card: selectedCard.card_number,
        to_card: toCard,
        txn_amount: amount,
        cvv: cvvData.cvv,
        expiry_date: cvvData.expiry,
        otp,
        rrn: txnMeta.rrn,
        stan: txnMeta.stan,
      })

      sessionStorage.setItem(
        'cardToCardSuccess',
        JSON.stringify({
          // backend
          txn_id: data?.txn_id,
          rrn: data?.rrn,
          txn_amount: data?.txn_amount,
          txn_time: data?.txn_time,

          // frontend context
          txn_type: 'CARD_TO_CARD',
          txn_desc: 'Card to Card transfer',
          channel_type: 'WEB',
          status: 1,

          // from
          from_card: selectedCard.card_number,
          from_card_name: selectedCard.card_name,

          // to
          to_card: toCard,
        })
      )

      resetFlow()
      navigate('/customer/card-to-card/success')
    } catch (e) {
      toast.error(e.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- RESET ---------------- */
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
{cards.map((card, index) => (
  <div key={card.id} className="snap-center shrink-0 w-full">
    <BankCard
      card={card}
      onBalance={
        activeIndex === index
          ? () => fetchCardBalance(index)
          : undefined
      }
    />
  </div>
))}

        </div>

        <AmountInput label="Amount" value={amount} onChange={setAmount} />

        <Input
          label="Destination Card"
          value={toCard}
          onChange={(e) => setToCard(e.target.value.replace(/\D/g, ''))}
          maxLength={16}
          inputMode="numeric"
          placeholder="1234 5678 9012 3456"
        />

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
        onClose={resetFlow}
        onConfirm={handleCvvConfirm}
      />

      {/* CONFIRM */}
<ConfirmTransactionPopup
  open={step === 'CONFIRM'}
  card={selectedCard}
  amount={amount}
  to={`Card •••• ${toCard.slice(-4)}`}
  description="Card to Card transfer"
  loading={loading}
  onSendOtp={handleSendOtp}
  onCancel={resetFlow}
/>


      {/* OTP */}
      <OtpPopup
        open={step === 'OTP'}
        loading={loading}
        onConfirm={handleConfirmOtp}
        onCancel={resetFlow}
      />
    </PageContainer>
  )
}

export default CardToCardCardList
