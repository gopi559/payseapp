import React from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../../shared/layout/PageContainer'
import SuccessScreen from '../../../shared/components/SuccessScreen'
import { ROUTES } from '../../../config/routes'

const CashInSuccess = () => {
  const navigate = useNavigate()
  
  return (
    <PageContainer>
      <SuccessScreen
        icon="✓"
        title="Cash In Successful!"
        message="Money has been added to your wallet successfully."
        onDone={() => navigate(ROUTES.HOME)}
        buttonText="Done"
      />
    </PageContainer>
  )
}

export default CashInSuccess


