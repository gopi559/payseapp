import React from 'react'
import { useNavigate } from 'react-router-dom'

const ActionTile = ({ icon, label, route, onClick, isComponent = false, isImage = false }) => {
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
      <div className={`${isImage ? '' : 'w-20 h-20 sm:w-24 sm:h-24 bg-brand-secondary rounded-full'} flex items-center justify-center mb-3 ${isImage ? '' : 'shadow-sm'}`}>
        {isImage ? (
          <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24">{icon}</div>
        ) : isComponent ? (
          <span className="text-3xl sm:text-4xl text-white flex items-center justify-center">{icon}</span>
        ) : (
          <span className="text-3xl sm:text-4xl">{icon}</span>
        )}
      </div>
      <span className="text-sm sm:text-base font-medium text-brand-dark text-center leading-tight">{label}</span>
    </button>
  )
}

export default ActionTile

