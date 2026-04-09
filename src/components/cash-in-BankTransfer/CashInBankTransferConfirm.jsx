import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CashInBankTransferConfirm = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/customer/cash-in/bank-transfer/amount', { replace: true })
  }, [navigate])

  return null
}

export default CashInBankTransferConfirm
