import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageContainer from '../../Reusable/PageContainer'
import StatusBadge from '../../Reusable/StatusBadge'
import { formatAmountShort } from '../../utils/formatAmount'
import { formatDate } from '../../utils/formatDate'
import THEME_COLORS from '../../theme/colors'

const HistoryPage = () => {
  const navigate = useNavigate()
  const transactions = useSelector((state) => state.transaction.transactions)
  const contentCard = THEME_COLORS.contentCard

  const getTransactionIcon = (type) => {
    const icons = {
      send: '📤',
      receive: '📥',
      cash_in: '💰',
      cash_out: '🏧',
    }
    return icons[type] || '💳'
  }

  const handleTransactionClick = (id) => {
    navigate(`/customer/history/${id}`)
  }

  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold mb-6" style={{ color: contentCard.title }}>Transaction History</h1>

        {transactions.length === 0 ? (
          <div
            className="rounded-xl shadow-sm p-12 text-center"
            style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}
          >
            <span className="text-6xl mb-4 block">📜</span>
            <p style={{ color: contentCard.subtitle }}>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <button
                key={transaction.id}
                onClick={() => handleTransactionClick(transaction.id)}
                className="w-full rounded-xl shadow-sm p-4 flex items-center justify-between transition-colors"
                style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: contentCard.iconBackground }}
                  >
                    <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold" style={{ color: contentCard.title }}>
                      {transaction.recipient || transaction.sender || transaction.description}
                    </p>
                    <p className="text-sm" style={{ color: contentCard.subtitle }}>{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: contentCard.accentText }}>
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
