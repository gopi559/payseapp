import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const WalletToBankTransferConfirm = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/customer/wallet-to-bank-transfer/amount', { replace: true })
  }, [navigate])

  return null
}

export default WalletToBankTransferConfirm
