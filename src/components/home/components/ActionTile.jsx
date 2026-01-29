import React from 'react'
import { useNavigate } from 'react-router-dom'

const ActionTile = ({ icon, label, route, onClick, isComponent = false }) => {
  const navigate = useNavigate()
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (route) {
      navigate(route)
    }
  }
  
  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center p-4 sm:p-5 bg-brand-soft rounded-xl hover:shadow-lg active:scale-95 transition-all duration-200 border border-white/20"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center mb-3 shadow-sm backdrop-blur-sm">
        {isComponent ? (
          <span className="text-2xl sm:text-3xl text-white">{icon}</span>
        ) : (
          <span className="text-2xl sm:text-3xl">{icon}</span>
        )}
      </div>
      <span className="text-xs sm:text-sm font-medium text-white text-center leading-tight drop-shadow-sm">{label}</span>
    </button>
  )
}

export default ActionTile


