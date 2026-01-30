import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageContainer from '../../Reusable/PageContainer'
import StatusBadge from '../../Reusable/StatusBadge'
import { formatAmount, formatAmountShort } from '../../utils/formatAmount'
import { formatDate } from '../../utils/formatDate'
const HistoryPage = () => {
  const navigate = useNavigate()
  const transactions = useSelector((state) => state.transaction.transactions)
  
  const getTransactionIcon = (type) => {
    const icons = {
      send: '📤',
      receive: '📥',
      cash_in: '💰',
      cash_out: '🏧',
    }
    return icons[type] || '💳'
  }
  
  const getTransactionColor = (type) => {
    if (type === 'send' || type === 'cash_out') return 'text-red-600'
    return 'text-brand-success'
  }
  
  const handleTransactionClick = (id) => {
    navigate(`/customer/history/${id}`)
  }
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Transaction History</h1>
        
        {transactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">📜</span>
            <p className="text-gray-600">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <button
                key={transaction.id}
                onClick={() => handleTransactionClick(transaction.id)}
                className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:bg-brand-surfaceMuted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-surface rounded-full flex items-center justify-center">
                    <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-brand-dark">
                      {transaction.recipient || transaction.sender || transaction.description}
                    </p>
                    <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'send' || transaction.type === 'cash_out' ? '-' : '+'}
                    {formatAmountShort(transaction.amount)}
                  </p>
                  <StatusBadge status={transaction.status} className="mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default HistoryPage


