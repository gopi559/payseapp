// src/components/card-to-card/CardToCardCardList.jsx

import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import PageContainer from '../../Reusable/PageContainer'
import BankCard from '../../Reusable/BankCard'
import AmountInput from '../../Reusable/AmountInput'
import Button from '../../Reusable/Button'

import CvvPopup from '../../Reusable/CvvPopup'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'

import cardToCardService from './cardToCard.service'
import { BENIFICIARY_LIST } from '../../utils/constant'
import { getAuthToken, deviceId } from '../../services/api'
import { generateStan } from '../../utils/generateStan'
import { CUSTOMER_BALANCE, CARD_CHECK_BALANCE } from '../../utils/constant'
import { formatCardNumber } from '../../utils/formatCardNumber'

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000]

const CardToCardCardList = () => {
  const navigate = useNavigate()
  const sourceScrollRef = useRef(null)
  const destScrollRef = useRef(null)

  const [sourceCards, setSourceCards] = useState([])
  const [activeSourceIndex, setActiveSourceIndex] = useState(0)
  const [destCards, setDestCards] = useState([])
  const [activeDestIndex, setActiveDestIndex] = useState(null)

  const [amount, setAmount] = useState('')

  // null | 'CVV' | 'CONFIRM' | 'OTP'
  const [step, setStep] = useState(null)

  const [selectedCard, setSelectedCard] = useState(null)
  const [cvvData, setCvvData] = useState(null)
  const [txnMeta, setTxnMeta] = useState(null)
  const [loading, setLoading] = useState(false)

  const sourceCard = sourceCards[activeSourceIndex]
  const destCard = destCards[activeDestIndex]

  /* ---------------- FETCH CARDS ---------------- */
  useEffect(() => {
    fetchSourceCards()
    fetchDestinationCards()
  }, [])

  const fetchSourceCards = async () => {
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

      setSourceCards(data.data || [])
    } catch (e) {
      toast.error(e.message || 'Failed to load source cards')
    }
  }

  const fetchDestinationCards = async () => {
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

      setDestCards(data.data || [])
    } catch (e) {
      toast.error(e.message || 'Failed to load destination cards')
    }
  }


  const fetchSourceCardBalance = async (cardIndex) => {
    try {
      const card = sourceCards[cardIndex]

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

      setSourceCards((prev) =>
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
      toast.error(e.message || 'Failed to fetch source card balance')
    }
  }

  const fetchDestCardBalance = async (cardIndex) => {
    try {
      const card = destCards[cardIndex]

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

      setDestCards((prev) =>
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
      toast.error(e.message || 'Failed to fetch destination card balance')
    }
  }

  /* ---------------- STEP 1 → CVV ---------------- */
  const handleContinue = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter valid amount')
      return
    }

    if (activeDestIndex === null) {
      toast.error('Select destination card')
      return
    }

    const fromCard = sourceCard?.card_number
    const toCard = destCard?.card_number
    if (fromCard === toCard) {
      toast.error('From and To card cannot be same')
      return
    }

    setSelectedCard(sourceCard)
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
        to_card: destCard.card_number,
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
        to_card: destCard.card_number,
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
          from_card_name: selectedCard.cardholder_name || selectedCard.card_name,

          // to
          to_card: destCard.card_number,
          to_card_name: destCard.cardholder_name || destCard.card_name || null,
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

        {/* Source Card carousel */}
        {sourceCards.length > 0 && (
          <>
            <div className="text-sm font-medium mb-2">Source Card</div>
            <div
              ref={sourceScrollRef}
              onScroll={() => {
                const c = sourceScrollRef.current
                if (!c) return
                setActiveSourceIndex(Math.round(c.scrollLeft / c.offsetWidth))
              }}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
            >
              {sourceCards.map((card, index) => (
                <div
                  key={card.id}
                  className={`snap-center shrink-0 w-full ${
                    activeSourceIndex === index
                      ? 'ring-2 ring-green-500 rounded-xl'
                      : ''
                  }`}
                  onClick={() => setActiveSourceIndex(index)}
                >
                  <BankCard
                    card={card}
                    onBalance={
                      activeSourceIndex === index
                        ? () => fetchSourceCardBalance(index)
                        : undefined
                    }
                  />
                </div>
              ))}
            </div>
          </>
        )}

        <AmountInput label="Amount" value={amount} onChange={setAmount} />

        <div className="grid grid-cols-5 gap-2 mt-3">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className="border rounded-full py-1 text-sm"
            >
              {a}
            </button>
          ))}
        </div>

        {/* Destination Card carousel */}
        <div className="mt-8 text-sm font-medium">Select Destination Card</div>
        <div
          ref={destScrollRef}
          onScroll={() => {
            const c = destScrollRef.current
            if (!c) return
            setActiveDestIndex(Math.round(c.scrollLeft / c.offsetWidth))
          }}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
        >
          {destCards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => setActiveDestIndex(index)}
              className={`snap-center shrink-0 w-full cursor-pointer ${
                activeDestIndex === index
                  ? 'ring-2 ring-green-500 rounded-xl'
                  : ''
              }`}
            >
              <BankCard
                card={card}
                onBalance={
                  activeDestIndex === index
                    ? () => fetchDestCardBalance(index)
                    : undefined
                }
              />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button
            fullWidth
            onClick={handleContinue}
            disabled={!amount || activeDestIndex === null}
          >
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
        to={
          destCard ? (
            <div>
              <p className="text-green-600 font-medium font-mono">
                {formatCardNumber(destCard.card_number || destCard.masked_card)}
              </p>
              {destCard.cardholder_name && (
                <p className="text-green-600 text-xs mt-1">{destCard.cardholder_name}</p>
              )}
            </div>
          ) : null
        }
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
