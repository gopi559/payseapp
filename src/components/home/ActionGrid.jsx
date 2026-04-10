import React from 'react'
import cashInIcon from '../../assets/CashInNewIcon.svg'
import cashOutIcon from '../../assets/CashOutNewIcon.svg'
import sendIcon from '../../assets/SendIconNew.svg'
import receiveIcon from '../../assets/ReceiveNewIcon.svg'
import voucherIcon from '../../assets/VoucherNewIcon.svg'
import payBillIcon from '../../assets/BillPaymentNewIcon.svg'
import airtimeIcon from '../../assets/AirtimeNewIcon.svg'
import { FaExchangeAlt } from 'react-icons/fa'
import ActionTile from './ActionTile'

const ActionGrid = () => {
  const actions = [
    { id: 'cash_in', icon: <img src={cashInIcon} alt="Cash In" />, labelKey: 'cash_in', route: '/customer/cash-in', isImage: true },
    { id: 'cash_out', icon: <img src={cashOutIcon} alt="Cash Out" />, labelKey: 'cash_out', route: '/customer/cash-out', isImage: true },
    { id: 'send', icon: <img src={sendIcon} alt="Send" />, labelKey: 'send', route: '/customer/send', isImage: true },
    { id: 'receive', icon: <img src={receiveIcon} alt="Receive" />, labelKey: 'receive', route: '/customer/request-money', isImage: true },
    { id: 'voucher', icon: <img src={voucherIcon} alt="Voucher" />, labelKey: 'voucher', route: '/customer/voucher', isImage: true },
    { id: 'bill_payment', icon: <img src={payBillIcon} alt="Bill Payment" />, labelKey: 'pay_bill_short', route: '/customer/bill-payment', isImage: true },
    { id: 'balance', icon: <img src={airtimeIcon} alt="Balance" />, labelKey: 'airtime', route: '/customer/airtime', isImage: true },
    // { icon: <FaQrcode />, label: 'Scan', route: '/customer/scan', isComponent: true },

    { id: 'card_to_card', icon: <FaExchangeAlt />, labelKey: 'c2c', route: '/customer/card-to-card', isComponent: true },


  ]

  return (
    <div className="w-full px-4 pt-6">
      <div className="rounded-2xl bg-[#F7F8F7] px-6 py-8">
        <div className="grid grid-cols-4 gap-y-11 gap-x-5 justify-items-center">
        {actions.map((action, index) => (
          <ActionTile
            key={index}
            actionId={action.id}
            icon={action.icon}
            labelKey={action.labelKey}
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
