import React from 'react'
import ActionTile from './ActionTile'
import { ROUTES } from '../../../config/routes'

const ActionGrid = () => {
  const actions = [
    { icon: '💸', label: 'Send Money', route: ROUTES.SEND_START },
    { icon: '💰', label: 'Receive', route: ROUTES.RECEIVE },
    { icon: '📷', label: 'Scan QR', route: ROUTES.SCAN },
    { icon: '💵', label: 'Cash In', route: ROUTES.CASH_IN },
    { icon: '🏧', label: 'Cash Out', route: ROUTES.CASH_OUT },
    { icon: '📱', label: 'Airtime', route: ROUTES.SEND_START },
    { icon: '🎫', label: 'Voucher', route: ROUTES.SEND_START },
    { icon: '❤️', label: 'Donate', route: ROUTES.SEND_START },
    { icon: '📊', label: 'More', route: ROUTES.HISTORY },
  ]
  
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {actions.map((action, index) => (
        <ActionTile
          key={index}
          icon={action.icon}
          label={action.label}
          route={action.route}
        />
      ))}
    </div>
  )
}

export default ActionGrid

