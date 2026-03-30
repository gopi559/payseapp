import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
const ACTION_MENU_WIDTH = 184
const ACTION_MENU_HEIGHT = 108
const ACTION_MENU_OFFSET = 8
const VIEWPORT_EDGE_GAP = 8

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
  const [txnType, setTxnType] = useState('ALL')
  const [rrnSearch, setRrnSearch] = useState('')
  const [actionMenu, setActionMenu] = useState(null)
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

  const closeActionMenu = useCallback(() => {
    setActionMenu(null)
  }, [])

  const openActionMenu = useCallback(
    (event, row) => {
      event.stopPropagation()
      const rowId = row.txn_id ?? row.id
      if (actionMenu?.rowId === rowId) {
        closeActionMenu()
        return
      }
      const triggerRect = event.currentTarget.getBoundingClientRect()
      const spaceBelow = window.innerHeight - triggerRect.bottom
      const openUp = spaceBelow < ACTION_MENU_HEIGHT + ACTION_MENU_OFFSET
      const rawTop = openUp
        ? triggerRect.top - ACTION_MENU_HEIGHT - ACTION_MENU_OFFSET
        : triggerRect.bottom + ACTION_MENU_OFFSET
      const top = Math.min(
        Math.max(rawTop, VIEWPORT_EDGE_GAP),
        window.innerHeight - ACTION_MENU_HEIGHT - VIEWPORT_EDGE_GAP
      )
      const rawLeft = triggerRect.right - ACTION_MENU_WIDTH
      const left = Math.min(
        Math.max(rawLeft, VIEWPORT_EDGE_GAP),
        window.innerWidth - ACTION_MENU_WIDTH - VIEWPORT_EDGE_GAP
      )
      setActionMenu({ rowId, top, left })
    },
    [actionMenu?.rowId, closeActionMenu]
  )

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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchList()
    }, 300)
    return () => clearTimeout(timer)
  }, [fromDate, toDate])

  useEffect(() => {
    if (!actionMenu) return
    const handleViewportChange = () => setActionMenu(null)
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)
    return () => {
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [actionMenu])

  const handleApplyFilters = () => {
    fetchList()
  }

  const handleClearDates = () => {
    setFromDate('')
    setToDate('')
    setTxnType('ALL')
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

  const filteredData = useMemo(() => {
    let rows = Array.isArray(data) ? data : []

    if (txnType !== 'ALL') {
      rows = rows.filter((row) => String(row?.txn_type ?? '').toUpperCase() === txnType)
    }

    const rrn = rrnSearch.trim().toLowerCase()
    if (rrn) {
      rows = rows.filter((row) => String(row?.rrn ?? '').toLowerCase().includes(rrn))
    }

    return rows
  }, [data, txnType, rrnSearch])

  const openDisputeModal = async (row) => {
    closeActionMenu()
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

  const totalItems = filteredData.length
  const hasActiveFilters = Boolean(fromDate || toDate || txnType !== 'ALL' || rrnSearch.trim())

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
      content: (row) => {
        const isSuccess = row.status === 1
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: isSuccess ? '#E8F7EC' : '#F3F4F6',
              color: isSuccess ? '#1F8F45' : '#374151',
            }}
          >
            {isSuccess ? t('success') : String(row.status ?? '-')}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'actions',
      content: (row) => {
        const rowId = row.txn_id ?? row.id
        const isOpen = actionMenu?.rowId === rowId
        return (
          <div className="inline-block">
            <button
              type="button"
              onClick={(event) => openActionMenu(event, row)}
              className="p-2 rounded-lg inline-flex items-center gap-1"
              style={{ color: tableColors.text }}
              aria-label={t('actions')}
              aria-expanded={isOpen}
            >
              <HiEllipsisVertical className="w-5 h-5" />
            </button>
            {isOpen && (
              <>
                <div className="fixed inset-0 z-40" aria-hidden="true" onClick={closeActionMenu} />
                <div
                  className="fixed z-[70] w-[184px] rounded-xl py-1 overflow-hidden"
                  style={{
                    top: actionMenu.top,
                    left: actionMenu.left,
                    border: `1px solid ${tableColors.border}`,
                    backgroundColor: tableColors.rowBackground || '#FFFFFF',
                    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.14), 0 2px 6px rgba(15, 23, 42, 0.08)',
                  }}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      closeActionMenu()
                      navigate(`/customer/transactions/view/${row.id}`, { state: { row } })
                    }}
                    className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-left transition-colors"
                    style={{ color: tableColors.text, backgroundColor: 'transparent' }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.backgroundColor = tableColors.rowHover || '#EEF4FF'
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.backgroundColor = 'transparent'
                    }}
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
                    className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-left transition-colors"
                    style={{ color: tableColors.text, backgroundColor: 'transparent' }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.backgroundColor = tableColors.rowHover || '#EEF4FF'
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.backgroundColor = 'transparent'
                    }}
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
          <div className="mb-3 flex-shrink-0">
            <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label htmlFor="from-date" className="text-xs font-medium" style={{ color: contentCard.subtitle }}>
                {t('from_date')}
              </label>
              <div className="relative">
                <input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="h-[38px] rounded-md border px-[10px] py-[6px] pr-10 text-sm w-full"
                  style={{ ...sharedInputStyle, color: fromDate ? tableColors.text : 'transparent' }}
                />
                {!fromDate && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none" style={{ color: contentCard.subtitle }}>
                    DD-MM-YYYY
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label htmlFor="to-date" className="text-xs font-medium" style={{ color: contentCard.subtitle }}>
                {t('to_date')}
              </label>
              <div className="relative">
                <input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className="h-[38px] rounded-md border px-[10px] py-[6px] pr-10 text-sm w-full"
                  style={{ ...sharedInputStyle, color: toDate ? tableColors.text : 'transparent' }}
                />
                {!toDate && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none" style={{ color: contentCard.subtitle }}>
                    DD-MM-YYYY
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label htmlFor="txn-type" className="text-xs font-medium" style={{ color: contentCard.subtitle }}>
                {t('txn_type')}
              </label>
              <select
                id="txn-type"
                value={txnType}
                onChange={(event) => setTxnType(event.target.value)}
                className="h-[38px] rounded-md border px-[10px] py-[6px] text-sm w-full"
                style={sharedInputStyle}
              >
                <option value="ALL">All</option>
                <option value="EXT WTW703">EXT WTW703</option>
                <option value="WTC EXT">WTC EXT</option>
                <option value="EXT CTC">EXT CTC</option>
                <option value="WTW">WTW</option>
                <option value="EXT CTW">EXT CTW</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label htmlFor="rrn-search" className="text-xs font-medium" style={{ color: contentCard.subtitle }}>
                {t('rrn')}
              </label>
              <input
                id="rrn-search"
                type="text"
                value={rrnSearch}
                onChange={(event) => setRrnSearch(event.target.value)}
                placeholder={t('enter_rrn_number')}
                className="h-[38px] rounded-md border px-[10px] py-[6px] text-sm w-full"
                style={sharedInputStyle}
              />
            </div>
            <div className="flex items-end self-end">
              <button
                type="button"
                onClick={handleApplyFilters}
                disabled={loading}
                className="h-[38px] px-4 rounded-md text-sm font-medium text-white"
                style={{ backgroundColor: receiveColors.accentText }}
              >
                {t('apply')}
              </button>
            </div>
            <div className="flex items-end self-end">
              <button
                type="button"
                onClick={handleClearDates}
                className="h-[38px] px-4 rounded-md border text-sm font-medium"
                style={sharedInputStyle}
              >
                {t('clear')}
              </button>
            </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <DataTable
              data={filteredData}
              headers={headers}
              loading={loading}
              searchPlaceholder={t('search_in_table')}
              totalItems={totalItems}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              pageSizeOptions={[10, 20, 50, 100]}
              totalRowsLabel={t('total_rows_pattern')}
              emptyMessage={hasActiveFilters ? 'no_data_found' : 'no_transactions_yet'}
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
