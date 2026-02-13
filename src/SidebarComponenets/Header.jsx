import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { MdPerson, MdLogout } from 'react-icons/md'
import { formatAmount } from '../utils/formatAmount'
import authService from '../Login/auth.service.jsx'

const Header = ({ onMenuClick, onToggleSidebar }) => {
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const user = useSelector((state) => state.auth.user)
  const balance = useSelector((state) => state.wallet.balance)
  const profileImage = useSelector((state) => state.auth.profileImage)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageKey, setImageKey] = useState(0)

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

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset image error and force re-render when profile image changes
  useEffect(() => {
    setImageError(false)
    setImageKey((prev) => prev + 1) // Force re-render by changing key
  }, [profileImage])

  const handleProfileDetails = () => {
    navigate('/customer/profile/details')
    setIsDropdownOpen(false)
  }

  const handleProfile = () => {
    navigate('/customer/profile')
    setIsDropdownOpen(false)
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/')
    setIsDropdownOpen(false)
  }

  return (
    <div className="bg-brand-secondary text-white px-4 py-3">
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

        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={toggleDropdown}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer overflow-hidden"
            aria-label="Profile menu"
            aria-expanded={isDropdownOpen}
          >
            {profileImage && !imageError ? (
              <img 
                key={imageKey}
                src={`${profileImage}${profileImage.includes('?') ? '&' : '?'}t=${Date.now()}`}
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={() => {
                  console.log('Header image error:', profileImage)
                  setImageError(true)
                }}
                onLoad={() => {
                  setImageError(false)
                }}
              />
            ) : (
              <span className="text-lg">👤</span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 border border-gray-200 shadow-lg rounded-lg z-50 overflow-hidden">
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <p className="font-semibold text-brand-dark truncate">{displayName}</p>
                {regInfo?.mobile && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{regInfo.mobile}</p>
                )}
              </div>
              <ul className="py-1">
                <li>
                  <button
                    type="button"
                    onClick={handleProfileDetails}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-100 transition-colors"
                  >
                    <MdPerson className="text-gray-600 shrink-0" size={18} />
                    Profile Details
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleProfile}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-base shrink-0">👤</span>
                    Profile
                  </button>
                </li>
                <li className="border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-100 text-red-600 transition-colors"
                  >
                    <MdLogout className="shrink-0" size={18} />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-2">
        <p className="text-xs opacity-90 mb-0.5">Available balance</p>
        <p className="text-2xl font-bold">{formatAmount(balance)}</p>
      </div>
    </div>
  )
}

export default Header

