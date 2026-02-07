// Format date only (for display purposes where time is not needed)
export const formatDate = (date) => {
  if (!date) return '—'
  
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '—'
    
    const now = new Date()
    const diffTime = Math.abs(now - d)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    }
    
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  } catch {
    return '—'
  }
}

// Format date and time (consistent format for all tables and view pages)
export const formatDateTime = (date) => {
  if (!date) return '—'
  
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '—'
    
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return '—'
  }
}

// Format for table cells (date-time format)
export const formatTableDateTime = (date) => {
  return formatDateTime(date)
}


