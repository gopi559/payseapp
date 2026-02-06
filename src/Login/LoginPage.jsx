import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Lottie from 'lottie-react'
import LoginForm from './LoginForm.jsx'
import logoImage from '../assets/PayseyPaymentLogowhite.png'
import illustrationData from '../assets/login-illstration-payse.json'

const LoginPage = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  
  if (isAuthenticated) {
    return <Navigate to="/customer/home" replace />
  }
  
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-primary via-brand-action to-brand-surface relative overflow-hidden">
        <div className="absolute top-8 left-8 z-10">
          <img 
            src={logoImage} 
            alt="Paysey Payment Logo" 
            className="h-12 w-auto"
          />
        </div>
        <div className="flex items-center justify-center w-full h-full p-8">
          <div className="w-full max-w-lg">
            <Lottie 
              animationData={illustrationData} 
              loop={true}
              autoplay={true}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-brand-surfaceMuted flex items-center justify-center px-4 py-8 relative">
        <div className="lg:hidden absolute top-4 left-4 z-10">
          <img 
            src={logoImage} 
            alt="Paysey Payment Logo" 
            className="h-10 w-auto"
          />
        </div>
        
        <div className="w-full max-w-md relative z-0">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

export default LoginPage

