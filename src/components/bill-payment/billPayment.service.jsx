import { getAuthToken, deviceId } from '../../services/api.jsx'
import { BILL_PAYMENT_CNP, BILL_PAYMENT_INFO_CP } from '../../utils/constant.jsx'
import authService from '../../Login/auth.service.jsx'

const isSuccess = (res) =>
  res?.code === 1 || String(res?.status).toUpperCase() === 'SUCCESS'

const normalizeExpiry = (expiry) =>
  String(expiry).replace('/', '').trim()

const billPaymentService = {
  fetchBillInfoAndSendOtp: async ({
    card_number,
    txn_amount,
    bill_number,
    service_id,
    mobile_no,
    rrn = '',
    stan = '',
    otp = '',
  }) => {
    const body = {
      card_number: String(card_number).trim().replace(/\s/g, ''),
      txn_amount: Number(txn_amount),
      bill_number: String(bill_number).trim(),
      service_id: String(service_id).trim(),
      otp: String(otp).trim(),
      rrn: String(rrn).trim(),
      stan: String(stan).trim(),
      mobile_no: String(mobile_no).trim(),
    }

    const response = await fetch(BILL_PAYMENT_INFO_CP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceinfo: JSON.stringify({
          device_type: 'WEB',
          device_id: deviceId,
        }),
      },
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Failed to fetch bill details')
    }

    return { data: res?.data ?? res, message: res?.message }
  },

  payBill: async ({
    card_number,
    txn_amount,
    cvv,
    expiry_date,
    otp,
    rrn,
    service_id,
    stan,
    mobile_no,
  }) => {
    const body = {
      card_number: String(card_number).trim().replace(/\s/g, ''),
      txn_amount: Number(txn_amount),
      cvv: String(cvv).trim(),
      expiry_date: normalizeExpiry(expiry_date),
      otp: String(otp).trim(),
      rrn: String(rrn).trim(),
      service_id: String(service_id).trim(),
      stan: String(stan).trim(),
      mobile_no: String(mobile_no).trim(),
    }

    const response = await fetch(BILL_PAYMENT_CNP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
        deviceinfo: JSON.stringify({
          device_type: 'WEB',
          device_id: deviceId,
        }),
      },
      body: JSON.stringify(body),
    })

    const res = await response.json().catch(() => null)
    if (!response.ok || !isSuccess(res)) {
      throw new Error(res?.message || 'Bill payment failed')
    }

    authService.fetchCustomerBalance().catch(() => {})

    return { data: res?.data ?? res, message: res?.message }
  },
}

export default billPaymentService
