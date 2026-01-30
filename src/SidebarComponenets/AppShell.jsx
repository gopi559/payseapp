import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

const DESKTOP_BREAKPOINT = 1024

const AppShell = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const mainRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [location.pathname])

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

      {/* Desktop sidebar: always first (left) on lg+; auto full when fullscreen */}
      <div className="hidden lg:block h-full shrink-0 order-first">
        <Sidebar
          isOpen={true}
          onClose={closeSidebar}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* Mobile sidebar: fixed overlay from left when open; DOM order before main so always "left" */}
      <div className="lg:hidden shrink-0 w-0 order-first">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isCollapsed={false}
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
    </div>
  )
}

export default AppShell

