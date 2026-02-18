import React from 'react'
import Chip from '../assets/Chip.svg'
import Wifi from '../assets/wifi.svg'
import PayseyLogoWhite from '../assets/PayseyPaymentLogowhite.png'

const BankCard = ({ card, onBalance }) => {
  const isMyPayseCard = !card.external_inst_name

  return (
    <div
      className="relative rounded-2xl p-5 mb-4 shadow-sm overflow-hidden"
      style={{ backgroundColor: card.color_code || '#2fb36f' }}
    >
      {/* PAYSEY LOGO — TOP RIGHT (OUR CARD) */}
      {isMyPayseCard && (
        <img
          src={PayseyLogoWhite}
          alt="PaysePay"
          className="absolute top-4 right-5 h-9"
        />
      )}

      {/* BANK NAME — ABOVE WIFI (BENEFICIARY CARD) */}
      {!isMyPayseCard && (
        <div className="absolute top-8 right-5 text-xs font-semibold text-gray-800 uppercase">
          {card.external_inst_name?.trim()}
        </div>
      )}

      {/* CHIP — TOP LEFT */}
      <img
        src={Chip}
        alt="Chip"
        className="absolute top-12 left-5 h-14"
      />

      {/* WIFI / NFC — TOP RIGHT */}
      <img
        src={Wifi}
        alt="NFC"
        className="absolute top-14 right-5 h-10"
      />

      {/* CONTENT */}
      <div className="relative z-10 mt-32">
        {/* Card number */}
        <div className="mb-4">
          <div className="text-sm text-gray-700">
            Card number
          </div>

          <div className="text-lg font-mono tracking-[0.22em] text-gray-900">
            {card.masked_card}
          </div>
        </div>

        {/* Card holder + Balance (SAME LINE) */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm text-gray-700 mb-1">
              Card holder name
            </div>

            <div className="text-sm font-semibold text-gray-900 uppercase">
              {card.cardholder_name || card.name_on_card}
            </div>
          </div>

{card.balance !== undefined ? (
            <div className="px-4 py-1.5 rounded-full text-sm border border-green-700 text-green-800 font-semibold">
              Balance : {card.balance}
            </div>
          ) : (
            <button
              onClick={onBalance}
              className="px-5 py-2 rounded-full text-sm border border-gray-600 text-gray-800"
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
