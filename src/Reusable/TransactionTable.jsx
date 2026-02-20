import React, { useMemo, useState } from 'react'
import { formatTableDateTime } from '../utils/formatDate'
import THEME_COLORS from '../theme/colors'

const formatCellDate = (dateString) => {
  return formatTableDateTime(dateString)
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
  const tableColors = THEME_COLORS.table

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
    <div className={`flex flex-col gap-4 w-full min-h-0 ${fillHeight ? 'flex-1 min-h-0' : ''}`}>
      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs w-full rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: tableColors.border, color: tableColors.text, backgroundColor: tableColors.rowBackground }}
        />
      </div>

      {loading ? (
        <p className="text-center py-8" style={{ color: tableColors.text }}>Loading...</p>
      ) : filteredData.length === 0 ? (
        <p className="text-center py-8" style={{ color: tableColors.text }}>{emptyMessage}</p>
      ) : (
        <>
          <div
            className={`rounded-t-lg border overflow-hidden ${fillHeight ? 'flex-1 min-h-0' : ''} ${!fillHeight ? 'border-b-0' : ''}`}
            style={{
              borderColor: tableColors.border,
              ...(fillHeight ? undefined : { height: tableMaxHeight, maxHeight: tableMaxHeight, minHeight: 0 }),
            }}
          >
            <div className="overflow-auto h-full w-full min-h-0 table-scroll">
              <table className="w-full min-w-max text-sm text-left border-collapse">
                <thead className="sticky top-0 z-10 font-medium" style={{ backgroundColor: tableColors.headerBackground, borderBottom: `1px solid ${tableColors.border}`, color: tableColors.text }}>
                  <tr>
                    {headers.map((h) => (
                      <th key={h.key} className="p-3 whitespace-nowrap" style={{ backgroundColor: tableColors.headerBackground }}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((row, idx) => (
                    <tr key={row.id ?? idx} style={{ borderBottom: `1px solid ${tableColors.border}`, backgroundColor: tableColors.rowBackground }}>
                      {headers.map((h) => (
                        <td key={h.key} className="p-3" style={{ color: tableColors.text }}>
                          {h.content
                            ? h.content(row)
                            : h.key && (h.key.includes('date') || h.key.includes('_on'))
                              ? formatCellDate(row[h.key])
                              : (row[h.key] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-nowrap items-center justify-between gap-2 py-1.5 px-2 border rounded-b-lg shrink-0 min-h-[36px] overflow-x-auto" style={{ borderColor: tableColors.border, backgroundColor: tableColors.headerBackground }}>
            <span className="text-xs font-medium whitespace-nowrap" style={{ color: tableColors.text }}>{totalLabel}</span>

            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button type="button" disabled={currentPage <= 1 || !onPageChange} onClick={() => onPageChange && handlePageChange(currentPage - 1, effectivePageSize)} className="min-w-[26px] h-6 rounded border text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: tableColors.border, color: tableColors.text, backgroundColor: tableColors.rowBackground }} aria-label="Previous page">{'<'}</button>
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
                    <span key={`e-${idx}`} className="px-0.5 text-xs" style={{ color: tableColors.text }}>...</span>
                  ) : (
                    <button key={item} type="button" onClick={() => onPageChange && handlePageChange(item, effectivePageSize)} className="min-w-[26px] h-6 rounded border text-xs font-medium" style={{ borderColor: tableColors.border, color: tableColors.text, backgroundColor: item === currentPage ? tableColors.rowHover : tableColors.rowBackground }}>
                      {item}
                    </button>
                  )
                )}
              <button type="button" disabled={currentPage >= totalPages || !onPageChange} onClick={() => onPageChange && handlePageChange(currentPage + 1, effectivePageSize)} className="min-w-[26px] h-6 rounded border text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: tableColors.border, color: tableColors.text, backgroundColor: tableColors.rowBackground }} aria-label="Next page">{'>'}</button>
            </div>

            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <select value={effectivePageSize} onChange={(e) => onPageChange && handlePageSizeChange(e)} className="rounded border px-1.5 py-1 text-xs" style={{ borderColor: tableColors.border, backgroundColor: tableColors.rowBackground, color: tableColors.text }} aria-label="Rows per page">
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>{size} / page</option>
                ))}
              </select>
              <form onSubmit={handleQuickJump} className="flex items-center gap-1">
                <span className="text-xs" style={{ color: tableColors.text }}>Go to</span>
                <input type="number" min={1} max={totalPages} placeholder={String(currentPage)} value={quickJumpPage} onChange={(e) => setQuickJumpPage(e.target.value)} className="w-9 rounded border px-1 py-1 text-xs text-center" style={{ borderColor: tableColors.border, color: tableColors.text, backgroundColor: tableColors.rowBackground }} />
                <button type="submit" className="rounded border px-2 py-1 text-xs font-medium" style={{ borderColor: tableColors.border, color: tableColors.text, backgroundColor: tableColors.rowBackground }}>
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
