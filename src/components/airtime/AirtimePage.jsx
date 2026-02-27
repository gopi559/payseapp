import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

import PageContainer from '../../Reusable/PageContainer'
import BankCard from '../../Reusable/BankCard'
import AmountInput from '../../Reusable/AmountInput'
import MobileInput from '../../Reusable/MobileInput'
import Button from '../../Reusable/Button'
import CvvPopup from '../../Reusable/CvvPopup'
import ConfirmTransactionPopup from '../../Reusable/ConfirmTransactionPopup'
import OtpPopup from '../../Reusable/OtpPopup'

import airtimeService from './airtime.service'
import { BENIFICIARY_LIST } from '../../utils/constant'
import { getAuthToken, deviceId, getCurrentUserId } from '../../services/api'
import { generateStan } from '../../utils/generateStan'
import { sendService } from '../send/send.service'

const QUICK_AMOUNTS = [10, 20, 50, 100, 200]

const AirtimePage = () => {
  const scrollRef = useRef(null)

  const [cards, setCards] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [amount, setAmount] = useState('')
  const [mobileNo, setMobileNo] = useState('+93')
  const [beneficiary, setBeneficiary] = useState(null)
  const [isBeneficiaryValidating, setIsBeneficiaryValidating] = useState(false)
  const [beneficiaryError, setBeneficiaryError] = useState('')

  const [step, setStep] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [cvvData, setCvvData] = useState(null)
  const [txnMeta, setTxnMeta] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCards()
  }, [])

  useEffect(() => {
    const digits = String(mobileNo || '').replace(/\D/g, '')
    if (digits.length !== 11) {
      setBeneficiary(null)
      setBeneficiaryError('')
      setIsBeneficiaryValidating(false)
      return
    }

    let isCancelled = false
    const timer = setTimeout(async () => {
      setIsBeneficiaryValidating(true)
      setBeneficiaryError('')
      try {
        const { data } = await sendService.validateBeneficiary(mobileNo)
        if (isCancelled) return
        setBeneficiary(data)
      } catch (e) {
        if (isCancelled) return
        setBeneficiary(null)
        setBeneficiaryError(e?.message || 'Beneficiary validation failed')
      } finally {
        if (!isCancelled) setIsBeneficiaryValidating(false)
      }
    }, 300)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [mobileNo])

  const fetchCards = async () => {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error('User not found')

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
        throw new Error(data?.message || 'Failed to load cards')
      }

      setCards(data?.data || [])
    } catch (e) {
      toast.error(e.message || 'Failed to load cards')
    }
  }

  const validateInput = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid amount')
      return false
    }

    const normalizedMobile = String(mobileNo || '').trim()
    const digits = normalizedMobile.replace(/\D/g, '')
    if (!normalizedMobile || digits.length !== 11) {
      toast.error('Enter a valid mobile number')
      return false
    }

    if (!cards[activeIndex]) {
      toast.error('Select a card')
      return false
    }

    return true
  }

  const handleContinue = async () => {
    if (!validateInput()) return

    setLoading(true)
    try {
      const mobileDigits = String(mobileNo || '').replace(/\D/g, '')
      const beneficiaryDigits = String(beneficiary?.reg_mobile || '').replace(/\D/g, '')
      let validated = beneficiary

      if (!validated || beneficiaryDigits !== mobileDigits) {
        const { data } = await sendService.validateBeneficiary(mobileNo)
        validated = data
      }

      setBeneficiary(validated)
      setSelectedCard(cards[activeIndex])
      setStep('CVV')
    } catch (e) {
      setBeneficiary(null)
      toast.error(e.message || 'Validation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCvvConfirm = ({ cvv, expiry }) => {
    setCvvData({ cvv, expiry })
    setStep('CONFIRM')
  }

  const handleSendOtp = async () => {
    if (!selectedCard) return

    setLoading(true)
    try {
      const fallbackStan = generateStan()
      const { data } = await airtimeService.sendOtp({
        card_number: selectedCard.card_number,
        txn_amount: amount,
      })

      setTxnMeta({
        rrn: data?.rrn,
        stan: data?.stan ?? fallbackStan,
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
    if (!selectedCard || !cvvData) return
    if (!txnMeta?.rrn || !txnMeta?.stan) {
      toast.error('Session expired. Please try again.')
      resetFlow()
      return
    }

    setLoading(true)
    try {
      await airtimeService.sendAirtime({
        card_number: selectedCard.card_number,
        txn_amount: amount,
        cvv: cvvData.cvv,
        expiry_date: cvvData.expiry,
        otp,
        rrn: txnMeta.rrn,
        stan: txnMeta.stan,
        mobile_no: beneficiary?.reg_mobile || mobileNo,
      })

      toast.success('Airtime transaction processed successfully')
      resetFlow()
      setAmount('')
      setMobileNo('+93')
      setBeneficiary(null)
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
    setSelectedCard(null)
    setLoading(false)
  }

  return (
    <PageContainer>
      <div className="px-4 py-4 max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-1">Airtime</h1>
        <p className="text-sm mb-5 text-gray-500">Buy airtime with your card</p>

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
            <div
              key={card.id ?? `${card.card_number}-${index}`}
              className={`snap-center shrink-0 w-full ${
                activeIndex === index ? 'ring-2 ring-green-500 rounded-xl' : ''
              }`}
              onClick={() => setActiveIndex(index)}
            >
              <BankCard card={card} />
            </div>
          ))}
        </div>

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

        <div className="mt-4">
          <MobileInput
            label="Mobile Number"
            value={mobileNo}
            onChange={(e) => {
              setMobileNo(e.target.value)
              setBeneficiary(null)
              setBeneficiaryError('')
            }}
            placeholder="e.g. 998877665"
          />
          {isBeneficiaryValidating && (
            <p className="mt-2 text-xs text-gray-500">Validating beneficiary...</p>
          )}
          {!isBeneficiaryValidating && beneficiary && (
            <p className="mt-2 text-sm text-green-600 font-medium">
              Beneficiary: {[beneficiary?.first_name, beneficiary?.middle_name, beneficiary?.last_name]
                .filter(Boolean)
                .join(' ')
                .trim() || beneficiary?.reg_mobile}
            </p>
          )}
          {!isBeneficiaryValidating && beneficiaryError && (
            <p className="mt-2 text-xs text-red-500">{beneficiaryError}</p>
          )}
        </div>

        <div className="mt-6">
          <Button
            fullWidth
            onClick={handleContinue}
            disabled={!amount || Number(amount) <= 0 || !mobileNo}
          >
            Continue
          </Button>
        </div>
      </div>

      <CvvPopup
        open={step === 'CVV'}
        loading={loading}
        onClose={resetFlow}
        onConfirm={handleCvvConfirm}
      />

      <ConfirmTransactionPopup
        open={step === 'CONFIRM'}
        card={selectedCard}
        amount={amount}
        to={mobileNo}
        description="Airtime purchase"
        loading={loading}
        onSendOtp={handleSendOtp}
        onCancel={resetFlow}
      />

      <OtpPopup
        open={step === 'OTP'}
        loading={loading}
        onConfirm={handleConfirmOtp}
        onCancel={resetFlow}
      />
    </PageContainer>
  )
}

export default AirtimePage
