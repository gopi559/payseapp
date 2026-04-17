export const normalizeInternationalMobile = (value) => {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''

  return raw.startsWith('+') ? `+${digits}` : `+${digits}`
}

export const resolveCustomerMobileNumber = (user) =>
  normalizeInternationalMobile(
    user?.reg_info?.mobile ??
      user?.reg_info?.reg_mobile ??
      user?.reg_mobile ??
      user?.mobile ??
      user?.mobile_no ??
      ''
  )
