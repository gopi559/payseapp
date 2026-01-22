import React from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../shared/layout/PageContainer'
import Button from '../../shared/components/Button'
import { useAuthStore } from '../../store/auth.store'
import { useWalletStore } from '../../store/wallet.store'
import { ROUTES } from '../../config/routes'
import { authService } from '../../auth/auth.service'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { walletId } = useWalletStore()
  
  const handleLogout = () => {
    authService.logout()
    navigate(ROUTES.LOGIN)
  }
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Profile</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-brand-primary rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl text-white">👤</span>
            </div>
            <h2 className="text-xl font-bold text-brand-dark">{user?.name || 'User'}</h2>
            <p className="text-sm text-gray-600 mt-1">{user?.username}</p>
          </div>
          
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Wallet ID</span>
              <span className="font-medium text-brand-dark font-mono">{walletId}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <button
            onClick={() => navigate(ROUTES.PROFILE_DETAILS)}
            className="w-full flex items-center justify-between p-3 hover:bg-brand-surfaceMuted rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <span className="font-medium text-brand-dark">Profile Details</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>
          
          <button
            onClick={() => navigate(ROUTES.CHANGE_PASSCODE)}
            className="w-full flex items-center justify-between p-3 hover:bg-brand-surfaceMuted rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <span className="font-medium text-brand-dark">Change Passcode</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        </div>
        
        <Button onClick={handleLogout} variant="outline" fullWidth>
          Logout
        </Button>
      </div>
    </PageContainer>
  )
}

export default ProfilePage

