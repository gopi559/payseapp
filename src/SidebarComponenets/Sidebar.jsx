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
import { MdClose } from 'react-icons/md'
import authService from '../Login/auth.service.jsx'

const Sidebar = ({ isOpen, onClose, isCollapsed = false }) => {
  const [activeLink, setActiveLink] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
    onClose()
  }

  useEffect(() => {
    const path = location.pathname.split('/').pop()
    setActiveLink(path)
  }, [location])

  // Match AppShell breakpoint (lg = 1024px): overlay sidebar when < 1024 so inspect/responsive mode behaves correctly
  useEffect(() => {
    const MOBILE_BREAKPOINT = 1024
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const [cardsOpen, setCardsOpen] = useState(false)

  useEffect(() => {
    const path = location.pathname
    if (path.startsWith('/customer/cards') || path.startsWith('/customer/other-cards')) {
      setCardsOpen(true)
    }
  }, [location.pathname])

  const menuItems = [
    { icon: <IoHome />, label: 'Home', route: '/customer/home', isComponent: true },
    { icon: <FaHistory />, label: 'History', route: '/customer/history', isComponent: true },
    { icon: <MdOutlineArrowOutward />, label: 'Send Money', route: '/customer/send', isComponent: true },
    { icon: <GoArrowDownLeft />, label: 'Receive', route: '/customer/receive', isComponent: true },
    { icon: <BsQrCodeScan />, label: 'Scan QR', route: '/customer/scan', isComponent: true },
    { icon: <BsCashCoin />, label: 'Cash In', route: '/customer/cash-in', isComponent: true },
    { icon: <IoCashOutline />, label: 'Cash Out', route: '/customer/cash-out', isComponent: true },
    { icon: <CgProfile />, label: 'Profile', route: '/customer/profile', isComponent: true },
  ]

  // Inline JSX (not a nested component) so <nav> is never remounted — scroll position is preserved on route change
  const sidebarContentEl = (
    <div className="flex flex-col h-full bg-white">
      <div
        className={`px-6 py-8 border-b border-gray-100 bg-gradient-to-b from-brand-surfaceMuted to-white ${
          isCollapsed ? 'px-4 py-6' : ''
        } flex justify-center`}
      >
        <Link
          to="/customer/home"
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

      <nav
        className={`flex-1 overflow-y-auto bg-gradient-to-b from-white to-brand-surfaceMuted/30 space-y-2 ${
          isCollapsed ? 'px-2 py-3' : 'px-3 py-4'
        }`}
      >
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.route ||
            (item.route !== '/customer/home' && location.pathname.startsWith(item.route))
          
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

        {/* Cards parent with Paysepe Card & Other Card */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                navigate('/customer/cards')
                if (isMobile) onClose()
              } else {
                setCardsOpen((prev) => !prev)
              }
            }}
            className={`w-full flex items-center gap-3 px-4 h-12 min-h-[48px] rounded-xl text-left transition-all duration-150 ${
              location.pathname.startsWith('/customer/cards') || location.pathname.startsWith('/customer/other-cards')
                ? 'bg-brand-surfaceLight text-brand-primary font-semibold shadow-sm relative before:absolute before:inset-y-2 before:-left-1 before:w-1.5 before:rounded-r-md before:bg-brand-primary'
                : 'text-brand-dark hover:bg-brand-surfaceMuted hover:shadow-sm'
            } ${isCollapsed ? 'justify-center px-2' : ''}`}
          >
            <span className="flex-none text-xl flex items-center justify-center">
              <FaCreditCard />
            </span>
            {!isCollapsed && (
              <>
                <span className="flex-1 truncate text-sm font-medium">Cards</span>
                <span className={`text-gray-500 transition-transform ${cardsOpen ? 'rotate-180' : ''}`}>▼</span>
              </>
            )}
          </button>
          {cardsOpen && !isCollapsed && (
            <div className="pl-4 space-y-1 border-l-2 border-gray-200 ml-4">
              <button
                type="button"
                onClick={() => {
                  navigate('/customer/cards')
                  if (isMobile) onClose()
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm ${
                  location.pathname === '/customer/cards' || location.pathname.startsWith('/customer/cards/') || location.pathname === '/customer/card-request'
                    ? 'bg-brand-surfaceLight text-brand-primary font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Paysepe Card
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate('/customer/other-cards')
                  if (isMobile) onClose()
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm ${
                  location.pathname.startsWith('/customer/other-cards')
                    ? 'bg-brand-surfaceLight text-brand-primary font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Other Card
              </button>
            </div>
          )}
        </div>
      </nav>

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
      <div className="h-full w-full pt-1 px-1 pb-1">
        <div className="flex flex-col h-full w-full bg-white backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden border border-gray-200">
          <div className="flex items-center justify-end shrink-0 pr-2 pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Close sidebar to view content"
            >
              <MdClose size={22} />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col -mt-1">
            {sidebarContentEl}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen p-1 ${isCollapsed ? 'w-20' : 'w-72'} transition-all duration-300`}>
      <div className="flex flex-col h-full w-full bg-white backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.08)] rounded-3xl overflow-hidden border border-gray-200">
        {sidebarContentEl}
      </div>
    </div>
  )
}

export default Sidebar

