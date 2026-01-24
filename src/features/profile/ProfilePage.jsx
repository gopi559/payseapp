import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CiLogout } from 'react-icons/ci'
import PageContainer from '../../shared/layout/PageContainer'
import Button from '../../shared/components/Button'
import { ROUTES } from '../../config/routes'
import { authService } from '../../auth/auth.service'

const ProfilePage = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const walletId = useSelector((state) => state.wallet.walletId)
  
  const handleLogout = () => {
    authService.logout()
    navigate(ROUTES.LOGIN)
  }
  
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark mb-4 sm:mb-6">Profile</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-primary rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-2xl sm:text-3xl text-white">👤</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-brand-dark">{user?.name || 'User'}</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{user?.username}</p>
          </div>
          
          <div className="space-y-2 sm:space-y-3 border-t border-gray-100 pt-3 sm:pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Wallet ID</span>
              <span className="font-medium text-brand-dark font-mono text-xs sm:text-sm">{walletId}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <button
            onClick={() => navigate(ROUTES.PROFILE_DETAILS)}
            className="w-full flex items-center justify-between py-2 px-2 hover:bg-brand-surfaceMuted rounded-md transition-colors"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">👤</span>
              <span className="font-medium text-brand-dark text-sm sm:text-base">Profile Details</span>
            </div>
            <span className="text-gray-400 text-lg">›</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <Button onClick={handleLogout} variant="outline" fullWidth size="md" className="flex items-center justify-center gap-2">
            <CiLogout />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default ProfilePage


