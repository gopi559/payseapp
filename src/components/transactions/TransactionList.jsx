import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { HiDocumentText, HiEye, HiEllipsisVertical, HiExclamationTriangle } from 'react-icons/hi2'
import PageContainer from '../../Reusable/PageContainer'
import DataTable from '../../Reusable/TransactionTable.jsx'
import transactionService from './transaction.service.jsx'
import { formatTableDateTime } from '../../utils/formatDate'
import THEME_COLORS from '../../theme/colors'

const DEFAULT_PAGE_SIZE = 10
const FETCH_PAGE_SIZE = 500

const toStartTime = (dateStr) => (dateStr ? `${dateStr} 00:00:00` : undefined)
const toEndTime = (dateStr) => (dateStr ? `${dateStr} 23:59:59` : undefined)

const TransactionList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [rrnSearch, setRrnSearch] = useState('')
  const [actionRowId, setActionRowId] = useState(null)
  const [disputeModalRow, setDisputeModalRow] = useState(null)
  const [disputeTypes, setDisputeTypes] = useState([])
  const [disputeTypeId, setDisputeTypeId] = useState('')
  const [disputeDetails, setDisputeDetails] = useState('')
  const [disputeLoading, setDisputeLoading] = useState(false)
  const [disputeSubmitting, setDisputeSubmitting] = useState(false)

  const tableColors = THEME_COLORS.table
  const receiveColors = THEME_COLORS.receive
  const popupColors = THEME_COLORS.popup
  const contentCard = THEME_COLORS.contentCard

  const fetchList = async (dateOverrides) => {
    setLoading(true)
    try {
      const params = {
        page: 1,
        success_only: true,
        no_of_data: FETCH_PAGE_SIZE,
        get_user_details: true,
      }
      const useFrom =
        dateOverrides?.start_time !== undefined
          ? dateOverrides.start_time
          : fromDate
            ? toStartTime(fromDate)
            : undefined
      const useTo =
        dateOverrides?.end_time !== undefined ? dateOverrides.end_time : toDate ? toEndTime(toDate) : undefined
      if (useFrom) params.start_time = useFrom
      if (useTo) params.end_time = useTo
      const { data: list } = await transactionService.getList(params)
      setData(Array.isArray(list) ? list : [])
      setCurrentPage(1)
    } catch (error) {
      console.error(error)
      toast.error(error?.message || t('failed_to_load_transactions'))
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const handleApplyFilters = () => {
    fetchList()
  }

  const handleClearDates = () => {
    setFromDate('')
    setToDate('')
    setRrnSearch('')
    fetchList({ start_time: undefined, end_time: undefined })
  }

  const handleSearchByRrn = async () => {
    const rrn = rrnSearch?.trim()
    if (!rrn) {
      toast.error(t('please_enter_rrn_number'))
      return
    }
    setLoading(true)
    try {
      const { data: txn } = await transactionService.fetchByRrn(rrn)
      setData(txn ? [txn] : [])
      setCurrentPage(1)
      if (txn) toast.success(t('transaction_found'))
      else toast.info(t('no_transaction_found_for_rrn'))
    } catch (error) {
      console.error(error)
      toast.error(error?.message || t('failed_to_fetch_by_rrn'))
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const openDisputeModal = async (row) => {
    setActionRowId(null)
    setDisputeModalRow(row)
    setDisputeTypeId('')
    setDisputeDetails('')
    setDisputeLoading(true)
    try {
      const { data: types } = await transactionService.getDisputeList()
      setDisputeTypes(Array.isArray(types) ? types : [])
    } catch (error) {
      console.error(error)
      toast.error(error?.message || t('failed_to_load_dispute_types'))
      setDisputeModalRow(null)
    } finally {
      setDisputeLoading(false)
    }
  }

  const closeDisputeModal = () => {
    setDisputeModalRow(null)
    setDisputeTypeId('')
    setDisputeDetails('')
  }

  const handleSubmitDispute = async (event) => {
    event.preventDefault()
    if (!disputeModalRow) return
    if (!disputeTypeId) {
      toast.error(t('please_select_dispute_type'))
      return
    }
    setDisputeSubmitting(true)
    try {
      await transactionService.submitDispute({
        transaction_id: disputeModalRow.txn_id ?? disputeModalRow.id,
        dispute_type_id: Number(disputeTypeId),
        details: disputeDetails,
      })
      toast.success(t('dispute_raised_successfully'))
      closeDisputeModal()
    } catch (error) {
      console.error(error)
      toast.error(error?.message || t('failed_to_submit_dispute'))
    } finally {
      setDisputeSubmitting(false)
    }
  }

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page)
    if (newPageSize != null && newPageSize !== pageSize) {
      setPageSize(newPageSize)
    }
  }

  const totalItems = data.length

  const headers = [
    { key: 'rrn', label: 'rrn' },
    { key: 'txn_type', label: 'txn_type' },
    { key: 'txn_desc', label: 'description' },
    {
      key: 'txn_time',
      label: 'time',
      content: (row) => formatTableDateTime(row.txn_time),
    },
    { key: 'txn_amount', label: 'amount' },
    { key: 'fee_amount', label: 'fee' },
    { key: 'channel_type', label: 'channel' },
    {
      key: 'status',
      label: 'status',
      content: (row) => (row.status === 1 ? t('success') : String(row.status ?? '-')),
    },
    {
      key: 'actions',
      label: 'actions',
      content: (row) => {
        const isOpen = actionRowId === (row.txn_id ?? row.id)
        return (
          <div className="relative inline-block">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setActionRowId(isOpen ? null : row.txn_id ?? row.id)
              }}
              className="p-2 rounded-lg inline-flex items-center gap-1"
              style={{ color: tableColors.text }}
              aria-label={t('actions')}
              aria-expanded={isOpen}
            >
              <HiEllipsisVertical className="w-5 h-5" />
            </button>
            {isOpen && (
              <>
                <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setActionRowId(null)} />
                <div
                  className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg py-1"
                  style={{ border: `1px solid ${tableColors.border}` }}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setActionRowId(null)
                      navigate(`/customer/transactions/view/${row.id}`, { state: { row } })
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left"
                    style={{ color: tableColors.text }}
                  >
                    <HiEye className="w-4 h-4" />
                    {t('view')}
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      openDisputeModal(row)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left"
                    style={{ color: tableColors.text }}
                  >
                    <HiExclamationTriangle className="w-4 h-4" style={{ color: popupColors.accent }} />
                    {t('raise_dispute')}
                  </button>
                </div>
              </>
            )}
          </div>
        )
      },
    },
  ]

  const sharedInputStyle = {
    borderColor: tableColors.border,
    color: tableColors.text,
  }

  return (
    <PageContainer className="h-full overflow-hidden flex flex-col">
      <div className="px-4 pt-4 pb-2 w-full flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: contentCard.iconBackground }}>
              <HiDocumentText className="w-6 h-6" style={{ color: receiveColors.accentText }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: contentCard.title }}>{t('transactions')}</h2>
              <p className="text-sm" style={{ color: contentCard.subtitle }}>{t('view_transaction_list')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-4 pb-4 overflow-hidden">
        <div
          className="w-full h-full rounded-lg p-4 sm:p-6 flex flex-col min-h-0 overflow-hidden"
          style={{ border: `1px solid ${contentCard.border}`, backgroundColor: contentCard.background }}
        >
          <div className="flex flex-wrap items-end gap-3 mb-3 flex-shrink-0">
            <div className="flex flex-col gap-1">
              <label htmlFor="from-date" className="text-xs font-medium" style={{ color: contentCard.subtitle }}>
                {t('from_date')}
              </label>
              <div className="relative">
                <input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="rounded-lg border px-3 py-2 pr-10 text-sm w-full"
                  style={{ ...sharedInputStyle, color: fromDate ? tableColors.text : 'transparent' }}
                />
                {!fromDate && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none" style={{ color: contentCard.subtitle }}>
                    DD-MM-YYYY
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="to-date" className="text-xs font-medium" style={{ color: contentCard.subtitle }}>
                {t('to_date')}
              </label>
              <div className="relative">
                <input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className="rounded-lg border px-3 py-2 pr-10 text-sm w-full"
                  style={{ ...sharedInputStyle, color: toDate ? tableColors.text : 'transparent' }}
                />
                {!toDate && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none" style={{ color: contentCard.subtitle }}>
                    DD-MM-YYYY
                  </span>
                )}
              </div>
            </div>
            <button type="button" onClick={handleApplyFilters} disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium">
              {t('apply')}
            </button>
            <button type="button" onClick={handleClearDates} className="px-4 py-2 rounded-lg border text-sm font-medium" style={sharedInputStyle}>
              {t('clear')}
            </button>
            <div className="flex flex-col gap-1">
              <label htmlFor="rrn-search" className="text-xs font-medium" style={{ color: contentCard.subtitle }}>
                {t('rrn')}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  id="rrn-search"
                  type="text"
                  value={rrnSearch}
                  onChange={(event) => setRrnSearch(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), handleSearchByRrn())}
                  placeholder={t('enter_rrn_number')}
                  className="rounded-lg border px-3 py-2 text-sm min-w-[180px]"
                  style={sharedInputStyle}
                />
                <button type="button" onClick={handleSearchByRrn} disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
                  {t('search_by_rrn')}
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <DataTable
              data={data}
              headers={headers}
              loading={loading}
              searchPlaceholder="search_in_table"
              totalItems={totalItems}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              pageSizeOptions={[10, 20, 50, 100]}
              totalRowsLabel={t('total_rows_pattern')}
              emptyMessage="no_transactions_yet"
              fillHeight
            />
          </div>
        </div>
      </div>

      {disputeModalRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="rounded-xl w-full max-w-md overflow-hidden" style={{ border: `1px solid ${contentCard.border}`, backgroundColor: contentCard.background }}>
            <h3 className="text-lg font-semibold px-6 pt-6 pb-2" style={{ color: popupColors.title }}>{t('raise_dispute')}</h3>
            <form onSubmit={handleSubmitDispute} className="px-6 pb-6 space-y-4">
              <div>
                <label htmlFor="dispute-type" className="block text-sm font-medium mb-1" style={{ color: popupColors.title }}>
                  {t('dispute_type')}
                </label>
                <select
                  id="dispute-type"
                  value={disputeTypeId}
                  onChange={(event) => setDisputeTypeId(event.target.value)}
                  required
                  disabled={disputeLoading}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">{t('select_dispute_type')}</option>
                  {disputeTypes.map((disputeType) => (
                    <option key={disputeType.id} value={disputeType.id}>
                      {disputeType.description}
                    </option>
                  ))}
                </select>
                {disputeLoading && (
                  <p className="text-xs mt-1" style={{ color: popupColors.subtitle }}>{t('loading_dispute_types')}</p>
                )}
              </div>
              <div>
                <label htmlFor="dispute-details" className="block text-sm font-medium mb-1" style={{ color: popupColors.title }}>
                  {t('description')}
                </label>
                <textarea
                  id="dispute-details"
                  value={disputeDetails}
                  onChange={(event) => setDisputeDetails(event.target.value)}
                  placeholder={t('enter_dispute_description')}
                  rows={4}
                  className="w-full rounded-lg border px-3 py-2 text-sm resize-y"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeDisputeModal} className="px-4 py-2 rounded-lg border text-sm font-medium" style={sharedInputStyle}>
                  {t('cancel')}
                </button>
                <button type="submit" disabled={disputeSubmitting || disputeLoading} className="px-4 py-2 rounded-lg text-sm font-medium">
                  {disputeSubmitting ? t('submitting') : t('submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default TransactionList
