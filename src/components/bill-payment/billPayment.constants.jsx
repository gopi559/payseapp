export const BILL_SERVICES = [
  { id: '2330', name: 'Sigtas' },
  { id: '2331', name: 'Breshna' },
]

export const getBillServiceName = (serviceId) =>
  BILL_SERVICES.find((s) => s.id === String(serviceId))?.name || 'Bill Payment'
