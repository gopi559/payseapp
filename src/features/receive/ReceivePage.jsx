import React from 'react'
import { useSelector } from 'react-redux'
import PageContainer from '../../shared/layout/PageContainer'

const ReceivePage = () => {
  const walletId = useSelector((state) => state.wallet.walletId)
  const user = useSelector((state) => state.auth.user)
  
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark mb-4 sm:mb-6">
          Receive Money
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 sm:w-36 sm:h-36 bg-brand-surfaceMuted rounded-xl flex items-center justify-center mb-3">
              <span className="text-4xl sm:text-5xl">📱</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Your Wallet ID</p>
            <p className="text-base sm:text-lg font-bold text-brand-dark font-mono break-all text-center">
              {walletId}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-brand-dark mb-3 sm:mb-4">
            Share Details
          </h3>
          <div className="space-y-2.5 sm:space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Name</span>
              <span className="font-medium text-brand-dark truncate max-w-[60%] text-right">
                {user?.name || 'User'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Wallet ID</span>
              <span className="font-medium text-brand-dark font-mono break-all text-right max-w-[60%]">
                {walletId}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default ReceivePage


