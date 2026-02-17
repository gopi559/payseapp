import React from 'react'
import BlankATMCard from '../assets/BlankATMCard.svg'

const BankCard = ({ card, onBalance }) => {
  return (
    <div
      className="relative rounded-2xl p-5 mb-4 shadow-sm overflow-hidden"
      style={{ backgroundColor: card.color_code || '#e5e7eb' }}
    >
      {/* SVG background (chip + wifi moved UP) */}
      <img
        src={BlankATMCard}
        alt="ATM Card"
        className="absolute -top-14 left-0 w-full h-full object-cover opacity-90 pointer-events-none mb-2"
      />

      {/* CONTENT */}
      <div className="relative z-10">
        {/* Bank name */}
        <div className="text-center text-sm font-semibold text-gray-800 mb-8">
          {card.external_inst_name?.trim()}
        </div>

        {/* Push text DOWN below chip & wifi */}
        <div className="mt-12">
          {/* Card number */}
<div className="text-sm text-gray-700 mt-4">
            Card number
          </div>
          <div className="text-lg font-mono tracking-widest text-gray-900 mb-5">
            {card.masked_card}
          </div>

          {/* Card holder */}
          <div className="text-sm text-gray-700 mb-2">
            Card holder name
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {card.cardholder_name}
          </div>
        </div>

        {/* Balance button – bottom right */}
        <div className="flex mt-6">
          <div className="ml-auto">
            {card.balance ? (
              <div className="px-4 py-1.5 rounded-full text-sm border border-green-600 text-green-700 font-semibold">
                Balance : {card.balance}
              </div>
            ) : (
              <button
                onClick={onBalance}
                className="px-5 py-2 rounded-full text-sm border border-gray-500 text-gray-700"
              >
                Balance
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BankCard
