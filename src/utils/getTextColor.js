export const getTextColor = (bgColor) => {
  const color = String(bgColor || '').replace('#', '')

  if (!/^[0-9A-Fa-f]{6}$/.test(color)) {
    return '#FFFFFF'
  }

  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  const luminance = (0.299 * r) + (0.587 * g) + (0.114 * b)

  return luminance > 186 ? '#000000' : '#FFFFFF'
}
