import React, { useEffect, useState } from 'react'
import { HiPencil, HiEye, HiTrash, HiXMark } from 'react-icons/hi2'
import THEME_COLORS from '../theme/colors'

const ActionPopover = ({
  anchorEl,
  open,
  handleClose,
  selectedRow,
  onEdit,
  onView,
  onDelete,
  hideEdit = false,
  hideView = false,
  hideDelete = false,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const tableColors = THEME_COLORS.table
  const popupColors = THEME_COLORS.popup

  useEffect(() => {
    if (open && anchorEl) {
      const rect = anchorEl.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4,
        left: Math.min(rect.left, window.innerWidth - 160),
      })
    }
  }, [open, anchorEl])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40" aria-hidden="true" onClick={handleClose} />
      <div
        className="fixed z-50 min-w-[140px] rounded-lg py-2"
        style={{ top: position.top, left: position.left, backgroundColor: tableColors.rowBackground, border: `1px solid ${tableColors.border}` }}
      >
        <div className="flex items-center justify-between px-3 pb-2 mb-2" style={{ borderBottom: `1px solid ${tableColors.border}` }}>
          <span className="text-xs font-medium" style={{ color: tableColors.text }}>Actions</span>
          <button type="button" onClick={handleClose} className="p-1 rounded" aria-label="Close" style={{ color: tableColors.text }}>
            <HiXMark className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col">
          {!hideView && (
            <button
              type="button"
              onClick={() => {
                onView?.(selectedRow)
                handleClose()
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-left"
              style={{ color: tableColors.text }}
            >
              <HiEye className="w-4 h-4" />
              View
            </button>
          )}
          {!hideEdit && (
            <button
              type="button"
              onClick={() => {
                onEdit?.(selectedRow)
                handleClose()
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-left"
              style={{ color: tableColors.text }}
            >
              <HiPencil className="w-4 h-4" style={{ color: popupColors.accent }} />
              Edit
            </button>
          )}
          {!hideDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete?.(selectedRow)
                handleClose()
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-left"
              style={{ color: tableColors.text }}
            >
              <HiTrash className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default ActionPopover
