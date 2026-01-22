import React from 'react'
import { useNavigate } from 'react-router-dom'

const ActionTile = ({ icon, label, route, onClick }) => {
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
      className="flex flex-col items-center justify-center p-4 bg-brand-surface rounded-xl hover:bg-brand-surfaceLight active:scale-95 transition-all duration-200"
    >
      <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <span className="text-sm font-medium text-brand-dark">{label}</span>
    </button>
  )
}

export default ActionTile

