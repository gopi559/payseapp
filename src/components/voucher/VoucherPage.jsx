import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { HiTicket, HiEye } from 'react-icons/hi2'
import PageContainer from '../../Reusable/PageContainer'
import DataTable from '../../Reusable/Table'
import Button from '../../Reusable/Button'
import voucherService from './voucher.service.jsx'
import { formatTableDateTime } from '../../utils/formatDate'
import THEME_COLORS from '../../theme/colors'

const VoucherPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const contentCard = THEME_COLORS.contentCard

  const fetchList = async () => {
    setLoading(true)
    try {
      const result = await voucherService.getCashcodeList({ page: 1, no_of_data: 100, status: 1 })
      const list = result?.data?.list ?? []
      setData(Array.isArray(list) ? list : [])
      setCurrentPage(1)
    } catch (err) {
      console.error(err)
      toast.error(err?.message || t('failed_to_load_cash_codes'))
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page)
    if (newPageSize != null && newPageSize !== pageSize) setPageSize(newPageSize)
  }

  const totalItems = data.length

  const allowedKeys = [
    'Cashcode',
    'Channel',
    'Amount',
    'ReceiverName',
    'ReceiverMobile',
    'CreatedAt',
  ]

  const tableHeaderMap = {
    Cashcode: t('voucher_code'),
    Channel: t('channel'),
    Amount: t('amount'),
    ReceiverName: t('receiver_name'),
    ReceiverMobile: t('phone_number'),
    CreatedAt: t('created_at'),
  }

  const headers = [
    ...allowedKeys.map((key) => {
      const label = tableHeaderMap[key] || key.replace(/([A-Z])/g, ' $1').trim()

      if (key === 'CreatedAt' || key.includes('At')) {
        return {
          key,
          label,
          content: (row) => formatTableDateTime(row[key] || row[key.toLowerCase()] || row[key.replace(/([A-Z])/g, '_$1').toLowerCase()]),
        }
      }
      if (key === 'Amount') {
        return {
          key,
          label,
          content: (row) => {
            const amount = row[key] || row[key.toLowerCase()] || row.amount
            return amount != null ? `${Number(amount).toFixed(2)}` : '-'
          },
        }
      }
      return {
        key,
        label,
        content: (row) => row[key] || row[key.toLowerCase()] || row[key.replace(/([A-Z])/g, '_$1').toLowerCase()] || '-',
      }
    }),
    {
      key: 'actions',
      label: t('actions'),
      content: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            navigate('/customer/voucher/view', { state: { row } })
          }}
          className="p-2 rounded-lg inline-flex items-center gap-1"
          style={{ color: contentCard.subtitle }}
          aria-label={t('view')}
        >
          <HiEye className="w-5 h-5" />
          <span className="text-xs">{t('view')}</span>
        </button>
      ),
    },
  ]

  return (
    <PageContainer className="h-full overflow-hidden flex flex-col">
      <div className="px-4 pt-4 pb-2 w-full flex-shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: contentCard.iconBackground }}>
              <HiTicket className="w-6 h-6" style={{ color: contentCard.iconColor }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: contentCard.title }}>{t('voucher_cash_code')}</h2>
              <p className="text-sm" style={{ color: contentCard.subtitle }}>{t('view_and_create_cash_codes')}</p>
            </div>
          </div>
          <Button type="button" onClick={() => navigate('/customer/voucher/create')}>
            {t('create_cash_code')}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-4 pb-4 overflow-hidden">
        <div
          className="w-full h-full rounded-lg shadow-sm p-4 sm:p-6 flex flex-col min-h-0 overflow-hidden"
          style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}
        >
          <div className="flex-1 min-h-0 flex flex-col">
            <DataTable
              data={data}
              headers={headers}
              loading={loading}
              searchPlaceholder={t('search_in_table')}
              totalItems={totalItems}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              pageSizeOptions={[10, 20, 50, 100]}
              totalRowsLabel={t('total_rows_pattern')}
              emptyMessage={t('no_cash_codes_yet')}
              fillHeight
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default VoucherPage
