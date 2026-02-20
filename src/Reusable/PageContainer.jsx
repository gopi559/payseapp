import React from 'react'
import THEME_COLORS from '../theme/colors'

const PageContainer = ({ children, className = '' }) => {
  const useFullHeight = className.includes('h-full')
  const pageContainerColors = THEME_COLORS.pageContainer

  return (
    <div
      className={`${useFullHeight ? 'h-full min-h-0' : 'min-h-screen'} ${className}`}
      style={{ backgroundColor: pageContainerColors.background }}
    >
      {children}
    </div>
  )
}

export default PageContainer
