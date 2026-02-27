import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { IoHome } from 'react-icons/io5'
import { FaCreditCard } from 'react-icons/fa'
import { CiLogout } from 'react-icons/ci'
import { MdClose } from 'react-icons/md'
import logoImage from '../assets/PayseyPaylogoGreen.png'
import authService from '../Login/auth.service.jsx'
import cashInIcon from '../assets/PayseyCustomerPortalCashIn.svg'
import voucherIcon from '../assets/PayseyCustomerPortalVoucher.svg'
import walletToCardIcon from '../assets/PayseyCustomerPortalWalletToCard.svg'
import cardToCardIcon from '../assets/PayseyCustomerPortalCardToCard.svg'
import transactionIcon from '../assets/PayseyCustomerPortalTransaction.svg'
import disputeIcon from '../assets/PayseyCustomerPortalDispute.svg'
import requestMoneyIcon from '../assets/RequestMoney.svg'
import sendIcon from '../assets/Send.svg'
import payseyCardsIcon from '../assets/PayseyCards.svg'
import otherCardsIcon from '../assets/OtherCards.svg'
import THEME_COLORS from '../theme/colors'
import { IoChevronDown } from 'react-icons/io5'

const Sidebar = ({ isOpen, onClose, isCollapsed = false }) => {
  const [activeLink, setActiveLink] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [cardsOpen, setCardsOpen] = useState(false)
  const [hoveredMenuRoute, setHoveredMenuRoute] = useState('')
  const [hoveredSubRoute, setHoveredSubRoute] = useState('')
  const [isLogoutHovered, setIsLogoutHovered] = useState(false)
  const [isCloseHovered, setIsCloseHovered] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  useSelector((state) => state.auth.user)

  const sidebarColors = THEME_COLORS.sidebar

  const handleLogout = () => {
    authService.logout()
    navigate('/')
    onClose()
  }

  useEffect(() => {
    const path = location.pathname.split('/').pop()
    setActiveLink(path)
  }, [location])

  useEffect(() => {
    const MOBILE_BREAKPOINT = 1024
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const path = location.pathname
    if (path.startsWith('/customer/cards') || path.startsWith('/customer/other-cards')) {
      setCardsOpen(true)
    }
  }, [location.pathname])

  const menuItems = [
    { icon: <IoHome />, label: 'Home', route: '/customer/home', isComponent: true },
    {
      icon: <img src={cashInIcon} className="w-7 h-7 object-contain" alt="Cash In" />,
      label: 'Cash In',
      route: '/customer/cash-in',
      isImage: true,
    },
    {
      icon: <img src={sendIcon} className="w-7 h-7 object-contain" alt="Send Money" />,
      label: 'Send Money',
      route: '/customer/send',
      isImage: true,
    },
    {
      icon: <img src={requestMoneyIcon} className="w-7 h-7 object-contain" alt="Request Money" />,
      label: 'Request Money',
      route: '/customer/request-money',
      isImage: true,
    },
    {
      icon: <img src={voucherIcon} className="w-7 h-7 object-contain" alt="Voucher" />,
      label: 'Voucher',
      route: '/customer/voucher',
      isImage: true,
    },
    {
      icon: <img src={walletToCardIcon} className="w-7 h-7 object-contain" alt="Wallet to Card" />,
      label: 'Wallet to Card',
      route: '/customer/wallet-to-card',
      isImage: true,
    },
    {
      icon: <img src={cardToCardIcon} className="w-7 h-7 object-contain" alt="Card to Card" />,
      label: 'Card to Card',
      route: '/customer/card-to-card',
      isImage: true,
    },
    {
      icon: <img src={transactionIcon} className="w-7 h-7 object-contain" alt="Transactions" />,
      label: 'Transactions',
      route: '/customer/transactions',
      isImage: true,
    },
    {
      icon: <img src={disputeIcon} className="w-7 h-7 object-contain" alt="Disputes" />,
      label: 'Disputes',
      route: '/customer/disputes',
      isImage: true,
    },
  ]

  const baseMenuButtonStyle = {
    position: 'relative',
    color: sidebarColors.inactiveText,
    backgroundColor: THEME_COLORS.common.transparent,
  }

  const sidebarContentEl = (
    <div className="flex flex-col h-full" style={{ backgroundColor: sidebarColors.panelBackground }}>
      <div
        className={`${isCollapsed ? 'px-4 py-6' : 'px-6 py-8'} flex justify-center border-b`}
        style={{
          borderColor: sidebarColors.sectionBorder,
          backgroundImage: `linear-gradient(to bottom, ${sidebarColors.headerGradientStart}, ${sidebarColors.headerGradientEnd})`,
        }}
      >
        <Link to="/customer/home" className="flex flex-col items-center cursor-pointer" onClick={() => isMobile && onClose()}>
          {!isCollapsed && (
            <div className="flex items-center justify-center">
              <img src={logoImage} alt="Paysey Wallet" className="h-12 w-auto object-contain" />
            </div>
          )}
          {isCollapsed && (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: THEME_COLORS.brand.primary }}
            >
              <img src={logoImage} alt="Paysey" className="h-full w-full object-contain p-1" />
            </div>
          )}
        </Link>
      </div>

      <nav
        className={`flex-1 overflow-y-auto overflow-x-auto sidebar-scroll space-y-2 ${isCollapsed ? 'px-2 py-3' : 'px-3 py-4'
          }`}
        style={{
          backgroundImage: `linear-gradient(to bottom, ${sidebarColors.navGradientStart}, ${sidebarColors.navGradientEnd})`,
        }}
      >
        {menuItems.map((item, index) => {
          const isActive =
            location.pathname === item.route ||
            (item.route !== '/customer/home' && location.pathname.startsWith(item.route))

          const isHovered = hoveredMenuRoute === item.route

          const handleClick = () => {
            navigate(item.route)
            if (isMobile) {
              onClose()
            }
          }

          const menuButtonStyle = isActive
            ? {
              ...baseMenuButtonStyle,
              backgroundColor: sidebarColors.activeBackground,
              color: sidebarColors.activeText,
            }
            : {
              ...baseMenuButtonStyle,
              backgroundColor: isHovered
                ? sidebarColors.inactiveHoverBackground
                : THEME_COLORS.common.transparent,
            }

          return (
            <button
              key={index}
              onClick={handleClick}
              type="button"
              onMouseEnter={() => setHoveredMenuRoute(item.route)}
              onMouseLeave={() => setHoveredMenuRoute('')}
              className={`w-full flex items-center gap-3 px-4 h-12 min-h-[48px] rounded-xl text-left transition-all duration-150 ${isCollapsed ? 'justify-center px-2' : ''
                }`}
              style={menuButtonStyle}
            >
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: '-4px',
                    top: '8px',
                    bottom: '8px',
                    width: '6px',
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: sidebarColors.activeIndicator,
                  }}
                />
              )}
              <span
                className={`flex-none text-2xl ${isCollapsed ? 'text-2xl' : ''} ${item.isComponent || item.isImage ? 'flex items-center justify-center' : ''
                  }`}
              >
                {item.isImage ? (
                  <span className="flex items-center justify-center">{item.icon}</span>
                ) : item.isComponent ? (
                  <span className="text-xl">{item.icon}</span>
                ) : (
                  item.icon
                )}
              </span>
              {!isCollapsed && <span className="flex-1 truncate text-sm font-medium">{item.label}</span>}
            </button>
          )
        })}

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
            onMouseEnter={() => setHoveredMenuRoute('/customer/cards-group')}
            onMouseLeave={() => setHoveredMenuRoute('')}
            className={`w-full flex items-center gap-3 px-4 h-12 min-h-[48px] rounded-xl text-left transition-all duration-150 ${isCollapsed ? 'justify-center px-2' : ''
              }`}
            style={
              location.pathname.startsWith('/customer/cards') || location.pathname.startsWith('/customer/other-cards')
                ? {
                  ...baseMenuButtonStyle,
                  backgroundColor: sidebarColors.activeBackground,
                  color: sidebarColors.activeText,
                }
                : {
                  ...baseMenuButtonStyle,
                  backgroundColor:
                    hoveredMenuRoute === '/customer/cards-group'
                      ? sidebarColors.inactiveHoverBackground
                      : THEME_COLORS.common.transparent,
                }
            }
          >
            {(location.pathname.startsWith('/customer/cards') ||
              location.pathname.startsWith('/customer/other-cards')) && (
                <span
                  style={{
                    position: 'absolute',
                    left: '-4px',
                    top: '8px',
                    bottom: '8px',
                    width: '6px',
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: sidebarColors.activeIndicator,
                  }}
                />
              )}
            <span className="flex-none text-xl flex items-center justify-center">
              <FaCreditCard />
            </span>
            {!isCollapsed && (
              <>
                <span className="flex-1 truncate text-sm font-medium">Cards</span>
                <span
                  className={`flex items-center justify-center transition-transform duration-200 ${cardsOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  style={{ color: sidebarColors.chevron }}
                >
                  <IoChevronDown size={15} />
                </span>
              </>
            )}
          </button>

          {cardsOpen && !isCollapsed && (
            <div className="pl-4 space-y-1 ml-4" style={{ borderLeft: `2px solid ${sidebarColors.submenuBorder}` }}>
              <button
                type="button"
                onClick={() => {
                  navigate('/customer/cards')
                  if (isMobile) onClose()
                }}
                onMouseEnter={() => setHoveredSubRoute('/customer/cards')}
                onMouseLeave={() => setHoveredSubRoute('')}
                className="w-full flex items-center gap-3 px-3 h-12 min-h-[48px] rounded-xl text-left text-sm font-medium transition-all duration-150"
                style={
                  location.pathname === '/customer/cards' ||
                    location.pathname.startsWith('/customer/cards/') ||
                    location.pathname === '/customer/card-request'
                    ? {
                      backgroundColor: sidebarColors.activeBackground,
                      color: sidebarColors.activeText,
                    }
                    : {
                      color: sidebarColors.submenuInactiveText,
                      backgroundColor:
                        hoveredSubRoute === '/customer/cards'
                          ? sidebarColors.submenuHoverBackground
                          : THEME_COLORS.common.transparent,
                    }
                }
              >
                <img src={payseyCardsIcon} className="w-6 h-6 object-contain" alt="Paysey Card" />
                <span className="flex-1 truncate text-sm font-medium" style={{ color: 'inherit' }}>Paysepe Card</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate('/customer/other-cards')
                  if (isMobile) onClose()
                }}
                onMouseEnter={() => setHoveredSubRoute('/customer/other-cards')}
                onMouseLeave={() => setHoveredSubRoute('')}
                className="w-full flex items-center gap-3 px-3 h-12 min-h-[48px] rounded-xl text-left text-sm font-medium transition-all duration-150"
                style={
                  location.pathname.startsWith('/customer/other-cards')
                    ? {
                      backgroundColor: sidebarColors.activeBackground,
                      color: sidebarColors.activeText,
                    }
                    : {
                      color: sidebarColors.submenuInactiveText,
                      backgroundColor:
                        hoveredSubRoute === '/customer/other-cards'
                          ? sidebarColors.submenuHoverBackground
                          : THEME_COLORS.common.transparent,
                    }
                }
              >
                <img src={otherCardsIcon} className="w-6 h-6 object-contain" alt="Other Card" />
                <span className="flex-1 truncate text-sm font-medium" style={{ color: 'inherit' }}>Other Card</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <div
        className={`py-3 border-t ${isCollapsed ? 'px-2' : 'px-3'}`}
        style={{
          borderColor: sidebarColors.sectionBorder,
          backgroundColor: sidebarColors.footerBackground,
        }}
      >
        <button
          onClick={handleLogout}
          type="button"
          onMouseEnter={() => setIsLogoutHovered(true)}
          onMouseLeave={() => setIsLogoutHovered(false)}
          className={`flex items-center gap-3 px-3 py-2 h-11 rounded-xl text-sm font-medium active:scale-[0.98] transition-all duration-150 ${isCollapsed ? 'w-full justify-center' : 'w-[70%] mx-auto'
            }`}
          style={{
            backgroundColor: isLogoutHovered
              ? sidebarColors.logoutHoverBackground
              : sidebarColors.logoutBackground,
            color: THEME_COLORS.common.white,
          }}
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
        <div
          className="flex flex-col h-full w-full backdrop-blur-md rounded-2xl overflow-hidden border"
          style={{
            backgroundColor: sidebarColors.panelBackground,
            borderColor: sidebarColors.panelBorder,
            boxShadow: sidebarColors.panelShadow,
          }}
        >
          <div className="flex items-center justify-end shrink-0 pr-2 pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              onMouseEnter={() => setIsCloseHovered(true)}
              onMouseLeave={() => setIsCloseHovered(false)}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                color: sidebarColors.closeButtonText,
                backgroundColor: isCloseHovered
                  ? sidebarColors.closeButtonHoverBackground
                  : THEME_COLORS.common.transparent,
              }}
              aria-label="Close sidebar to view content"
            >
              <MdClose size={22} />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col -mt-1">{sidebarContentEl}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen p-1 ${isCollapsed ? 'w-20' : 'w-72'} transition-all duration-300`}>
      <div
        className="flex flex-col h-full w-full backdrop-blur-md rounded-3xl overflow-hidden border"
        style={{
          backgroundColor: sidebarColors.panelBackground,
          borderColor: sidebarColors.panelBorder,
          boxShadow: sidebarColors.panelShadow,
        }}
      >
        {sidebarContentEl}
      </div>
    </div>
  )
}

export default Sidebar



