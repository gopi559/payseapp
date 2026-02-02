import React, { useMemo, useState } from 'react'

const formatCellDate = (dateString) => {
  if (!dateString) return '—'
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString()
  } catch {
    return dateString
  }
}

const DataTable = ({
  data = [],
  headers = [],
  loading = false,
  searchPlaceholder = 'Search...',
  totalItems = 0,
  currentPage = 1,
  pageSize: propPageSize = 10,
  onPageChange,
  emptyMessage = 'No data',
  pageSizeOptions = [10, 20, 50, 100],
  totalRowsLabel = 'Total Rows: {count}',
  tableMaxHeight = '280px',
  fillHeight = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [pageSize, setPageSize] = useState(propPageSize)
  const [quickJumpPage, setQuickJumpPage] = useState('')

  const effectivePageSize = propPageSize !== undefined && propPageSize !== null ? propPageSize : pageSize

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return []
    if (!searchQuery.trim()) return data
    const q = searchQuery.toLowerCase()
    return data.filter((row) =>
      headers.some((h) => {
        const val = row[h.key]
        return String(val ?? '').toLowerCase().includes(q)
      })
    )
  }, [data, searchQuery, headers])

  const totalForPagination = totalItems > 0 ? totalItems : filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalForPagination / effectivePageSize))
  const displayData = useMemo(
    () => filteredData.slice((currentPage - 1) * effectivePageSize, currentPage * effectivePageSize),
    [filteredData, currentPage, effectivePageSize]
  )

  const handlePageChange = (page, newPageSize) => {
    const nextPage = Math.max(1, Math.min(page, totalPages))
    const nextSize = newPageSize ?? effectivePageSize
    if (nextSize !== effectivePageSize) setPageSize(nextSize)
    onPageChange?.(nextPage, nextSize)
    setQuickJumpPage('')
  }

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value) || effectivePageSize
    setPageSize(newSize)
    onPageChange?.(1, newSize)
  }

  const handleQuickJump = (e) => {
    e.preventDefault()
    const page = parseInt(quickJumpPage, 10)
    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page, effectivePageSize)
    }
    setQuickJumpPage('')
  }

  const displayTotal = totalForPagination > 0 ? totalForPagination : (filteredData?.length ?? 0)
  const totalLabel = totalRowsLabel.replace('{count}', String(displayTotal))

  return (
    <div className="flex flex-col gap-4 w-full min-h-0">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading...</p>
      ) : filteredData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{emptyMessage}</p>
      ) : (
        <>
          {/* Fixed-height table box: only this area scrolls; scrollbar inside, below header */}
          <div
            className={`rounded-t-lg border border-gray-100 overflow-hidden ${fillHeight ? 'flex-1 min-h-0' : ''} ${!fillHeight ? 'border-b-0' : ''}`}
            style={fillHeight ? undefined : { height: tableMaxHeight, maxHeight: tableMaxHeight, minHeight: 0 }}
          >
            <div className="overflow-auto h-full w-full min-h-0">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 text-gray-600 font-medium shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                  <tr>
                    {headers.map((h) => (
                      <th key={h.key} className="p-3 bg-gray-50 whitespace-nowrap">
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((row, idx) => (
                    <tr key={row.id ?? idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      {headers.map((h) => (
                        <td key={h.key} className="p-3 text-gray-800">
                          {h.content
                            ? h.content(row)
                            : h.key && (h.key.includes('date') || h.key.includes('_on'))
                              ? formatCellDate(row[h.key])
                              : (row[h.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compact pagination: small height, same row */}
          <div className="flex flex-nowrap items-center justify-between gap-2 py-1.5 px-2 border border-gray-100 border-t-gray-200 rounded-b-lg shrink-0 min-h-[36px] bg-gray-50 overflow-x-auto">
              <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{totalLabel}</span>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  disabled={currentPage <= 1 || !onPageChange}
                  onClick={() => onPageChange && handlePageChange(currentPage - 1, effectivePageSize)}
                  className="min-w-[26px] h-6 rounded border border-gray-300 text-xs font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  aria-label="Previous page"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true
                    if (p === 1 || p === totalPages) return true
                    if (Math.abs(p - currentPage) <= 1) return true
                    return false
                  })
                  .reduce((acc, p, i, arr) => {
                    const prev = arr[i - 1]
                    if (prev != null && p - prev > 1) acc.push('ellipsis')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((item, idx) =>
                    item === 'ellipsis' ? (
                      <span key={`e-${idx}`} className="px-0.5 text-gray-400 text-xs">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => onPageChange && handlePageChange(item, effectivePageSize)}
                        className={`min-w-[26px] h-6 rounded border text-xs font-medium ${
                          item === currentPage
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  type="button"
                  disabled={currentPage >= totalPages || !onPageChange}
                  onClick={() => onPageChange && handlePageChange(currentPage + 1, effectivePageSize)}
                  className="min-w-[26px] h-6 rounded border border-gray-300 text-xs font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                <select
                  value={effectivePageSize}
                  onChange={(e) => onPageChange && handlePageSizeChange(e)}
                  className="rounded border border-gray-300 px-1.5 py-1 text-xs bg-white text-gray-700 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  aria-label="Rows per page"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
                <form onSubmit={handleQuickJump} className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">Go to</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    placeholder={String(currentPage)}
                    value={quickJumpPage}
                    onChange={(e) => setQuickJumpPage(e.target.value)}
                    className="w-9 rounded border border-gray-300 px-1 py-1 text-xs text-center focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                  <button
                    type="submit"
                    className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Page
                  </button>
                </form>
              </div>
            </div>
        </>
      )}
    </div>
  )
}

export default DataTable
