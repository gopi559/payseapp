import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import KeyValueDisplay from '../../Reusable/KeyValueDisplay'
import { formatTableDateTime } from '../../utils/formatDate'
import THEME_COLORS from '../../theme/colors'

const LABELS = {
  Cashcode: 'Voucher Code',
  Channel: 'Channel',
  Amount: 'Amount',
  Currency: 'Currency',
  ReceiverName: 'Receiver Name',
  ReceiverMobile: 'Phone Number',
  ReceiverFatherName: 'Father Name',
  ProvinceName: 'Province',
  DistrictName: 'District',
  VillageName: 'Village',
  NationalityName: 'Nationality',
  ReceiverIDType: 'ID Type',
  ReceiverIDNumber: 'ID Number',
  FullAddress: 'Full Address',
  CreatedAt: 'Created At',
}

const ViewVoucher = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const row = location.state?.row
  const contentCard = THEME_COLORS.contentCard

  if (!row) {
    return (
      <PageContainer>
        <p>No data available</p>
        <Button onClick={() => navigate('/customer/voucher')}>Back</Button>
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
              View Voucher
            </h2>
            <Button variant="outline" onClick={() => navigate('/customer/voucher')}>
              Back
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
              labels={LABELS}
              formatters={formatters}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default ViewVoucher

