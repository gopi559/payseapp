// src/components/BankCard.jsx

import React from 'react'
import { useState } from 'react'
import Chip from '../assets/Chip.svg'
import Wifi from '../assets/wifi.svg'
import PayseyLogoWhite from '../assets/PayseyPaymentLogowhite.png'
import AfganCurrency from '../assets/afgan_currency.svg'
import { formatCardNumber } from '../utils/formatCardNumber'
import { resolveCardColorCode } from '../services/binValidation.jsx'
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'

const formatExpiry = (rawExpiry) => {
  const digits = String(rawExpiry || '').replace(/\D/g, '')
  if (digits.length !== 4) return ''
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

const BankCard = ({
  card,
  onBalance,
  className = '',
  withMargin = true,
  showBalanceSection = true,
}) => {
  const isMyPayseCard = !card.external_inst_name
  const [showExpiry, setShowExpiry] = useState(false)

  const cardNumberToFormat = card.card_number || card.masked_card || ''
  const formattedCardNumber = formatCardNumber(cardNumberToFormat)
  const bankName =
    card.external_inst_name?.trim() ||
    card.inst_short_name?.trim() ||
    (isMyPayseCard ? 'Paysey' : 'Bank')
  const cardholderName =
    card.display_cardholder_name ||
    card.cardholder_name ||
    card.cardholder_nick_name ||
    card.name_on_card ||
    ''
  const expiry = formatExpiry(card.expiry_date)
  const hasExpiry = !isMyPayseCard && Boolean(expiry)
  const cardBackgroundColor = resolveCardColorCode(card.color_code)
  const balanceContent = showBalanceSection
    ? card.balance !== undefined
      ? (
          <div className="shrink-0 text-right">
            <div className="text-xs text-white/80">Balance</div>
            <div className="flex items-center justify-end gap-2 text-lg font-semibold">
              <img
                src={AfganCurrency}
                alt="Currency"
                className="h-6 w-6"
              />
              <span>{card.balance}</span>
            </div>
          </div>
        )
      : onBalance
        ? (
            <button
              onClick={onBalance}
              className="text-sm font-semibold text-white underline underline-offset-4 hover:text-white/90"
            >
              Balance
            </button>
          )
        : null
    : null

  return (
    <div
      className={`relative w-full rounded-2xl p-5 shadow-sm overflow-hidden text-white ${
        withMargin ? 'mb-4' : ''
      } ${className}`.trim()}
      style={{ backgroundColor: cardBackgroundColor, aspectRatio: '85.6 / 53.98' }}
    >
      {isMyPayseCard && (
        <img
          src={PayseyLogoWhite}
          alt="Paysey"
          className="absolute top-5 right-5 h-8"
        />
      )}

      {!isMyPayseCard && (
        <div className="absolute top-5 right-5 text-base font-semibold text-gray-900 z-10">
          {bankName}
        </div>
      )}

      <img src={Chip} alt="Chip" className="absolute top-12 left-5 h-12" />

      <img src={Wifi} alt="NFC" className="absolute top-[3.4rem] right-5 h-12" />

      <div className="relative z-10 h-full flex flex-col justify-end pt-24">
        <div className="mb-3">
          <div className="text-sm text-white/80">Card Number</div>
          <div className="text-lg font-mono tracking-[0.22em]">
            {formattedCardNumber}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-sm text-white/80">Card Holder Name</div>
            <div className="text-sm font-semibold capitalize truncate">
              {cardholderName}
            </div>
          </div>

          {hasExpiry && (
            <div className="shrink-0 text-right">
              <div className="text-xs text-white/80">Expiry</div>
              <div className="flex items-center justify-end gap-1">
                <div className="text-sm font-semibold tracking-wider">
                  {showExpiry ? expiry : '**/**'}
                </div>
                <button
                  type="button"
                  aria-label={showExpiry ? 'Hide expiry' : 'Show expiry'}
                  onClick={() => setShowExpiry((prev) => !prev)}
                  className="p-1 rounded-full text-white/90 hover:text-white"
                >
                  {showExpiry ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                </button>
              </div>
            </div>
          )}

          {balanceContent}
        </div>
      </div>
    </div>
  )
}

export default BankCard
