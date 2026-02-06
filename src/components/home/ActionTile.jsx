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
      className="flex flex-col items-center justify-center p-4 sm:p-5 bg-gradient-to-br from-brand-surfaceLight to-brand-surfaceMuted rounded-[20px] hover:shadow-lg active:scale-95 transition-all duration-200"
    >
      <div className="w-16 h-16 sm:w-16 sm:h-16 bg-brand-secondary rounded-full flex items-center justify-center mb-3 shadow-sm">
        {isComponent ? (
          <span className="text-2xl sm:text-3xl text-white flex items-center justify-center">{icon}</span>
        ) : (
          <span className="text-2xl sm:text-3xl">{icon}</span>
        )}
      </div>
      <span className="text-xs sm:text-sm font-medium text-brand-dark text-center leading-tight">{label}</span>
    </button>
  )
}

export default ActionTile

