import React from 'react'
import { MdOutlineArrowOutward } from 'react-icons/md'
import { GoArrowDownLeft } from 'react-icons/go'
import { FaHistory } from 'react-icons/fa'
import { BsQrCodeScan, BsCashCoin } from 'react-icons/bs'
import { IoCashOutline } from 'react-icons/io5'
import ActionTile from './ActionTile'
import { ROUTES } from '../../../config/routes'

const ActionGrid = () => {
  const actions = [
    { icon: <MdOutlineArrowOutward />, label: 'Send Money', route: ROUTES.SEND_START, isComponent: true },
    { icon: <GoArrowDownLeft />, label: 'Receive', route: ROUTES.RECEIVE, isComponent: true },
    { icon: <BsQrCodeScan />, label: 'Scan QR', route: ROUTES.SCAN, isComponent: true },
    { icon: <BsCashCoin />, label: 'Cash In', route: ROUTES.CASH_IN, isComponent: true },
    { icon: <IoCashOutline />, label: 'Cash Out', route: ROUTES.CASH_OUT, isComponent: true },
    { icon: '📱', label: 'Airtime', route: ROUTES.SEND_START },
    { icon: '🎫', label: 'Voucher', route: ROUTES.SEND_START },
    { icon: <FaHistory />, label: 'History', route: ROUTES.HISTORY, isComponent: true },
  ]
  
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-4 gap-4 sm:gap-5 max-w-4xl mx-auto">
        {actions.map((action, index) => (
          <ActionTile
            key={index}
            icon={action.icon}
            label={action.label}
            route={action.route}
            isComponent={action.isComponent}
          />
        ))}
      </div>
    </div>
  )
}

export default ActionGrid


