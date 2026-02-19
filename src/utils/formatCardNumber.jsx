/**
 * Formats a card number to show first 6 digits, asterisks, and last 4 digits
 * Format: 9004 27** **** 1632 (4 digits, 4 digits, 4 digits pattern)
 * @param {string|number} cardNumber - The card number to format
 * @returns {string} Formatted card number
 */
export const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return '—'
  
  // Remove all spaces and non-digit characters
  const cleaned = String(cardNumber).replace(/\s/g, '').replace(/\D/g, '')
  
  // If not enough digits, return as is or masked
  if (cleaned.length < 10) {
    return cleaned.length > 0 ? cleaned : '—'
  }
  
  // Extract first 6 digits and last 4 digits
  const first6 = cleaned.slice(0, 6)
  const last4 = cleaned.slice(-4)
  
  // Format as: 900427 **** 1632 (first 6 digits visible, then asterisks, then last 4 digits)
  // Grouped for visual clarity: 9004 27** **** 1632
  return `${first6.slice(0, 4)} ${first6.slice(4, 6)}** **** ${last4}`
}

