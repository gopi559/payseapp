import React from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import SuccessScreen from '../../Reusable/SuccessScreen'
const CashOutSuccess = () => {
  const navigate = useNavigate()
  
  return (
    <PageContainer>
      <SuccessScreen
        icon="✓"
        title="Cash Out Successful!"
        message="Money has been withdrawn from your wallet successfully."
        onDone={() => navigate('/customer/home')}
        buttonText="Done"
      />
    </PageContainer>
  )
}

export default CashOutSuccess

