import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { IoHome, IoCashOutline } from 'react-icons/io5'
import { MdOutlineArrowOutward } from 'react-icons/md'
import { GoArrowDownLeft } from 'react-icons/go'
import { FaHistory, FaCreditCard } from 'react-icons/fa'
import { BsQrCodeScan, BsCashCoin } from 'react-icons/bs'
import { CgProfile } from 'react-icons/cg'
import { CiLogout } from 'react-icons/ci'
import { ROUTES } from '../config/routes'
import { authService } from '../auth/auth.service'

const Sidebar = ({ isOpen, onClose, isCollapsed = false }) => {
  const [activeLink, setActiveLink] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  const handleLogout = () => {
    authService.logout()
    navigate(ROUTES.LOGIN)
    onClose()
  }

  useEffect(() => {
    const path = location.pathname.split('/').pop()
    setActiveLink(path)
  }, [location])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const menuItems = [
    { icon: <IoHome />, label: 'Home', route: ROUTES.HOME, isComponent: true },
    { icon: <FaHistory />, label: 'History', route: ROUTES.HISTORY, isComponent: true },
    { icon: <MdOutlineArrowOutward />, label: 'Send Money', route: ROUTES.SEND_START, isComponent: true },
    { icon: <GoArrowDownLeft />, label: 'Receive', route: ROUTES.RECEIVE, isComponent: true },
    { icon: <BsQrCodeScan />, label: 'Scan QR', route: ROUTES.SCAN, isComponent: true },
    { icon: <BsCashCoin />, label: 'Cash In', route: ROUTES.CASH_IN, isComponent: true },
    { icon: <IoCashOutline />, label: 'Cash Out', route: ROUTES.CASH_OUT, isComponent: true },
    { icon: <FaCreditCard />, label: 'Cards', route: ROUTES.CARDS, isComponent: true },
    { icon: <CgProfile />, label: 'Profile', route: ROUTES.PROFILE, isComponent: true },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header Section */}
      <div
        className={`px-6 py-8 border-b border-gray-100 bg-gradient-to-b from-brand-surfaceMuted to-white ${
          isCollapsed ? 'px-4 py-6' : ''
        } flex justify-center`}
      >
        <Link
          to={ROUTES.HOME}
          className={`flex flex-col items-center cursor-pointer`}
          onClick={() => isMobile && onClose()}
        >
          {!isCollapsed && (
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-brand-primary leading-tight">
                Paysey
              </span>
              <span className="text-lg text-brand-dark font-medium tracking-wide">
                Wallet
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">₹</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav
        className={`flex-1 overflow-y-auto bg-gradient-to-b from-white to-brand-surfaceMuted/30 space-y-2 ${
          isCollapsed ? 'px-2 py-3' : 'px-3 py-4'
        }`}
      >
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.route || 
            (item.route !== ROUTES.HOME && location.pathname.startsWith(item.route))
          
          const handleClick = () => {
            navigate(item.route)
            if (isMobile) {
              onClose()
            }
          }

          return (
            <button
              key={index}
              onClick={handleClick}
              type="button"
              className={`w-full flex items-center gap-3 px-4 h-12 min-h-[48px] rounded-xl text-left transition-all duration-150 ${
                isActive
                  ? 'bg-brand-surfaceLight text-brand-primary font-semibold shadow-sm relative before:absolute before:inset-y-2 before:-left-1 before:w-1.5 before:rounded-r-md before:bg-brand-primary'
                  : 'text-brand-dark hover:bg-brand-surfaceMuted hover:shadow-sm'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <span className={`flex-none text-2xl ${isCollapsed ? 'text-2xl' : ''} ${item.isComponent ? 'flex items-center justify-center' : ''}`}>
                {item.isComponent ? (
                  <span className="text-xl">{item.icon}</span>
                ) : (
                  item.icon
                )}
              </span>
              {!isCollapsed && <span className="flex-1 truncate text-sm font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div
        className={`px-3 py-3 border-t border-gray-100 bg-white/90 ${
          isCollapsed ? 'px-2' : ''
        }`}
      >
        <button
          onClick={handleLogout}
          type="button"
          className={`flex items-center gap-3 px-3 py-2 h-11 rounded-xl bg-brand-primary text-white text-sm font-medium shadow-sm hover:bg-brand-action active:scale-[0.98] transition-all duration-150 ${
            isCollapsed ? 'w-full justify-center' : 'w-[70%] mx-auto'
          }`}
        >
          <span className={`flex-none ${isCollapsed ? 'text-xl' : 'text-lg'} flex items-center justify-center`}>
            <CiLogout />
          </span>
          {!isCollapsed && <span className="flex-1 text-sm">Logout</span>}
        </button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-72 p-1 z-50 transition-transform transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full w-full bg-white backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.08)] rounded-3xl overflow-hidden border border-gray-200">
            <SidebarContent />
          </div>
        </div>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <div className={`h-screen p-1 ${isCollapsed ? 'w-20' : 'w-72'} transition-all duration-300`}>
      <div className="flex flex-col h-full w-full bg-white backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.08)] rounded-3xl overflow-hidden border border-gray-200">
        <SidebarContent />
      </div>
    </div>
  )
}

export default Sidebar

