import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageContainer from '../../Reusable/PageContainer'
import StatusBadge from '../../Reusable/StatusBadge'
import { formatAmount } from '../../utils/formatAmount'
import { formatDateTime } from '../../utils/formatDate'
import THEME_COLORS from '../../theme/colors'

const TransactionDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const transactions = useSelector((state) => state.transaction.transactions)
  const transaction = transactions.find((t) => t.id === id)
  const contentCard = THEME_COLORS.contentCard

  if (!transaction) {
    return (
      <PageContainer>
        <div className="px-4 py-6">
          <p style={{ color: contentCard.subtitle }}>Transaction not found</p>
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

  return (
    <PageContainer>
      <div className="px-4 py-6">
        <div
          className="rounded-xl shadow-sm p-6 mb-4"
          style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}
        >
          <div className="text-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: contentCard.iconBackground }}
            >
              <span className="text-4xl">{getTransactionIcon(transaction.type)}</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: contentCard.accentText }}>
              {transaction.type === 'send' || transaction.type === 'cash_out' ? '-' : '+'}
              {formatAmount(transaction.amount)}
            </p>
            <StatusBadge status={transaction.status} className="mt-3" />
          </div>

          <div className="space-y-4 border-t pt-4" style={{ borderColor: contentCard.divider }}>
            <div className="flex justify-between">
              <span style={{ color: contentCard.subtitle }}>Transaction ID</span>
              <span className="font-mono text-sm" style={{ color: contentCard.title }}>{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: contentCard.subtitle }}>Type</span>
              <span className="font-medium capitalize" style={{ color: contentCard.title }}>{transaction.type.replace('_', ' ')}</span>
            </div>
            {transaction.recipient && (
              <div className="flex justify-between">
                <span style={{ color: contentCard.subtitle }}>Recipient</span>
                <span className="font-medium" style={{ color: contentCard.title }}>{transaction.recipient}</span>
              </div>
            )}
            {transaction.sender && (
              <div className="flex justify-between">
                <span style={{ color: contentCard.subtitle }}>Sender</span>
                <span className="font-medium" style={{ color: contentCard.title }}>{transaction.sender}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span style={{ color: contentCard.subtitle }}>Date & Time</span>
              <span className="font-medium" style={{ color: contentCard.title }}>{formatDateTime(transaction.date)}</span>
            </div>
            {transaction.description && (
              <div className="flex justify-between">
                <span style={{ color: contentCard.subtitle }}>Description</span>
                <span className="font-medium" style={{ color: contentCard.title }}>{transaction.description}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/customer/history')}
          className="w-full py-3 rounded-lg font-semibold"
          style={{ backgroundColor: THEME_COLORS.button.primary, color: THEME_COLORS.button.text }}
        >
          Back to History
        </button>
      </div>
    </PageContainer>
  )
}

export default TransactionDetails
