import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { HiTicket, HiEye } from 'react-icons/hi2'
import PageContainer from '../../Reusable/PageContainer'
import DataTable from '../../Reusable/Table'
import Button from '../../Reusable/Button'
import { voucherService } from './voucher.service.jsx'

const formatDate = (dateString) => {
  if (!dateString) return '—'
  try {
    const d = new Date(dateString)
    return d.toLocaleString()
  } catch {
    return dateString
  }
}

const VoucherPage = () => {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchList = async () => {
    setLoading(true)
    try {
      const result = await voucherService.getCashcodeList({ page: 1, no_of_data: 100, status: 1 })
      const list = result?.data?.list ?? []
      setData(Array.isArray(list) ? list : [])
      setCurrentPage(1)
    } catch (err) {
      console.error(err)
      toast.error(err?.message || 'Failed to load cash codes')
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
  const sample = data[0]
  const keys = sample ? Object.keys(sample).filter((k) => k !== 'actions') : ['cashcode', 'amount', 'receiver_name', 'receiver_mobile', 'status', 'temp_pin', 'created_at']
  const headers = [
    ...keys.map((key) => {
      if (key === 'created_at' || key.includes('_at'))
        return { key, label: key.replace(/_/g, ' '), content: (row) => formatDate(row[key]) }
      return { key, label: key.replace(/_/g, ' ') }
    }),
    {
      key: 'actions',
      label: 'Actions',
      content: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            navigate('/customer/voucher/view', { state: { row } })
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
    <PageContainer className="h-full overflow-hidden flex flex-col">
      <div className="px-4 pt-4 pb-2 w-full flex-shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <HiTicket className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Voucher (Cash Code)</h2>
              <p className="text-sm text-gray-500">View and create cash codes</p>
            </div>
          </div>
          <Button type="button" onClick={() => navigate('/customer/voucher/create')}>
            Create Cash Code
          </Button>
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
              emptyMessage="No cash codes yet."
              fillHeight
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default VoucherPage


