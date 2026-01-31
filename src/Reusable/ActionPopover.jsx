import React, { useEffect, useState } from 'react'
import { HiPencil, HiEye, HiTrash, HiXMark } from 'react-icons/hi2'

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
        className="fixed z-50 min-w-[140px] rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
        style={{ top: position.top, left: position.left }}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-3 pb-2 mb-2">
          <span className="text-xs font-medium text-gray-500">Actions</span>
          <button type="button" onClick={handleClose} className="p-1 rounded hover:bg-gray-100 text-gray-500" aria-label="Close">
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
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
            >
              <HiEye className="w-4 h-4 text-gray-500" />
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
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
            >
              <HiPencil className="w-4 h-4 text-blue-500" />
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
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
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
