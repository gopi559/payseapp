import React from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import { HiChevronRight } from 'react-icons/hi2'

const WalletToCardMethod = () => {
  const navigate = useNavigate()

  return (
    <PageContainer>
      <div className="min-h-screen bg-[#eaf7f1] flex justify-center">
        <div className="w-full max-w-md px-4 pt-6 pb-10">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Choose Your Method
          </h1>

          <p className="text-base text-gray-600 mb-8">
            Select how you want to withdraw money from your wallet
          </p>

          <button
            onClick={() => navigate('/customer/wallet-to-card/cards')}
            className="w-full text-left"
          >
            <div
              className="rounded-3xl p-6 flex items-center justify-between shadow-sm"
              style={{
                background:
                  'linear-gradient(135deg, #b9f1d6 0%, #eafbf2 100%)',
              }}
            >
              <div className="pr-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Wallet to Card
                </h2>

                <p className="text-base text-gray-700 mt-2">
                  Withdraw money to your debit or credit card
                </p>

                <div className="inline-flex items-center mt-4 px-4 py-1.5 text-sm rounded-full bg-white/70 text-gray-700">
                  Instant • Convenient • Secure
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <HiChevronRight className="w-6 h-6 text-gray-700" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </PageContainer>
  )
}

export default WalletToCardMethod
