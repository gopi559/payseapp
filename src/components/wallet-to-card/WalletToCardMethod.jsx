import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MobileScreenContainer from '../../Reusable/MobileScreenContainer'
import { HiChevronRight } from 'react-icons/hi2'
import THEME_COLORS from '../../theme/colors'

const WalletToCardMethod = () => {
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
            {t('withdraw_money_using')}
          </h1>

          <p className="text-base mb-8" style={{ color: menuCard.screenSubtitle }}>
            {t('select_withdraw_method')}
          </p>

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
                <h2
                  className="text-xl font-semibold"
                  style={{ color: menuCard.cardTitle }}
                >
                  {t('wallet_to_card')}
                </h2>

                <p className="text-base mt-2" style={{ color: menuCard.cardSubtitle }}>
                  {t('withdraw_money_to_card')}
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
                  <HiChevronRight
                    className="w-6 h-6"
                    style={{ color: menuCard.iconColor }}
                  />
                </div>
              </div>
            </div>
          </button>

        </div>
      </div>
    </MobileScreenContainer>
  )
}

export default WalletToCardMethod
