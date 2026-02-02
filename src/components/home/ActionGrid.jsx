import React from 'react'
import { MdOutlineArrowOutward } from 'react-icons/md'
import { GoArrowDownLeft } from 'react-icons/go'
import { FaHistory, FaCreditCard } from 'react-icons/fa'
import { BsCashCoin } from 'react-icons/bs'
import { IoCashOutline } from 'react-icons/io5'
import ActionTile from './ActionTile'

const ActionGrid = () => {
  const actions = [
    { icon: <MdOutlineArrowOutward />, label: 'Send Money', route: '/customer/send', isComponent: true },
    { icon: <GoArrowDownLeft />, label: 'Receive', route: '/customer/receive', isComponent: true },
    { icon: <FaCreditCard />, label: 'Wallet to Card', route: '/customer/wallet-to-card', isComponent: true },
    { icon: <BsCashCoin />, label: 'Cash In', route: '/customer/cash-in', isComponent: true },
    { icon: <IoCashOutline />, label: 'Cash Out', route: '/customer/cash-out', isComponent: true },
    { icon: '📱', label: 'Airtime', route: '/customer/send' },
    { icon: '🎫', label: 'Voucher', route: '/customer/send' },
    { icon: <FaHistory />, label: 'History', route: '/customer/history', isComponent: true },
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

