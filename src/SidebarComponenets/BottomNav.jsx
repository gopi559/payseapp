import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: '🏠', label: 'Home', route: '/customer/home' },
    { icon: '💳', label: 'Pay', route: '/customer/send', isPay: true },
    { icon: '💳', label: 'Cards', route: '/customer/cards' },
    { icon: '👤', label: 'Profile', route: '/customer/profile' },
  ]

  const isActive = (route) => {
    if (route === '/customer/home') {
      return location.pathname === route
    }
    return location.pathname.startsWith(route)
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          if (item.isPay) {
            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className="flex flex-col items-center justify-center -mt-6 bg-brand-action text-white rounded-full w-16 h-16 shadow-lg hover:bg-brand-primary transition-colors"
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          }
          
          const active = isActive(item.route)
          
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className="flex flex-col items-center justify-center py-2 px-3 transition-colors"
            >
              <span className={`text-2xl mb-1 ${active ? 'text-brand-primary' : 'text-brand-soft'}`}>
                {item.icon}
              </span>
              <span className={`text-xs font-medium ${active ? 'text-brand-primary' : 'text-brand-soft'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNav

