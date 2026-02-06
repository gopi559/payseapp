import React from 'react'
import bannerImage from '../../assets/bannerimage.png'

const PromoBanner = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 bg-white">
      <div className="max-w-2xl mx-auto">
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

