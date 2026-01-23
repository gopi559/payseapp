import React from 'react'

const PromoBanner = () => {
  return (
    <div className="mx-4 my-4 bg-gradient-to-r from-brand-primary to-brand-action rounded-xl p-6 text-white">
      <h3 className="text-lg font-bold mb-2">Special Offer!</h3>
      <p className="text-sm opacity-90">
        Get 5% cashback on all transactions this month
      </p>
    </div>
  )
}

export default PromoBanner


