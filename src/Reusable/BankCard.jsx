import React from 'react'
import { HiOutlineCreditCard } from 'react-icons/hi2'
import { MdWifiTethering } from 'react-icons/md'

const BankCard = ({ card, onRemove, onBalance }) => {
  return (
    <div
      className="rounded-2xl p-4 mb-4 shadow-sm"
      style={{ backgroundColor: card.color_code || '#e5e7eb' }}
    >
      {/* Bank name */}
      <div className="text-center text-sm font-semibold text-gray-800 mb-3">
        {card.external_inst_name?.trim()}
      </div>

      {/* Chip + Contactless */}
      <div className="flex items-center justify-between mb-3">
        <HiOutlineCreditCard className="w-8 h-8 text-yellow-600" />
        <MdWifiTethering className="w-6 h-6 text-yellow-500 rotate-90" />
      </div>

      {/* Card number */}
      <div className="text-sm text-gray-700 mb-1">Card number</div>
      <div className="text-lg font-mono tracking-widest text-gray-900 mb-3">
        {card.masked_card}
      </div>

      {/* Card holder */}
      <div className="text-sm text-gray-700 mb-1">Card holder name</div>
      <div className="text-sm font-semibold text-gray-900 mb-4">
        {card.cardholder_name}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onRemove}
          className="px-4 py-1.5 rounded-full text-sm border border-gray-400 text-gray-700"
        >
          Remove Card
        </button>

        {/* BALANCE AREA */}
        {card.balance ? (
          <div className="px-4 py-1.5 rounded-full text-sm border border-green-500 text-green-700 font-semibold">
            Balance : {card.balance}
          </div>
        ) : (
          <button
            onClick={onBalance}
            className="px-4 py-1.5 rounded-full text-sm border border-gray-400 text-gray-700"
          >
            Balance
          </button>
        )}
      </div>
    </div>
  )
}

export default BankCard
