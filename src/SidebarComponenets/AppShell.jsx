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
import THEME_COLORS from '../theme/colors'

const DESKTOP_BREAKPOINT = 1024
const INACTIVITY_MS = 8 * 60 * 1000

const AppShell = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const mainRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const token = useSelector((store) => store.token?.token)
  const appshellColors = THEME_COLORS.appshell

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (token) authService.fetchCustomerBalance()
  }, [token])

  useEffect(() => {
    let inactivityTimeout

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout)
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
    <div
      className="min-h-screen flex h-screen overflow-hidden flex-row"
      style={{ backgroundColor: appshellColors.background }}
    >
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ backgroundColor: appshellColors.overlay }}
          onClick={closeSidebar}
          onKeyDown={(e) => e.key === 'Escape' && closeSidebar()}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      <button
        type="button"
        onClick={toggleSidebar}
        className={`lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-30 w-8 h-16 rounded-r-lg shadow-md flex items-center justify-center transition-colors ${
          isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{
          backgroundColor: appshellColors.mainContent,
          color: appshellColors.background,
        }}
        aria-label="Open menu / expand sidebar"
      >
        <span className="text-xl font-bold leading-none">&gt;</span>
      </button>

      <div
        className={`
          order-first shrink-0 h-full
          lg:relative lg:block lg:translate-x-0
          fixed left-0 top-0 bottom-0 z-50 w-72 transition-all duration-300 ease-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:!translate-x-0
          ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}
        `}
        style={{ willChange: 'transform' }}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      <div
        className="flex-1 flex flex-col min-w-0 h-full overflow-hidden"
        style={{ backgroundColor: appshellColors.mainContent }}
      >
        <Header
          onMenuClick={toggleSidebar}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: appshellColors.mainContent }}
        >
          {children}
        </main>
      </div>
      <ChatBotButton />
    </div>
  )
}

export default AppShell
