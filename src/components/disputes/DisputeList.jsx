import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { HiExclamationTriangle } from 'react-icons/hi2'
import PageContainer from '../../Reusable/PageContainer'
import DataTable from '../../Reusable/Table'
import { transactionService } from '../transactions/transaction.service.jsx'

const formatDate = (dateString) => {
  if (!dateString) return '—'
  try {
    const d = new Date(dateString)
    return d.toLocaleString()
  } catch {
    return dateString
  }
}

const DisputeList = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchList = async () => {
    setLoading(true)
    try {
      const { data: list } = await transactionService.getRaisedDisputeList({ page: 1, no_of_data: 10 })
      setData(Array.isArray(list) ? list : [])
      setCurrentPage(1)
    } catch (err) {
      console.error(err)
      toast.error(err?.message || 'Failed to load disputes')
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
    if (newPageSize != null && newPageSize !== pageSize) {
      setPageSize(newPageSize)
    }
  }

  const totalItems = data.length

  const headers = [
    { key: 'id', label: 'ID' },
    { key: 'transaction_id', label: 'Transaction ID' },
    { key: 'user_id', label: 'User ID' },
    { key: 'dispute_type_id', label: 'Dispute Type ID' },
    { key: 'details', label: 'Details' },
    { key: 'status', label: 'Status' },
    { key: 'assigned_to', label: 'Assigned To' },
    {
      key: 'created_at',
      label: 'Created At',
      content: (row) => formatDate(row.created_at),
    },
  ]

  return (
    <PageContainer className="h-full overflow-hidden flex flex-col">
      <div className="px-4 pt-4 pb-2 w-full flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <HiExclamationTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Disputes</h2>
              <p className="text-sm text-gray-500">View all raised disputes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-4 pb-4 overflow-hidden">
        <div className="w-full h-full bg-white rounded-lg shadow-sm p-4 sm:p-6 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col">
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
              emptyMessage="No disputes yet."
              fillHeight
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default DisputeList


