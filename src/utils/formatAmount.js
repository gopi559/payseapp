export const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '₹0.00'
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

export const formatAmountShort = (amount) => {
  if (!amount && amount !== 0) return '₹0'
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (numAmount >= 10000000) {
    return `₹${(numAmount / 10000000).toFixed(1)}Cr`
  }
  if (numAmount >= 100000) {
    return `₹${(numAmount / 100000).toFixed(1)}L`
  }
  if (numAmount >= 1000) {
    return `₹${(numAmount / 1000).toFixed(1)}K`
  }
  
  return `₹${numAmount.toFixed(0)}`
}

