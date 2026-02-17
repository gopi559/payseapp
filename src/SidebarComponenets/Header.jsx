import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { MdPerson, MdLogout } from 'react-icons/md'
import { formatAmount } from '../utils/formatAmount'
import authService from '../Login/auth.service.jsx'
import profileService from '../components/profile/profile.service'
import { setProfileImage } from '../Redux/store.jsx'

const Header = ({ onMenuClick, onToggleSidebar }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const dropdownRef = useRef(null)

  const user = useSelector((state) => state.auth.user)
  const balance = useSelector((state) => state.wallet.balance)
  const profileImage = useSelector((state) => state.auth.profileImage)
  const profileImageId = useSelector((state) => state.auth.profileImageId)

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

  // ✅ FETCH PROFILE IMAGE IMMEDIATELY AFTER LOGIN
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
            className="p-2 hover:bg-white/20 rounded-lg lg:hidden"
            aria-label="Menu"
          >
            <span className="text-xl">☰</span>
          </button>

          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden lg:block p-2 hover:bg-white/20 rounded-lg"
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
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden hover:bg-white/30"
            aria-label="Profile menu"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg">👤</span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 border shadow-lg rounded-lg z-50 overflow-hidden">
              <div className="p-3 border-b bg-gray-50">
                <p className="font-semibold truncate">{displayName}</p>
                {regInfo?.mobile && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {regInfo.mobile}
                  </p>
                )}
              </div>

              <ul className="py-1">
                <li>
                  <button
                    onClick={handleProfileDetails}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <MdPerson size={18} />
                    Profile Details
                  </button>
                </li>

                <li>
                  <button
                    onClick={handleProfile}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    👤 Profile
                  </button>
                </li>

                <li className="border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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

      <div className="mt-2">
        <p className="text-xs opacity-90 mb-0.5">Available balance</p>
        <p className="text-2xl font-bold">{formatAmount(balance)}</p>
      </div>
    </div>
  )
}

export default Header
