import React from 'react'
import cashInIcon from '../../assets/CashInNewIcon.svg'
import cashOutIcon from '../../assets/CashOutNewIcon.svg'
import sendIcon from '../../assets/SendIconNew.svg'
import receiveIcon from '../../assets/ReceiveNewIcon.svg'
import voucherIcon from '../../assets/VoucherNewIcon.svg'
import payBillIcon from '../../assets/BillPaymentNewIcon.svg'
import airtimeIcon from '../../assets/AirtimeNewIcon.svg'
import { FaQrcode } from 'react-icons/fa'
import ActionTile from './ActionTile'

const ActionGrid = () => {
  const actions = [
    { icon: <img src={cashInIcon} alt="Cash In" />, label: 'Cash in', route: '/customer/cash-in', isImage: true },
    { icon: <img src={cashOutIcon} alt="Cash Out" />, label: 'Cash out', route: '/customer/wallet-to-card', isImage: true },
    { icon: <img src={sendIcon} alt="Send" />, label: 'Send', route: '/customer/send', isImage: true },
    { icon: <img src={receiveIcon} alt="Receive" />, label: 'Receive', route: '/customer/request-money', isImage: true },
    { icon: <img src={voucherIcon} alt="Voucher" />, label: 'Voucher', route: '/customer/voucher', isImage: true },
    { icon: <img src={payBillIcon} alt="Pay Bill" />, label: 'Pay bill', route: '/customer/bill-payment', isImage: true },
    { icon: <img src={airtimeIcon} alt="Airtime" />, label: 'Airtime', route: '/customer/airtime', isImage: true },
    { icon: <FaQrcode />, label: 'Scan', route: '/customer/scan', isComponent: true },
  ]

  return (
    <div className="w-full px-4 pt-6">
      <div className="rounded-2xl bg-[#F7F8F7] px-6 py-8">
        <div className="grid grid-cols-4 gap-y-11 gap-x-5 justify-items-center">
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
    </div>
  )
}

export default ActionGrid
