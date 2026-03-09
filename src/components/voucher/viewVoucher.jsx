import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import KeyValueDisplay from '../../Reusable/KeyValueDisplay'
import { formatTableDateTime } from '../../utils/formatDate'
import THEME_COLORS from '../../theme/colors'

const ViewVoucher = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const row = location.state?.row
  const contentCard = THEME_COLORS.contentCard
  const labels = {
    Cashcode: t('voucher_code'),
    Channel: t('channel'),
    Amount: t('amount'),
    Currency: t('currency'),
    ReceiverName: t('receiver_name'),
    ReceiverMobile: t('phone_number'),
    ReceiverFatherName: t('father_name'),
    ProvinceName: t('province'),
    DistrictName: t('district'),
    VillageName: t('village'),
    NationalityName: t('nationality'),
    ReceiverIDType: t('id_type'),
    ReceiverIDNumber: t('id_number'),
    FullAddress: t('full_address'),
    CreatedAt: t('created_at'),
  }

  if (!row) {
    return (
      <PageContainer>
        <p>{t('no_data_available')}</p>
        <Button onClick={() => navigate('/customer/voucher')}>{t('back')}</Button>
      </PageContainer>
    )
  }

  const data = {
    Cashcode: row.Cashcode,
    Channel: row.Channel,
    Amount: row.Amount,
    Currency: row.Currency,
    ReceiverName: row.ReceiverName,
    ReceiverMobile: row.ReceiverMobile,
    ReceiverFatherName: row.ReceiverFatherName,
    ProvinceName: row.ProvinceName,
    DistrictName: row.DistrictName,
    VillageName: row.VillageName,
    NationalityName: row.NationalityName,
    ReceiverIDType: row.ReceiverIDType,
    ReceiverIDNumber: row.ReceiverIDNumber,
    FullAddress: row.FullAddress,
    CreatedAt: row.CreatedAt,
  }

  const formatters = {
    CreatedAt: (v) => formatTableDateTime(v),
    Amount: (v) => `${Number(v).toFixed(2)}`,
  }

  return (
    <PageContainer>
      <div className="min-h-full px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: contentCard.title }}>
              {t('view_voucher')}
            </h2>
            <Button variant="outline" onClick={() => navigate('/customer/voucher')}>
              {t('back')}
            </Button>
          </div>

          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: contentCard.background,
              border: `1px solid ${contentCard.border}`,
            }}
          >
            <KeyValueDisplay
              data={data}
              labels={labels}
              formatters={formatters}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default ViewVoucher
