export const BILL_SERVICES = [
  { id: '2330', name: 'Sigtas', nameKey: 'bill_service_sigtas' },
  { id: '2331', name: 'Breshna', nameKey: 'bill_service_breshna' },
]

export const getBillServiceName = (serviceId, t) => {
  const service = BILL_SERVICES.find((s) => s.id === String(serviceId))
  if (!service) return t ? t('bill_payment') : 'Bill Payment'
  return t ? t(service.nameKey, service.name) : service.name
}
