// src/components/BankCard.jsx

import React from 'react'
import Chip from '../assets/Chip.svg'
import Wifi from '../assets/wifi.svg'
import PayseyLogoWhite from '../assets/PayseyPaymentLogowhite.png'
import AfganCurrency from '../assets/afgan_currency.svg'
import { formatCardNumber } from '../utils/formatCardNumber'
import { resolveCardColorCode } from '../services/binValidation.jsx'
import { getTextColor } from '../utils/getTextColor'

const BankCard = ({
  card,
  onBalance,
  className = '',
  withMargin = true,
  showBalanceSection = true,
}) => {
  const isMyPayseCard = !card.external_inst_name

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
  const cardBackgroundColor = resolveCardColorCode(card.color_code)
  const textColor = getTextColor(cardBackgroundColor)
  const secondaryTextColor =
    textColor === '#000000' ? 'rgba(0, 0, 0, 0.72)' : 'rgba(255, 255, 255, 0.8)'
  const balanceContent = showBalanceSection
    ? card.balance !== undefined
      ? (
          <div className="shrink-0 text-right">
            <div className="text-xs" style={{ color: secondaryTextColor }}>Balance</div>
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
              className="text-sm font-semibold underline underline-offset-4"
              style={{ color: textColor }}
            >
              Balance
            </button>
          )
        : null
    : null

  return (
    <div
      className={`relative w-full rounded-2xl p-5 shadow-sm overflow-hidden ${
        withMargin ? 'mb-4' : ''
      } ${className}`.trim()}
      style={{ backgroundColor: cardBackgroundColor, aspectRatio: '85.6 / 53.98', color: textColor }}
    >
      {isMyPayseCard && (
        <img
          src={PayseyLogoWhite}
          alt="Paysey"
          className="absolute top-5 right-5 h-8"
        />
      )}

      {!isMyPayseCard && (
        <div className="absolute top-5 right-5 text-base font-semibold z-10" style={{ color: textColor }}>
          {bankName}
        </div>
      )}

      <img src={Chip} alt="Chip" className="absolute top-12 left-5 h-12" />

      <img src={Wifi} alt="NFC" className="absolute top-[3.4rem] right-5 h-12" />

      <div className="relative z-10 h-full flex flex-col justify-end pt-24">
        <div className="mb-3">
          <div className="text-sm" style={{ color: secondaryTextColor }}>Card Number</div>
          <div className="text-lg font-mono tracking-[0.22em]">
            {formattedCardNumber}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-sm" style={{ color: secondaryTextColor }}>Card Holder Name</div>
            <div className="text-sm font-semibold capitalize truncate">
              {cardholderName}
            </div>
          </div>

          {balanceContent}
        </div>
      </div>
    </div>
  )
}

export default BankCard
