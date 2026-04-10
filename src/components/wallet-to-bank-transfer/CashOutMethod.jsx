import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import { HiChevronRight } from 'react-icons/hi2'
import { IoArrowBack } from 'react-icons/io5'
import THEME_COLORS from '../../theme/colors'

const CashOutMethod = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const menuCard = THEME_COLORS.menuCard

  return (
    <MobileScreenContainer>
      <div className="min-h-screen flex justify-center">
        <div className="w-full max-w-md px-4 pt-6 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => navigate('/customer/home')}
              className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#357219]"
              aria-label={t('go_back')}
            >
              <IoArrowBack size={18} />
            </button>
            <h1 className="text-xl font-semibold" style={{ color: menuCard.screenTitle }}>
              {t('cash_out')}
            </h1>
          </div>

          <h1 className="text-2xl font-semibold mb-1" style={{ color: '#111827' }}>
            {t('transfer_money_using')}
          </h1>

          <p className="text-base mb-8" style={{ color: menuCard.screenSubtitle }}>
            {t('select_payment_method')}
          </p>

          <button
            onClick={() => navigate('/customer/wallet-to-bank-transfer')}
            className="w-full text-left mb-5"
          >
            <div
              className="rounded-3xl p-6 flex items-center justify-between shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #05C15D 0%, #0F8A00 55%, #8ED7C0 100%)',
              }}
            >
              <div className="pr-4">
                <h2 className="text-xl font-semibold" style={{ color: menuCard.cardTitle }}>
                  {t('wallet_to_bank')}
                </h2>

                <p className="text-base mt-2" style={{ color: menuCard.cardSubtitle }}>
                  {t('bank_transfer')}
                </p>

                <div
                  className="inline-flex items-center mt-4 px-4 py-1.5 text-sm rounded-full"
                  style={{
                    backgroundColor: menuCard.pillBackground,
                    color: menuCard.pillText,
                  }}
                >
                  {t('instant_convenient_secure')}
                </div>
              </div>

              <div className="flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: menuCard.iconBackground }}
                >
                  <HiChevronRight className="w-6 h-6" style={{ color: menuCard.iconColor }} />
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/customer/wallet-to-card/cards')}
            className="w-full text-left"
          >
            <div
              className="rounded-3xl p-6 flex items-center justify-between shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${menuCard.cardGradientStart} 0%, ${menuCard.cardGradientEnd} 100%)`,
              }}
            >
              <div className="pr-4">
                <h2 className="text-xl font-semibold" style={{ color: menuCard.cardTitle }}>
                  {t('wallet_to_card')}
                </h2>

                <p className="text-base mt-2" style={{ color: menuCard.cardSubtitle }}>
                  {t('transfer_money_to_card')}
                </p>

                <div
                  className="inline-flex items-center mt-4 px-4 py-1.5 text-sm rounded-full"
                  style={{
                    backgroundColor: menuCard.pillBackground,
                    color: menuCard.pillText,
                  }}
                >
                  {t('instant_convenient_secure')}
                </div>
              </div>

              <div className="flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: menuCard.iconBackground }}
                >
                  <HiChevronRight className="w-6 h-6" style={{ color: menuCard.iconColor }} />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </MobileScreenContainer>
  )
}

export default CashOutMethod
