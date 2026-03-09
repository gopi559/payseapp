import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiPhone } from 'react-icons/fi'
import { HiOutlineCurrencyDollar } from 'react-icons/hi2'
import { getStatusConfig, formatShortDate, REQUEST_STATUS } from './requestMoney.utils'
import THEME_COLORS from '../../theme/colors'

const RequestCard = ({
  item,
  variant = 'received',
  showActions = false,
  loadingAction = false,
  onDecline,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const statusConfig = getStatusConfig(item?.status)
  const canTakeAction = Number(item?.status) === REQUEST_STATUS.pending
  const isSent = variant === 'sent'
  const menuGreen = THEME_COLORS.header.background
  const contentCard = THEME_COLORS.contentCard

  const fullName =
    [
      isSent ? item?.recv_cust_fname : item?.req_cust_fname,
      isSent ? item?.recv_cust_lname : item?.req_cust_lname,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    (isSent ? item?.recv_cust_mobile : item?.req_cust_mobile) ||
    t('unknown')

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: `1px solid ${contentCard.border}` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-[20px] text-black">{fullName}</h3>

          <p className="mt-1 text-[16px] text-black flex items-center gap-2">
            <FiPhone size={16} />
            <span>{(isSent ? item?.recv_cust_mobile : item?.req_cust_mobile) || '-'}</span>
          </p>

          {item?.remarks && (
            <p className="mt-3 italic text-[15px] text-gray-500 break-words">
              {item.remarks}
            </p>
          )}

          <p className="mt-2 text-[15px] text-gray-500 font-medium">
            {formatShortDate(item?.added_on)}
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-end">
          <p className="text-[20px] font-bold flex items-center gap-1" style={{ color: menuGreen }}>
            <HiOutlineCurrencyDollar size={22} />
            <span>{Number(item?.amount || 0).toFixed(2)}</span>
          </p>

          <span
            className={`mt-2 px-3 py-1 rounded-lg text-[13px] font-semibold ${statusConfig.bgClass} ${statusConfig.textClass}`}
          >
            {t(statusConfig.labelKey)}
          </span>
        </div>
      </div>

      {showActions && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Decline */}
          <button
            type="button"
            disabled={!canTakeAction || loadingAction}
            onClick={onDecline}
            className={`h-12 rounded-xl font-semibold transition
              ${
                canTakeAction
                  ? 'bg-white'
                  : 'border border-gray-300 text-gray-400'
              }
              disabled:opacity-60
            `}
            style={
              canTakeAction
                ? { border: `1px solid ${menuGreen}`, color: menuGreen }
                : undefined
            }
          >
            {t('decline')}
          </button>

          {/* Pay */}
          <button
            type="button"
            disabled={!canTakeAction || loadingAction}
            onClick={() =>
              navigate('/customer/request-money/pay', {
                state: { request: item },
              })
            }
            className={`h-12 rounded-xl font-semibold transition
              ${
                canTakeAction
                  ? 'text-white'
                  : 'border border-gray-300 text-gray-400'
              }
              disabled:opacity-60
            `}
            style={canTakeAction ? { backgroundColor: menuGreen } : undefined}
          >
            {t('pay')}
          </button>
        </div>
      )}
    </div>
  )
}

export default RequestCard
