import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { HiDocumentText, HiEye } from 'react-icons/hi2'
import PageContainer from '../../Reusable/PageContainer'
import DataTable from '../../Reusable/TransactionTable.jsx'
import { getTransactionList } from './transaction.service.jsx'

const DEFAULT_PAGE_SIZE = 10
const FETCH_PAGE_SIZE = 500

// Show txn_time exactly as in API response (no timezone conversion)
const formatDateTime = (dateString) => {
  if (!dateString) return '—'
  return String(dateString)
}

const getDebitFirst = (row, field) => {
  const details = row?.debit_details
  if (!Array.isArray(details) || details.length === 0) return '—'
  const first = details[0]
  const key = field === 'user_id' ? 'user_id' : field === 'acct_number' ? 'acct_number' : field === 'card_number' ? 'card_number' : 'currency_code'
  return first?.[key] ?? '—'
}

// Backend expects "YYYY-MM-DD HH:mm:ss" (space, not 'T')
const toStartTime = (dateStr) => (dateStr ? `${dateStr} 00:00:00` : undefined)
const toEndTime = (dateStr) => (dateStr ? `${dateStr} 23:59:59` : undefined)

const TransactionList = () => {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const fetchList = async (dateOverrides) => {
    setLoading(true)
    try {
      const params = {
        page: 1,
        success_only: true,
        no_of_data: FETCH_PAGE_SIZE,
        get_user_details: true,
      }
      const useFrom = dateOverrides?.start_time !== undefined ? dateOverrides.start_time : (fromDate ? toStartTime(fromDate) : undefined)
      const useTo = dateOverrides?.end_time !== undefined ? dateOverrides.end_time : (toDate ? toEndTime(toDate) : undefined)
      if (useFrom) params.start_time = useFrom
      if (useTo) params.end_time = useTo
      const { data: list } = await getTransactionList(params)
      setData(Array.isArray(list) ? list : [])
      setCurrentPage(1)
    } catch (err) {
      console.error(err)
      toast.error(err?.message || 'Failed to load transactions')
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
    fetchList({ start_time: undefined, end_time: undefined })
  }

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page)
    if (newPageSize != null && newPageSize !== pageSize) {
      setPageSize(newPageSize)
    }
  }

  const totalItems = data.length

  const headers = [
    { key: 'id', label: 'ID' },
    { key: 'txn_id', label: 'Txn ID' },
    { key: 'rrn', label: 'RRN' },
    { key: 'txn_type', label: 'Txn Type' },
    { key: 'txn_short_desc', label: 'Short Desc' },
    { key: 'txn_desc', label: 'Description' },
    {
      key: 'txn_time',
      label: 'Time',
      content: (row) => formatDateTime(row.txn_time),
    },
    { key: 'txn_amount', label: 'Amount' },
    { key: 'fee_amount', label: 'Fee' },
    { key: 'channel_type', label: 'Channel' },
    // { key: 'device_id', label: 'Device ID', content: (row) => row.device_id || '—' },
    // { key: 'remarks', label: 'Remarks', content: (row) => row.remarks || '—' },
    {
      key: 'status',
      label: 'Status',
      content: (row) => (row.status === 1 ? 'Success' : String(row.status ?? '—')),
    },
    {
      key: 'debit_user_id',
      label: 'Debit User ID',
      content: (row) => getDebitFirst(row, 'user_id'),
    },
    {
      key: 'debit_acct_number',
      label: 'Debit Acct',
      content: (row) => getDebitFirst(row, 'acct_number'),
    },
    {
      key: 'debit_card_number',
      label: 'Debit Card',
      content: (row) => getDebitFirst(row, 'card_number'),
    },
    {
      key: 'debit_currency_code',
      label: 'Debit Currency',
      content: (row) => getDebitFirst(row, 'currency_code'),
    },
    {
      key: 'actions',
      label: 'Actions',
      content: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/customer/transactions/view/${row.id}`, { state: { row } })
          }}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 inline-flex items-center gap-1"
          aria-label="View"
        >
          <HiEye className="w-5 h-5" />
          <span className="text-xs">View</span>
        </button>
      ),
    },
  ]

  return (
    <PageContainer className="h-full">
      <div className="px-4 py-6 w-full h-full flex flex-col gap-4 min-h-0">
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <HiDocumentText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Transactions</h2>
              <p className="text-sm text-gray-500">View transaction list</p>
            </div>
          </div>
        </div>

        <div className="w-full bg-white rounded-lg shadow-sm p-4 sm:p-6 overflow-visible">
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="from-date" className="text-xs font-medium text-gray-600">
                From Date
              </label>
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="to-date" className="text-xs font-medium text-gray-600">
                To Date
              </label>
              <input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleClearDates}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
          <DataTable
            data={data}
            headers={headers}
            loading={loading}
            searchPlaceholder="Search in table..."
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            pageSizeOptions={[10, 20, 50, 100]}
            totalRowsLabel="Total Rows: {count}"
            emptyMessage="No transactions yet."
            tableMaxHeight="280px"
          />
        </div>
      </div>
    </PageContainer>
  )
}

export default TransactionList

