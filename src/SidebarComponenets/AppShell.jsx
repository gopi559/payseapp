import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Header from './Header'
import Sidebar from './Sidebar'
import { ChatBotButton } from '../components/chatbot'
import authService from '../Login/auth.service.jsx'
import { clearUserDataAuth } from '../Redux/AuthToken'
import { logout } from '../Redux/store'
import { LOGOUT_API_URL } from '../utils/constant'

const DESKTOP_BREAKPOINT = 1024
const INACTIVITY_MS = 8 * 60 * 1000 // 8 minutes

const AppShell = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const mainRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const token = useSelector((store) => store.token?.token)

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (token) authService.fetchCustomerBalance()
  }, [token])

  // Inactivity logout (reference Body): token from selector, call logout API, clear auth, navigate to login
  useEffect(() => {
    let inactivityTimeout
    let lastActivityTime = Date.now()

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout)
      lastActivityTime = Date.now()
      inactivityTimeout = setTimeout(() => {
        fetch(LOGOUT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {}).finally(() => {
          dispatch(clearUserDataAuth())
          dispatch(logout())
          localStorage.removeItem('refreshToken')
          sessionStorage.removeItem('reduxState')
          navigate('/')
        })
      }, INACTIVITY_MS)
    }

    const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart']
    const handleUserActivity = () => resetInactivityTimer()
    events.forEach((e) => window.addEventListener(e, handleUserActivity))
    resetInactivityTimer()

    return () => {
      clearTimeout(inactivityTimeout)
      events.forEach((e) => window.removeEventListener(e, handleUserActivity))
    }
  }, [dispatch, navigate, token])

  // When going fullscreen (inspect removed, viewport >= 1024), auto-expand sidebar to full view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        setIsSidebarCollapsed(false)
        setIsSidebarOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-brand-surfaceMuted flex h-screen overflow-hidden flex-row">
      {/* Mobile backdrop: full screen, outside translating wrapper so it stays put when sidebar slides */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
          onKeyDown={(e) => e.key === 'Escape' && closeSidebar()}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Expand bar: when in responsive mode and sidebar closed, click to open sidebar */}
      <button
        type="button"
        onClick={toggleSidebar}
        className={`lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-30 w-8 h-16 bg-brand-primary text-white rounded-r-lg shadow-md flex items-center justify-center hover:bg-brand-dark transition-colors ${
          isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Open menu / expand sidebar"
      >
        <span className="text-xl font-bold leading-none">›</span>
      </button>

      {/* Single sidebar instance: desktop = in-flow, mobile = fixed overlay. Prevents scroll reset on route change. */}
      <div
        className={`
          order-first shrink-0 h-full
          lg:relative lg:block lg:translate-x-0
          fixed left-0 top-0 bottom-0 z-50 w-72 transition-transform duration-300 ease-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:!translate-x-0
        `}
        style={{ willChange: 'transform' }}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header 
          onMenuClick={toggleSidebar} 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <ChatBotButton />
    </div>
  )
}

export default AppShell

