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

import cardService from '../cards/PaysePayCards/card.service'
import walletToCardService from './walletToCard.service'
import { BENIFICIARY_LIST } from '../../utils/constant'
import { getAuthToken, deviceId } from '../../services/api'

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000]

const WalletToCardCardList = () => {
  const navigate = useNavigate()
  const destScrollRef = useRef(null)

  const [sourceCard, setSourceCard] = useState(null)
  const [destCards, setDestCards] = useState([])
  const [activeDestIndex, setActiveDestIndex] = useState(null)

  const [amount, setAmount] = useState('')

  // null | 'CVV' | 'CONFIRM' | 'OTP'
  const [step, setStep] = useState(null)

  const [cvvData, setCvvData] = useState(null)
  const [loading, setLoading] = useState(false)

  // TODO: replace with real mobile from profile/auth state
  const customerMobile = '+93123456789'

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    fetchSourceCard()
    fetchDestinationCards()
  }, [])

  const fetchSourceCard = async () => {
    try {
      const res = await cardService.getList({ card_status: 1 })
      if (!res.data?.length) throw new Error('No wallet card found')

      const raw = res.data[0]
      setSourceCard({
        ...raw,
        cardholder_name: raw.name_on_card,
        color_code: raw.color_code || '#0fb36c',
      })
    } catch (e) {
      toast.error(e.message || 'Failed to load wallet card')
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
        body: JSON.stringify({ beneficiary_type: 4 }),
      })

      const json = await res.json()
      if (!res.ok || json.code !== 1) {
        throw new Error(json.message)
      }

      setDestCards(json.data || [])
    } catch (e) {
      toast.error(e.message || 'Failed to load destination cards')
    }
  }

  /* ---------------- CONTINUE → CVV ---------------- */
  const handleContinue = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter valid amount')
      return
    }

    if (activeDestIndex === null) {
      toast.error('Select destination card')
      return
    }

    setStep('CVV')
  }

  /* ---------------- CVV → CONFIRM ---------------- */
  const handleCvvConfirm = ({ cvv }) => {
    setCvvData({ cvv })
    setStep('CONFIRM')
  }

  /* ---------------- CONFIRM → SEND OTP ---------------- */
  const handleSendOtp = async () => {
    setLoading(true)
    try {
      await walletToCardService.sendOtp({
        mobile: customerMobile,
      })

      setStep('OTP')
      toast.success('OTP sent')
    } catch (e) {
      toast.error(e.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

const handleConfirmOtp = async () => {
  setLoading(true)
  try {
    const dest = destCards[activeDestIndex]

    // 🔹 CALL API AND CAPTURE RESPONSE
    const res = await walletToCardService.walletToCard({
      to_card: dest.card_number,
      txn_amount: amount,
      remarks: 'Wallet To Card',
    })

    // 🔹 STORE COMPLETE DATA (BACKEND + FRONTEND CONTEXT)
    sessionStorage.setItem(
      'walletToCardSuccess',
      JSON.stringify({
        // BACKEND RESPONSE
        txn_id: res?.data?.txn_id,
        rrn: res?.data?.rrn,
        txn_amount: res?.data?.txn_amount,
        wallet_number: res?.data?.wallet_number,
        card_number: res?.data?.card_number,
        channel_type: res?.data?.channel_type || 'WEB',
        txn_time: new Date().toISOString(),
        status: 1,

        // FRONTEND CONTEXT
        txn_type: 'WALLET_TO_CARD',
        txn_desc: 'Wallet To Card',
        card_name: dest.cardholder_name,

        // SENDER
        from: sourceCard.cardholder_name,
      })
    )

    resetFlow()
    navigate('/customer/wallet-to-card/success')
  } catch (e) {
    toast.error(e.message || 'Transaction failed')
  } finally {
    setLoading(false)
  }
}




// for  testing otp 


// const handleConfirmOtp = async () => {
//   setLoading(true)
//   try {
//     const dest = destCards[activeDestIndex]

//     await walletToCardService.walletToCard({
//       to_card: dest.card_number,
//       txn_amount: amount,
//       remarks: 'Withdraw to card',
//     })

//     sessionStorage.setItem(
//       'walletToCardSuccess',
//       JSON.stringify({
//         from: sourceCard.cardholder_name,
//         to: dest.cardholder_name,
//         masked_to: dest.masked_card,
//         amount,
//         otp_bypassed: true,
//       })
//     )

//     resetFlow()
//     navigate('/customer/wallet-to-card/success')
//   } catch (e) {
//     toast.error(e.message || 'Transaction failed')
//   } finally {
//     setLoading(false)
//   }
// }









  const resetFlow = () => {
    setStep(null)
    setCvvData(null)
    setLoading(false)
  }

  const dest = destCards[activeDestIndex]

  return (
    <PageContainer>
      <div className="px-4 py-4 max-w-md mx-auto">

        {sourceCard && (
          <>
            <div className="text-sm font-medium mb-2">Source Wallet</div>
            <BankCard card={sourceCard} />
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
              <BankCard card={card} />
            </div>
          ))}
        </div>

        <Button
          fullWidth
          onClick={handleContinue}
          disabled={!amount || activeDestIndex === null}
        >
          Continue
        </Button>
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
        card={sourceCard}
        amount={amount}
        to={`${dest?.cardholder_name} •••• ${dest?.masked_card?.slice(-4)}`}
        description="Withdraw to card"
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

export default WalletToCardCardList
