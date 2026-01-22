import React from 'react'
import PageContainer from '../../shared/layout/PageContainer'
import { formatAmount } from '../../utils/formatAmount'
import { useWalletStore } from '../../store/wallet.store'

const CardsPage = () => {
  const { balance, walletId } = useWalletStore()
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">My Cards</h1>
        
        <div className="bg-gradient-to-br from-brand-primary to-brand-action rounded-xl p-6 text-white mb-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-90 mb-1">Wallet Balance</p>
              <p className="text-3xl font-bold">{formatAmount(balance)}</p>
            </div>
            <span className="text-3xl">💳</span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-xs opacity-90 mb-1">Wallet ID</p>
            <p className="font-mono text-sm">{walletId}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-brand-dark mb-4">Card Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Card Number</span>
              <span className="font-medium text-brand-dark font-mono">**** **** **** 1234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expiry</span>
              <span className="font-medium text-brand-dark">12/25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CVV</span>
              <span className="font-medium text-brand-dark font-mono">***</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default CardsPage

