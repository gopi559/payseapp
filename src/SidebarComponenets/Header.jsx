import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { MdPerson, MdLogout, MdRefresh } from 'react-icons/md'
import { formatAmount } from '../utils/formatAmount'
import authService from '../Login/auth.service.jsx'
import profileService from '../components/profile/profile.service'
import { setProfileImage } from '../Redux/store.jsx'
import THEME_COLORS from '../theme/colors'

const Header = ({ onMenuClick, onToggleSidebar }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const dropdownRef = useRef(null)

  const user = useSelector((state) => state.auth.user)
  const balance = useSelector((state) => state.wallet.balance)
  const profileImage = useSelector((state) => state.auth.profileImage)
  const profileImageId = useSelector((state) => state.auth.profileImageId)

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const regInfo = user?.reg_info || user
  const userKyc = user?.user_kyc || null

  const displayName =
    userKyc?.first_name || userKyc?.last_name
      ? [userKyc.first_name, userKyc.last_name].filter(Boolean).join(' ')
      : regInfo?.mobile || regInfo?.email || 'User'

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

  useEffect(() => {
    if (!profileImage && profileImageId) {
      profileService
        .fetchImageById({ image_id: profileImageId })
        .then((res) => {
          dispatch(
            setProfileImage({
              id: res.imageId,
              url: res.imageUrl,
            })
          )
        })
        .catch(() => {})
    }
  }, [profileImage, profileImageId, dispatch])

  const handleBalanceRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    await authService.fetchCustomerBalance()
    setIsRefreshing(false)
  }

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

  

  const headerColors = THEME_COLORS.header

  return (
    <div
      className="px-4 py-3"
      style={{ backgroundColor: headerColors.background, color: headerColors.text }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg lg:hidden"
            style={{ backgroundColor: headerColors.overlaySoft }}
            aria-label="Menu"
          >
            <span className="text-xl">|||</span>
          </button>

          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden lg:block p-2 rounded-lg"
              style={{ backgroundColor: headerColors.overlaySoft }}
              aria-label="Toggle Sidebar"
            >
              <span className="text-xl">|||</span>
            </button>
          )}

          <div>
            <p className="text-xs opacity-90">{getGreeting()}</p>
            <h2 className="text-lg font-bold">{displayName}</h2>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm opacity-90">Available Balance</span>

          <span className="text-xl font-bold">{formatAmount(balance)}</span>

          <button
            onClick={handleBalanceRefresh}
            disabled={isRefreshing}
            className="p-1 rounded-full disabled:opacity-50"
            style={{ backgroundColor: headerColors.overlaySoft }}
            title="Refresh balance"
          >
            <MdRefresh size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={toggleDropdown}
            className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: headerColors.overlayStrong }}
            aria-label="Profile menu"
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg">U</span>
            )}
          </button>

          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 border rounded-lg z-50 overflow-hidden"
              style={{
                backgroundColor: headerColors.dropdownBackground,
                color: headerColors.dropdownText,
                borderColor: headerColors.dropdownBorder,
              }}
            >
              <div
                className="p-3 border-b"
                style={{
                  backgroundColor: headerColors.dropdownHeaderBackground,
                  borderColor: headerColors.dropdownBorder,
                }}
              >
                <p className="font-semibold truncate">{displayName}</p>
                {regInfo?.mobile && (
                  <p className="text-xs truncate mt-0.5" style={{ color: headerColors.mutedText }}>
                    {regInfo.mobile}
                  </p>
                )}
              </div>

              <ul className="py-1">
                <li>
                  <button
                    onClick={handleProfileDetails}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm"
                    style={{ backgroundColor: THEME_COLORS.common.transparent }}
                  >
                    <MdPerson size={18} />
                    Profile Details
                  </button>
                </li>

                <li>
                  <button
                    onClick={handleProfile}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm"
                    style={{ backgroundColor: THEME_COLORS.common.transparent }}
                  >
                    Profile
                  </button>
                </li>

                <li className="border-t" style={{ borderColor: headerColors.dropdownBorder }}>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm"
                    style={{
                      color: headerColors.danger,
                      backgroundColor: THEME_COLORS.common.transparent,
                    }}
                  >
                    <MdLogout size={18} />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Header

