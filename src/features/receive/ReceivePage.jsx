import React from 'react'
import PageContainer from '../../shared/layout/PageContainer'
import { useWalletStore } from '../../store/wallet.store'
import { useAuthStore } from '../../store/auth.store'

const ReceivePage = () => {
  const { walletId } = useWalletStore()
  const { user } = useAuthStore()
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Receive Money</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 bg-brand-surfaceMuted rounded-xl flex items-center justify-center mb-4">
              <span className="text-6xl">📱</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Your Wallet ID</p>
            <p className="text-lg font-bold text-brand-dark font-mono">{walletId}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-brand-dark mb-4">Share Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name</span>
              <span className="font-medium text-brand-dark">{user?.name || 'User'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wallet ID</span>
              <span className="font-medium text-brand-dark font-mono">{walletId}</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default ReceivePage

