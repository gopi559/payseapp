import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { HiDocumentText } from 'react-icons/hi2'
import PageContainer from '../../Reusable/PageContainer'
import DataTable from '../../Reusable/TransactionTable.jsx'
import { getTransactionList, fetchByRrn } from './transaction.service.jsx'

const DEFAULT_PAGE_SIZE = 10
const FETCH_PAGE_SIZE = 500

const formatDateTime = (dateString) => {
  if (!dateString) return '—'
  try {
    const d = new Date(dateString)
    return d.toLocaleString()
  } catch {
    return dateString
  }
}

const TransactionList = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [rrnQuery, setRrnQuery] = useState('')
  const [rrnResult, setRrnResult] = useState(null)
  const [rrnLoading, setRrnLoading] = useState(false)

  const fetchList = async () => {
    setLoading(true)
    setRrnResult(null)
    try {
      const { data: list } = await getTransactionList({
        page: 1,
        no_of_data: FETCH_PAGE_SIZE,
        get_user_details: true,
        // success_only, start_time, end_time, beneficiary_id can be added when needed
      })
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

  const handleSearchByRrn = async (e) => {
    e.preventDefault()
    const rrn = rrnQuery?.trim()
    if (!rrn) {
      setRrnResult(null)
      return
    }
    setRrnLoading(true)
    setRrnResult(null)
    try {
      const { data: single } = await fetchByRrn(rrn)
      setRrnResult(single || null)
      if (!single) toast.info('No transaction found for this RRN')
    } catch (err) {
      console.error(err)
      toast.error(err?.message || 'Failed to fetch by RRN')
    } finally {
      setRrnLoading(false)
    }
  }

  const clearRrnFilter = () => {
    setRrnQuery('')
    setRrnResult(null)
  }

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page)
    if (newPageSize != null && newPageSize !== pageSize) {
      setPageSize(newPageSize)
    }
  }

  const displayData = rrnResult != null ? [rrnResult] : data
  const totalItems = rrnResult != null ? 1 : data.length

  const headers = [
    { key: 'rrn', label: 'RRN' },
    { key: 'txn_short_desc', label: 'Type' },
    { key: 'txn_desc', label: 'Description' },
    {
      key: 'txn_time',
      label: 'Time',
      content: (row) => formatDateTime(row.txn_time),
    },
    { key: 'txn_amount', label: 'Amount' },
    { key: 'fee_amount', label: 'Fee' },
    { key: 'channel_type', label: 'Channel' },
    {
      key: 'status',
      label: 'Status',
      content: (row) => (row.status === 1 ? 'Success' : String(row.status ?? '—')),
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
              <p className="text-sm text-gray-500">View and search transactions by RRN</p>
            </div>
          </div>
        </div>

        <div className="w-full bg-white rounded-lg shadow-sm p-4 sm:p-6 overflow-visible">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <form onSubmit={handleSearchByRrn} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search by RRN (default filter)"
                value={rrnQuery}
                onChange={(e) => setRrnQuery(e.target.value)}
                className="max-w-xs w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                aria-label="RRN"
              />
              <button
                type="submit"
                disabled={rrnLoading}
                className="rounded-lg bg-brand-primary text-white px-4 py-2 text-sm font-medium hover:bg-brand-action disabled:opacity-50"
              >
                {rrnLoading ? 'Searching…' : 'Fetch by RRN'}
              </button>
              {(rrnQuery.trim() || rrnResult != null) && (
                <button
                  type="button"
                  onClick={clearRrnFilter}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Show all
                </button>
              )}
            </form>
          </div>

          <DataTable
            data={displayData}
            headers={headers}
            loading={loading}
            searchPlaceholder="Search in table..."
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            pageSizeOptions={[10, 20, 50, 100]}
            totalRowsLabel="Total Rows: {count}"
            emptyMessage={rrnResult === null && rrnQuery.trim() ? 'No transaction found for this RRN.' : 'No transactions yet.'}
            tableMaxHeight="400px"
          />
        </div>
      </div>
    </PageContainer>
  )
}

export default TransactionList
