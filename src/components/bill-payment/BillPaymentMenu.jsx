import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import { HiChevronRight } from 'react-icons/hi2'
import THEME_COLORS from '../../theme/colors'
import { BILL_SERVICES, getBillServiceName } from './billPayment.constants'

const BillPaymentMenu = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const menuCard = THEME_COLORS.menuCard

  return (
    <MobileScreenContainer>
      <div className="min-h-screen flex justify-center">
        <div className="w-full max-w-md px-4 pt-6 pb-10">
          <h1
            className="text-2xl font-semibold mb-1"
            style={{ color: menuCard.screenTitle }}
          >
            {t('bill_payment')}
          </h1>
          <p className="text-base mb-8" style={{ color: menuCard.screenSubtitle }}>
            {t('select_bill_type_to_continue')}
          </p>

          <div className="space-y-4">
            {BILL_SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => navigate(`/customer/bill-payment/create/${service.id}`)}
                className="w-full text-left"
              >
                <div
                  className="rounded-3xl p-6 flex items-center justify-between shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${menuCard.cardGradientStart} 0%, ${menuCard.cardGradientEnd} 100%)`,
                  }}
                >
                  <div className="pr-4">
                    <h2
                      className="text-xl font-semibold"
                      style={{ color: menuCard.cardTitle }}
                    >
                      {getBillServiceName(service.id, t)}
                    </h2>
                    <p className="text-base mt-2" style={{ color: menuCard.cardSubtitle }}>
                      {t('pay_your_service_bill_securely', { service: getBillServiceName(service.id, t) })}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: menuCard.iconBackground }}
                    >
                      <HiChevronRight
                        className="w-6 h-6"
                        style={{ color: menuCard.iconColor }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </MobileScreenContainer>
  )
}

export default BillPaymentMenu
