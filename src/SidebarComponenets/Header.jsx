import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { formatAmount } from '../utils/formatAmount'
import { ROUTES } from '../config/routes'

const Header = ({ onMenuClick, onToggleSidebar }) => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const balance = useSelector((state) => state.wallet.balance)

  const regInfo = user?.reg_info || user
  const userKyc = user?.user_kyc || null
  const displayName = userKyc?.first_name || userKyc?.last_name
    ? [userKyc.first_name, userKyc.last_name].filter(Boolean).join(' ')
    : regInfo?.mobile || regInfo?.email || user?.name || 'User'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="bg-gradient-to-r from-brand-primary to-brand-action text-white px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors lg:hidden"
            aria-label="Menu"
          >
            <span className="text-xl">☰</span>
          </button>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden lg:block p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Toggle Sidebar"
            >
              <span className="text-xl">☰</span>
            </button>
          )}
          <div>
            <p className="text-xs opacity-90">{getGreeting()}</p>
            <h2 className="text-lg font-bold">{displayName}</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.PROFILE_DETAILS)}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer shrink-0"
          aria-label="Profile details"
        >
          <span className="text-lg">👤</span>
        </button>
      </div>
      
      <div className="mt-2">
        <p className="text-xs opacity-90 mb-0.5">Wallet Balance</p>
        <p className="text-2xl font-bold">{formatAmount(balance)}</p>
      </div>
    </div>
  )
}

export default Header

