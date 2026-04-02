import React from 'react'
import CardsMenuBankCard from '../../../Reusable/CardsMenuBankCard.jsx'

const OtherCardPreview = ({ card, onClick, selectable = true, fullWidth = false }) => {
  const previewCard = {
    ...card,
    cardholder_name:
      card?.cardholder_name ||
      card?.cardholder_nick_name ||
      card?.name_on_card ||
      '',
  }

  return (
    <button
      type="button"
      onClick={() => selectable && onClick?.(card.id)}
      className={`${fullWidth ? 'w-full' : 'w-full max-w-[320px] sm:max-w-[400px]'} text-left transition-transform ${
        selectable ? 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer' : 'cursor-default'
      }`}
    >
      <CardsMenuBankCard
        card={previewCard}
        withMargin={false}
        showBalanceSection={false}
        className="shadow-xl"
      />
    </button>
  )
}

export default OtherCardPreview
