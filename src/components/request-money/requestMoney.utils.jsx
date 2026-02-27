export const REQUEST_STATUS = {
  pending: 0,
  paid: 1,
  expired: 2,
  declined: 3,
}

export const getStatusConfig = (status) => {
  const s = Number(status)

  if (s === REQUEST_STATUS.pending) {
    return { label: 'Pending', bgClass: 'bg-sky-100', textClass: 'text-sky-600' }
  }
  if (s === REQUEST_STATUS.paid) {
    return { label: 'Paid', bgClass: 'bg-emerald-100', textClass: 'text-emerald-600' }
  }
  if (s === REQUEST_STATUS.expired) {
    return { label: 'Expired', bgClass: 'bg-amber-100', textClass: 'text-amber-600' }
  }
  if (s === REQUEST_STATUS.declined) {
    return { label: 'Declined', bgClass: 'bg-red-100', textClass: 'text-red-500' }
  }

  return { label: 'Unknown', bgClass: 'bg-gray-100', textClass: 'text-gray-500' }
}
export const getCustomerId = (user) =>
  user?.reg_info?.id ??
  user?.reg_info?.user_id ??
  user?.user_id ??
  user?.id ??
  null

export const normalizeMobile = (value) => {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('+')) return `+${trimmed.slice(1).replace(/\D/g, '')}`
  return `+${trimmed.replace(/\D/g, '')}`
}

export const formatShortDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const sortByAddedOnDesc = (list) =>
  [...list].sort((a, b) => new Date(b?.added_on || 0) - new Date(a?.added_on || 0))

export const buildRemarks = ({ category, note }) => {
  const cleanCategory = String(category || '').trim()
  const cleanNote = String(note || '').trim()

  if (cleanCategory && cleanCategory !== 'Others' && cleanNote) {
    return `${cleanCategory} - ${cleanNote}`
  }
  if (cleanNote) return cleanNote
  if (cleanCategory) return cleanCategory
  return ''
}
