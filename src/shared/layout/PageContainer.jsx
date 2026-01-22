import React from 'react'

const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-brand-surfaceMuted pb-20 ${className}`}>
      {children}
    </div>
  )
}

export default PageContainer

