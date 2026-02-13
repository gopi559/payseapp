/**
 * Generate STAN (System Trace Audit Number) from current time
 * Format: mmsscs (6 digits)
 * - mm: minutes (2 digits, padded)
 * - ss: seconds (2 digits, padded)
 * - cs: centiseconds (milliseconds / 10, 2 digits, padded)
 * 
 * @param {Date} now - Optional date/time to use. Defaults to current time
 * @returns {string} - 6-digit STAN string
 */
export const generateStan = (now = null) => {
  const dt = now ?? new Date()
  const mm = String(dt.getMinutes()).padStart(2, '0')
  const ss = String(dt.getSeconds()).padStart(2, '0')
  const cs = String(Math.floor(dt.getMilliseconds() / 10)).padStart(2, '0')
  return `${mm}${ss}${cs}`
}



