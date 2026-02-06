import React from 'react'
import bannerImage from '../../assets/bannerimage.png'

const PromoBanner = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-6">
      <div className="max-w-4xl mx-auto">
        <img 
          src={bannerImage} 
          alt="Paysey Payment Banner" 
          className="w-full h-auto rounded-xl object-cover"
        />
      </div>
    </div>
  )
}

export default PromoBanner

