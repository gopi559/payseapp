import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageContainer from '../../Reusable/PageContainer'
import StatusBadge from '../../Reusable/StatusBadge'
import { formatAmount } from '../../utils/formatAmount'
import { formatDateTime } from '../../utils/formatDate'

const TransactionDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const transactions = useSelector((state) => state.transaction.transactions)
  const transaction = transactions.find((t) => t.id === id)
  
  if (!transaction) {
    return (
      <PageContainer>
        <div className="px-4 py-6">
          <p>Transaction not found</p>
        </div>
      </PageContainer>
    )
  }
  
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
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">{getTransactionIcon(transaction.type)}</span>
            </div>
            <p className={`text-3xl font-bold ${getTransactionColor(transaction.type)}`}>
              {transaction.type === 'send' || transaction.type === 'cash_out' ? '-' : '+'}
              {formatAmount(transaction.amount)}
            </p>
            <StatusBadge status={transaction.status} className="mt-3" />
          </div>
          
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono text-sm text-brand-dark">{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type</span>
              <span className="font-medium text-brand-dark capitalize">{transaction.type.replace('_', ' ')}</span>
            </div>
            {transaction.recipient && (
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient</span>
                <span className="font-medium text-brand-dark">{transaction.recipient}</span>
              </div>
            )}
            {transaction.sender && (
              <div className="flex justify-between">
                <span className="text-gray-600">Sender</span>
                <span className="font-medium text-brand-dark">{transaction.sender}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time</span>
              <span className="font-medium text-brand-dark">{formatDateTime(transaction.date)}</span>
            </div>
            {transaction.description && (
              <div className="flex justify-between">
                <span className="text-gray-600">Description</span>
                <span className="font-medium text-brand-dark">{transaction.description}</span>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => navigate('/customer/history')}
          className="w-full bg-brand-primary text-white py-3 rounded-lg font-semibold"
        >
          Back to History
        </button>
      </div>
    </PageContainer>
  )
}

export default TransactionDetails

