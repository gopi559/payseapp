import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageContainer from '../../shared/layout/PageContainer'
import Button from '../../shared/components/Button'
import { ROUTES } from '../../config/routes'

const ProfileDetails = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const walletId = useSelector((state) => state.wallet.walletId)
  
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark mb-4 sm:mb-6">Profile Details</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-xs sm:text-sm text-gray-600">Name</label>
              <p className="text-sm sm:text-base font-semibold text-brand-dark mt-1">{user?.name || 'User'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600">Username</label>
              <p className="text-sm sm:text-base font-semibold text-brand-dark mt-1">{user?.username || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-600">Wallet ID</label>
              <p className="text-sm sm:text-base font-semibold text-brand-dark font-mono mt-1">{walletId}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <Button
            onClick={() => navigate(ROUTES.PROFILE)}
            variant="outline"
            fullWidth
            size="md"
          >
            Back
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default ProfileDetails


