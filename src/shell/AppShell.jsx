import React, { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

const AppShell = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-brand-surfaceMuted flex h-screen overflow-hidden">
      <div className="hidden lg:block h-full">
        <Sidebar
          isOpen={true}
          onClose={closeSidebar}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header 
          onMenuClick={toggleSidebar} 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <div className="lg:hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isCollapsed={false}
        />
      </div>
    </div>
  )
}

export default AppShell

