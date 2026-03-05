import React, { useEffect, useRef, useState } from 'react'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import BankCard from '../../Reusable/BankCard'
import Button from '../../Reusable/Button'
import AmountInput from '../../Reusable/AmountInput'
import AddBeneficiaryPopup from '../../Reusable/AddBeneficiaryPopup'
import { BENIFICIARY_LIST } from '../../utils/constant'
import { getAuthToken, deviceId, getCurrentUserId } from '../../services/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'
import cashInService from './cashIn.service'

import CvvPopup from '../../Reusable/CvvPopup'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'

import { CUSTOMER_BALANCE, CARD_CHECK_BALANCE } from '../../utils/constant'
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
  const [isAddNewOpen, setIsAddNewOpen] = useState(false)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error('User not found')

      const res = await fetch(BENIFICIARY_LIST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
          deviceinfo: JSON.stringify({
            device_type: 'WEB',
            device_id: deviceId,
          }),
        },
        body: JSON.stringify({
          page: 1,
          no_of_data: 50,
          user_id: userId,
          is_temp: 0,
          beneficiary_type: 1,
        }),
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
              i === cardIndex ? { ...c, balance: json.data.avail_bal } : c
            )
      )
    } catch (e) {
      toast.error(e.message || 'Failed to fetch balance')
    }
  }

  const handleContinue = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid amount')
      return
    }

    // (optional safety)
    if (!cards?.length || !cards[activeIndex]) {
      toast.error('Please select a card')
      return
    }

    setSelectedCard(cards[activeIndex])
    setStep('CVV')
  }

  const handleCvvConfirm = ({ cvv, expiry }) => {
    setCvvData({ cvv, expiry })
    setStep('CONFIRM')
  }

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

  const handleConfirmOtp = async (otp) => {
    if (!txnMeta?.rrn || !txnMeta?.stan) {
      toast.error('Session expired. Please try again.')
      resetFlow()
      return
    }

    setLoading(true)
    try {
      const { data } = await cashInService.confirmCardToWallet({
        card_number: selectedCard.card_number,
        txn_amount: amount,
        cvv: cvvData.cvv,
        expiry_date: cvvData.expiry,
        otp,
        rrn: txnMeta.rrn,
        stan: txnMeta.stan,
      })

      sessionStorage.setItem(
        'cashInSuccess',
        JSON.stringify({
          // ---- BACKEND RESPONSE ----
          txn_id: data.txn_id,
          rrn: data.rrn,
          txn_amount: data.txn_amount,
          txn_time: data.txn_time,

          // ---- FRONTEND CONTEXT (REQUIRED) ----
          txn_type: 'CARD_TO_WALLET',
          txn_desc: 'Card To Wallet',
          channel_type: 'WEB',
          status: 1,

          // from (source card)
          from_card_number: selectedCard.card_number,
          from_card_name: selectedCard.cardholder_name || selectedCard.card_name,

          to: 'Wallet',
        })
      )

      resetFlow()
      navigate('/customer/cash-in/success')
    } catch (e) {
      toast.error(e.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  const resetFlow = () => {
    setStep(null)
    setCvvData(null)
    setTxnMeta(null)
    setLoading(false)
  }

  return (
    <MobileScreenContainer>
      <div className="px-4 py-4 max-w-md mx-auto">
        <div className="relative flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate('/customer/cash-in')}
            className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#357219]"
            aria-label="Go back"
          >
            <IoArrowBack size={18} />
          </button>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-[#357219] pointer-events-none">
            Cash In By Card
          </h1>
        </div>

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
                onBalance={activeIndex === index ? () => fetchCardBalance(index) : undefined}
              />
            </div>
          ))}
        </div>

        <div className="mt-2 mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsAddNewOpen(true)}
            className="text-sm font-semibold text-[#357219] cursor-pointer no-underline"
          >
            Add New
          </button>
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
          <Button fullWidth onClick={handleContinue} disabled={!amount || Number(amount) <= 0}>
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
        to="Wallet"
        description="Add money to wallet"
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

      <AddBeneficiaryPopup
        open={isAddNewOpen}
        onClose={() => setIsAddNewOpen(false)}
        onSuccess={fetchCards}
      />
    </MobileScreenContainer>
  )
}

export default CashInCardList
