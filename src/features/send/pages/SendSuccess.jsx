import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../../shared/layout/PageContainer'
import SuccessScreen from '../../../shared/components/SuccessScreen'
import { ROUTES } from '../../../config/routes'

const SendSuccess = () => {
  const navigate = useNavigate()
  
  useEffect(() => {
    // Clear any stored data
    sessionStorage.removeItem('sendData')
  }, [])
  
  const handleDone = () => {
    navigate(ROUTES.HOME)
  }
  
  return (
    <PageContainer>
      <SuccessScreen
        icon="✓"
        title="Payment Successful!"
        message="Your payment has been processed successfully."
        onDone={handleDone}
        buttonText="Done"
      />
    </PageContainer>
  )
}

export default SendSuccess


