import React from 'react'
import { useAuthStore } from '../store/auth.store'
import { useWalletStore } from '../store/wallet.store'
import { formatAmount } from '../utils/formatAmount'

const Header = ({ onMenuClick, onToggleSidebar }) => {
  const { user } = useAuthStore()
  const { balance } = useWalletStore()
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }
  
  return (
    <div className="bg-gradient-to-r from-brand-primary to-brand-action text-white px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors lg:hidden"
            aria-label="Menu"
          >
            <span className="text-2xl">☰</span>
          </button>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden lg:block p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Toggle Sidebar"
            >
              <span className="text-2xl">☰</span>
            </button>
          )}
          <div>
            <p className="text-sm opacity-90">{getGreeting()}</p>
            <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
          </div>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-xl">👤</span>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm opacity-90 mb-1">Wallet Balance</p>
        <p className="text-3xl font-bold">{formatAmount(balance)}</p>
      </div>
    </div>
  )
}

export default Header

