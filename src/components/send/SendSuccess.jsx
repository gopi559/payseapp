import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import SuccessScreen from '../../Reusable/SuccessScreen'

const SendSuccess = () => {
  const navigate = useNavigate()
  
  useEffect(() => {
    // Clear any stored data
    sessionStorage.removeItem('sendData')
  }, [])
  
  const handleDone = () => {
    navigate('/customer/home')
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


