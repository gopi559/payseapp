import React from 'react'

const PageContainer = ({ children, className = '' }) => {
  const useFullHeight = className.includes('h-full')
  return (
<div className={`bg-gray-50 ${useFullHeight ? 'h-full min-h-0' : 'min-h-screen'} ${className}`}>      {children}
    </div>
  )
}

export default PageContainer

