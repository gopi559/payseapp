import React from 'react'
import Chip from '../assets/Chip.svg'
import Wifi from '../assets/wifi.svg'
import PayseyLogoWhite from '../assets/PayseyPaymentLogowhite.png'
import AfganCurrency from '../assets/afgan_currency.svg'
import { formatCardNumber } from '../utils/formatCardNumber'

const BankCard = ({ card, onBalance }) => {
  const isMyPayseCard = !card.external_inst_name

  const cardNumberToFormat = card.card_number || card.masked_card || ''
  const formattedCardNumber = formatCardNumber(cardNumberToFormat)

  return (
    <div
      className="relative rounded-2xl p-5 mb-4 shadow-sm overflow-hidden text-white"
      style={{ backgroundColor: card.color_code || '#2fb36f' }}
    >
      {isMyPayseCard && (
        <img
          src={PayseyLogoWhite}
          alt="Paysey"
          className="absolute top-4 right-5 h-9"
        />
      )}

      <img src={Chip} alt="Chip" className="absolute top-12 left-5 h-14" />
      <img src={Wifi} alt="NFC" className="absolute top-14 right-5 h-10" />

      <div className="relative z-10 mt-28">
        <div className="mb-4">
          <div className="text-sm text-white/80">Card number</div>
          <div className="text-lg font-mono tracking-[0.22em]">
            {formattedCardNumber}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-white/80">Card holder name</div>
            <div className="text-sm font-semibold uppercase">
              {card.cardholder_name || card.name_on_card}
            </div>
          </div>

          {card.balance !== undefined ? (
            <div className="text-right">
              <div className="text-xs text-white/80">Balance</div>
              <div className="flex items-center justify-end gap-1 text-lg font-semibold">
                <img
                  src={AfganCurrency}
                  alt="Currency"
                  className="h-4 w-4"
                />
                <span>{card.balance}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={onBalance}
              className="text-sm text-white/90 hover:text-white"
            >
              Balance
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BankCard
