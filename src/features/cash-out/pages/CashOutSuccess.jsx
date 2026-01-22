import React from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../../shared/layout/PageContainer'
import SuccessScreen from '../../../shared/components/SuccessScreen'
import { ROUTES } from '../../../config/routes'

const CashOutSuccess = () => {
  const navigate = useNavigate()
  
  return (
    <PageContainer>
      <SuccessScreen
        icon="✓"
        title="Cash Out Successful!"
        message="Money has been withdrawn from your wallet successfully."
        onDone={() => navigate(ROUTES.HOME)}
        buttonText="Done"
      />
    </PageContainer>
  )
}

export default CashOutSuccess

