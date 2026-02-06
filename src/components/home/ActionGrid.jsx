import React from 'react'
import { MdOutlineArrowOutward } from 'react-icons/md'
import { GoArrowDownLeft } from 'react-icons/go'
import { BsCashCoin } from 'react-icons/bs'
import { IoCashOutline } from 'react-icons/io5'
import { HiTicket } from 'react-icons/hi2'
import { FaQrcode } from 'react-icons/fa'
import { MdReceipt } from 'react-icons/md'
import { HiCube } from 'react-icons/hi'
import airtimeIcon from '../../assets/PayseyMobileiconMobile.svg'
import ActionTile from './ActionTile'

const ActionGrid = () => {
  // Order matches mobile application exactly:
  // 1. Cash In, 2. Cash Out, 3. Voucher, 4. Send, 5. Receive, 6. Pay Bill, 7. Scan, 8. Airtime, 9. Donate
  const actions = [
    { icon: <BsCashCoin />, label: 'Cash In', route: '/customer/cash-in', isComponent: true },
    { icon: <IoCashOutline />, label: 'Cash Out', route: '/customer/cash-out', isComponent: true },
    { icon: <HiTicket />, label: 'Voucher', route: '/customer/voucher', isComponent: true },
    { icon: <MdOutlineArrowOutward />, label: 'Send', route: '/customer/send', isComponent: true },
    { icon: <GoArrowDownLeft />, label: 'Receive', route: '/customer/receive', isComponent: true },
    { icon: <MdReceipt />, label: 'Pay Bill', route: '/customer/send', isComponent: true },
    // { icon: <FaQrcode />, label: 'Scan', route: '/customer/send', isComponent: true },
    { icon: <img src={airtimeIcon} alt="Airtime" className="w-27 h-27 sm:w-28 sm:h-28 object-contain" />, label: 'Airtime', route: '/customer/send', isImage: true },
    
    








    { icon: <HiCube />, label: 'Donate', route: '/customer/send', isComponent: true },

  ]
  
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 bg-white">
      <div className="grid grid-cols-3 gap-4 sm:gap-5 max-w-2xl mx-auto">
        {actions.map((action, index) => (
          <ActionTile
            key={index}
            icon={action.icon}
            label={action.label}
            route={action.route}
            isComponent={action.isComponent}
            isImage={action.isImage}
          />
        ))}
      </div>
    </div>
  )
}

export default ActionGrid

