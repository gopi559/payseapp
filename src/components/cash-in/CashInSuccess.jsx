import React from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import SuccessScreen from '../../Reusable/SuccessScreen'
const CashInSuccess = () => {
  const navigate = useNavigate()
  
  return (
    <PageContainer>
      <SuccessScreen
        icon="✓"
        title="Cash In Successful!"
        message="Money has been added to your wallet successfully."
        onDone={() => navigate('/customer/home')}
        buttonText="Done"
      />
    </PageContainer>
  )
}

export default CashInSuccess


