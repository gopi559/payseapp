import React from 'react'

const MobileScreenContainer = ({ children, header, footer }) => {
  return (
    <div className="min-h-screen w-full bg-[#C1DFC4] flex justify-center items-stretch overflow-x-hidden">
      <div className="relative w-full max-w-[390px] h-screen bg-white overflow-hidden flex flex-col sm:rounded-[24px]">
        {header ? <div className="shrink-0 bg-white">{header}</div> : null}
        <div className="relative flex-1 bg-white overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
        {footer ? <div className="shrink-0 bg-white">{footer}</div> : null}
      </div>
    </div>
  )
}

export default MobileScreenContainer
