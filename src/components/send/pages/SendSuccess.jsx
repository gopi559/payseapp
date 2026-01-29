import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../../Reusable/PageContainer'
import SuccessScreen from '../../../Reusable/SuccessScreen'
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


