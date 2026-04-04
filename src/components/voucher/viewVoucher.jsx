import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import KeyValueDisplay from '../../Reusable/KeyValueDisplay'
import { formatTableDateTime } from '../../utils/formatDate'
import THEME_COLORS from '../../theme/colors'
import voucherService from './voucher.service.jsx'

const ViewVoucher = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const initialRow = location.state?.row || null
  const cashcode =
    location.state?.cashcode ||
    initialRow?.Cashcode ||
    initialRow?.cashcode ||
    initialRow?.CashCode ||
    initialRow?.cash_code ||
    initialRow?.voucher_code ||
    initialRow?.VoucherCode ||
    ''
  const [row, setRow] = useState(initialRow)
  const [loading, setLoading] = useState(false)
  const contentCard = THEME_COLORS.contentCard

  useEffect(() => {
    let isMounted = true

    const loadCashcodeDetails = async () => {
      if (!cashcode) return

      setLoading(true)
      try {
        const { data } = await voucherService.fetchCashcodeData(cashcode)
        if (isMounted && data && typeof data === 'object') {
          setRow((prev) => ({ ...(prev || {}), ...data }))
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error?.message || t('failed_to_load_cash_codes'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadCashcodeDetails()

    return () => {
      isMounted = false
    }
  }, [cashcode, t])

  const labels = {
    Cashcode: t('voucher_code'),
    Channel: t('channel'),
    Amount: t('amount'),
    CurrencyName: t('currency'),
    ReceiverName: t('receiver_name'),
    ReceiverMobile: t('phone_number'),
    ReceiverFatherName: t('father_name'),
    ProvinceName: t('province'),
    DistrictName: t('district'),
    VillageName: t('village'),
    NationalityName: t('nationality'),
    ReceiverIDTypeName: t('id_type'),
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

  const pick = (...keys) => {
    for (const key of keys) {
      if (row?.[key] != null && row[key] !== '') return row[key]
    }
    return undefined
  }

  const data = useMemo(
    () => {
      const currencyName = pick('CurrencyName', 'currency_name')
      const nationalityName = pick('NationalityName', 'nationality_name')
      const receiverIdTypeName = pick('ReceiverIDTypeName', 'receiver_id_type_name', 'id_type_name')
      const provinceName = pick('ProvinceName', 'province_name')
      const districtName = pick('DistrictName', 'district_name')
      const villageName = pick('VillageName', 'village_name')
      const fullAddress =
        pick('FullAddress', 'full_address', 'address') ||
        [villageName, districtName, provinceName].filter(Boolean).join(', ')

      return {
        Cashcode: pick('Cashcode', 'cashcode', 'CashCode', 'cash_code', 'voucher_code', 'VoucherCode'),
        Channel: pick('Channel', 'channel'),
        Amount: pick('Amount', 'amount'),
        ...(currencyName ? { CurrencyName: currencyName } : {}),
        ReceiverName: pick('ReceiverName', 'receiver_name', 'recv_cust_fname'),
        ReceiverMobile: pick('ReceiverMobile', 'receiver_mobile', 'mobile_number'),
        ReceiverFatherName: pick('ReceiverFatherName', 'receiver_father_name', 'father_name'),
        ProvinceName: provinceName,
        DistrictName: districtName,
        VillageName: villageName,
        ...(nationalityName ? { NationalityName: nationalityName } : {}),
        ...(receiverIdTypeName ? { ReceiverIDTypeName: receiverIdTypeName } : {}),
        ReceiverIDNumber: pick('ReceiverIDNumber', 'receiver_id_number', 'id_number'),
        FullAddress: fullAddress,
        CreatedAt: pick('CreatedAt', 'created_at', 'AddedOn', 'added_on'),
      }
    },
    [row]
  )

  const formatters = {
    CreatedAt: (v) => formatTableDateTime(v),
    Amount: (v) => (v != null && v !== '' ? `${Number(v).toFixed(2)}` : '-'),
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
            {loading ? (
              <p style={{ color: contentCard.subtitle }}>{t('loading')}</p>
            ) : null}
            <KeyValueDisplay
              data={data}
              labels={labels}
              formatters={formatters}
              excludedKeys={[
                'Currency',
                'Nationality',
                'ReceiverIDType',
                'ReceiverIDTypeName',
                'CurrencyName',
                'NationalityName',
              ].filter((key) => !labels[key] || !data[key])}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default ViewVoucher
