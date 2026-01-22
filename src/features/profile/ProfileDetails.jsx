import React from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../shared/layout/PageContainer'
import { useAuthStore } from '../../store/auth.store'
import { useWalletStore } from '../../store/wallet.store'
import { ROUTES } from '../../config/routes'

const ProfileDetails = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { walletId } = useWalletStore()
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Profile Details</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <p className="text-lg font-semibold text-brand-dark mt-1">{user?.name || 'User'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Username</label>
              <p className="text-lg font-semibold text-brand-dark mt-1">{user?.username || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Wallet ID</label>
              <p className="text-lg font-semibold text-brand-dark font-mono mt-1">{walletId}</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => navigate(ROUTES.PROFILE)}
          className="w-full mt-6 bg-brand-primary text-white py-3 rounded-lg font-semibold"
        >
          Back
        </button>
      </div>
    </PageContainer>
  )
}

export default ProfileDetails

