import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import Input from '../../Reusable/Input'
import MobileInput from '../../Reusable/MobileInput'
import voucherService from './voucher.service.jsx'
import {
  NATIONALITY_LIST,
  PROVINCE_LIST,
  DISTRICT_LIST,
  VILLAGE_LIST,
  ID_TYPE_LIST,
} from '../../utils/constant.jsx'
import { fetchWithBasicAuth } from '../../services/basicAuth.service.js'
import { resolveCustomerMobileNumber } from '../../utils/customerMobile'

const normalizeReceiverMobile = (value) => {
  let digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('93')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length > 9) digits = digits.slice(-9)
  return digits
}

const buildReceiverMobileVariants = (localNineDigits) => {
  const variants = [
    localNineDigits,
    `93${localNineDigits}`,
    `+93${localNineDigits}`,
  ]
  return [...new Set(variants)]
}

const normalizeAmountInput = (value) => {
  const cleaned = String(value || '').replace(/[^\d.]/g, '')
  const parts = cleaned.split('.')

  if (!parts[0] && parts.length > 1) return `0.${parts.slice(1).join('').slice(0, 2)}`
  if (parts.length === 1) return parts[0]

  return `${parts[0]}.${parts.slice(1).join('').slice(0, 2)}`
}

const isNotFoundError = (message) =>
  /not\s*found|user\s*not\s*found|customer\s*not\s*found/i.test(String(message || ''))

const VoucherCreate = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth?.user)

  const [lists, setLists] = useState({
    nationalities: [],
    provinces: [],
    districts: [],
    villages: [],
    idTypes: [],
  })

  const [form, setForm] = useState({
    amount: '',
    receiver_name: '',
    receiver_father_name: '',
    receiver_mobile: '+93',
    nationality_id: '',
    province_id: '',
    district_id: '',
    village_id: '',
    receiver_id_type: '',
    receiver_id_number: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const currentUserMobile = normalizeReceiverMobile(resolveCustomerMobileNumber(user))

  useEffect(() => {
    Promise.all([
      fetchWithBasicAuth(NATIONALITY_LIST),
      fetchWithBasicAuth(PROVINCE_LIST),
      fetchWithBasicAuth(ID_TYPE_LIST),
    ])
      .then(([nationalities, provinces, idTypes]) => {
        setLists((p) => ({ ...p, nationalities, provinces, idTypes }))

        setForm((prev) => {
          if (prev.nationality_id) return prev

          const afghanNationality = nationalities.find(
            (item) =>
              Number(item?.id) === 1 ||
              String(item?.nationality_name || '').trim().toLowerCase() === 'afghan' ||
              String(item?.country_name_official || '').trim().toLowerCase() === 'afghanistan'
          )

          if (!afghanNationality?.id) return prev

          return {
            ...prev,
            nationality_id: String(afghanNationality.id),
          }
        })
      })
      .catch((e) => toast.error(e.message || t('something_went_wrong')))
  }, [t])

  useEffect(() => {
    if (!form.province_id) {
      setLists((p) => ({ ...p, districts: [], villages: [] }))
      setForm((f) => ({ ...f, district_id: '', village_id: '' }))
      return
    }

    fetchWithBasicAuth(DISTRICT_LIST, { province_id: Number(form.province_id) })
      .then((districts) => {
        setLists((p) => ({ ...p, districts, villages: [] }))
        setForm((f) => ({ ...f, district_id: '', village_id: '' }))
      })
      .catch((e) => toast.error(e.message || t('something_went_wrong')))
  }, [form.province_id, t])

  useEffect(() => {
    if (!form.district_id) {
      setLists((p) => ({ ...p, villages: [] }))
      setForm((f) => ({ ...f, village_id: '' }))
      return
    }

    fetchWithBasicAuth(VILLAGE_LIST, { district_id: Number(form.district_id) })
      .then((villages) => setLists((p) => ({ ...p, villages })))
      .catch((e) => toast.error(e.message || t('something_went_wrong')))
  }, [form.district_id, t])

  const getRequiredError = (label) => t('field_is_required', { field: label })

  const validateForm = () => {
    const nextErrors = {}
    const mobileDigits = normalizeReceiverMobile(form.receiver_mobile)
    const normalizedAmount = normalizeAmountInput(form.amount)
    const parsedAmount = Number(normalizedAmount)

    if (!normalizedAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = t('please_enter_valid_amount')
    }

    if (!String(form.receiver_name || '').trim()) {
      nextErrors.receiver_name = getRequiredError(t('receiver_name'))
    }

    if (!String(form.receiver_father_name || '').trim()) {
      nextErrors.receiver_father_name = getRequiredError(t('father_name'))
    }

    if (!mobileDigits) {
      nextErrors.receiver_mobile = getRequiredError(t('receiver_mobile'))
    } else if (mobileDigits.length !== 9) {
      nextErrors.receiver_mobile = t('receiver_mobile_must_be_9_digits')
    } else if (mobileDigits === currentUserMobile) {
      nextErrors.receiver_mobile = t('cannot_create_voucher_to_yourself')
    }

    if (!form.nationality_id) {
      nextErrors.nationality_id = getRequiredError(t('nationality'))
    }

    if (!form.province_id) {
      nextErrors.province_id = getRequiredError(t('province'))
    }

    if (!form.district_id) {
      nextErrors.district_id = getRequiredError(t('district'))
    }

    if (!form.village_id) {
      nextErrors.village_id = getRequiredError(t('village'))
    }

    if (!form.receiver_id_type) {
      nextErrors.receiver_id_type = getRequiredError(t('id_type'))
    }

    if (!String(form.receiver_id_number || '').trim()) {
      nextErrors.receiver_id_number = getRequiredError(t('id_number'))
    }

    setErrors(nextErrors)
    return { isValid: Object.keys(nextErrors).length === 0, mobileDigits, normalizedAmount }
  }

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { isValid, mobileDigits, normalizedAmount } = validateForm()

    if (!isValid) {
      toast.error(t('please_fill_required_fields'))
      return
    }

    const payload = {
amount: Number(normalizedAmount),
      receiver_name: form.receiver_name,
      receiver_father_name: form.receiver_father_name,
      receiver_mobile: mobileDigits,
      receiver_id_type: Number(form.receiver_id_type),
      receiver_id_number: form.receiver_id_number,
      nationality_id: form.nationality_id ? Number(form.nationality_id) : undefined,
      province_id: form.province_id ? Number(form.province_id) : undefined,
      district_id: form.district_id ? Number(form.district_id) : undefined,
      village_id: form.village_id ? Number(form.village_id) : undefined,
    }

    setSubmitting(true)

    try {
      const mobileVariants = buildReceiverMobileVariants(mobileDigits)
      let success = false
      let lastError = null

      for (const mobileVariant of mobileVariants) {
        try {
          await voucherService.createCashcode({
            ...payload,
            receiver_mobile: mobileVariant,
          })
          success = true
          break
        } catch (err) {
          lastError = err
          if (!isNotFoundError(err?.message)) {
            throw err
          }
        }
      }

      if (!success && lastError) {
        throw lastError
      }

      toast.success(t('cash_code_created_successfully'))
      navigate('/customer/voucher')
    } catch (e) {
      toast.error(e.message || t('failed_to_create_cash_code'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = 'w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
  const selectStyle = `${inputStyle} voucher-select text-gray-900 bg-white`
  const optionStyle = { color: '#111827', backgroundColor: '#ffffff' }
  const getFieldClassName = (field) =>
    errors[field] ? `${inputStyle} border-red-500 focus:ring-red-500` : inputStyle
  const getSelectClassName = (field) =>
    errors[field] ? `${selectStyle} border-red-500 focus:ring-red-500` : selectStyle

  const getOptionLabel = (item, keys) => {
    for (const key of keys) {
      const value = item?.[key]
      if (value !== undefined && value !== null && String(value).trim()) {
        return String(value)
      }
    }
    return `#${item?.id ?? ''}`
  }

  const requiredLabel = (label) => `${label} *`

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t('create_voucher')}</h2>
          <Button variant="outline" onClick={() => navigate('/customer/voucher')}>
            {t('back')}
          </Button>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label={requiredLabel(t('amount'))}
                className={getFieldClassName('amount')}
                inputMode="decimal"
                placeholder={t('enter_amount')}
                error={errors.amount}
                value={form.amount}
                onChange={(e) => handleFieldChange('amount', normalizeAmountInput(e.target.value))}
                onPaste={(e) => {
                  e.preventDefault()
                  const pasted = e.clipboardData.getData('text')
                  handleFieldChange('amount', normalizeAmountInput(pasted))
                }}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Input
                  label={requiredLabel(t('receiver_name'))}
                  className={getFieldClassName('receiver_name')}
                  error={errors.receiver_name}
                  value={form.receiver_name}
                  onChange={(e) => handleFieldChange('receiver_name', e.target.value)}
                />
              </div>

              <div>
                <Input
                  label={requiredLabel(t('father_name'))}
                  className={getFieldClassName('receiver_father_name')}
                  error={errors.receiver_father_name}
                  value={form.receiver_father_name}
                  onChange={(e) => handleFieldChange('receiver_father_name', e.target.value)}
                />
              </div>
            </div>

            <MobileInput
              label={requiredLabel(t('receiver_mobile'))}
              value={form.receiver_mobile}
              error={errors.receiver_mobile}
              className={errors.receiver_mobile ? 'border-red-500 focus:ring-red-500 focus:outline-none' : ''}
              onChange={(e) => handleFieldChange('receiver_mobile', e.target.value)}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">{requiredLabel(t('nationality'))}</label>
                <select
                  className={getSelectClassName('nationality_id')}
                  style={optionStyle}
                  value={form.nationality_id}
                  onChange={(e) => handleFieldChange('nationality_id', e.target.value)}
                >
                  <option value="" style={optionStyle}>{t('select_nationality')}</option>
                  {lists.nationalities.map((n) => (
                    <option key={n.id} value={n.id} style={optionStyle}>
                      {getOptionLabel(n, ['nationality_name', 'type_name', 'name', 'title'])}
                    </option>
                  ))}
                </select>
                {errors.nationality_id && <p className="mt-1 text-sm text-red-600">{errors.nationality_id}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">{requiredLabel(t('province'))}</label>
                <select
                  className={getSelectClassName('province_id')}
                  style={optionStyle}
                  value={form.province_id}
                  onChange={(e) => handleFieldChange('province_id', e.target.value)}
                >
                  <option value="" style={optionStyle}>{t('select_province')}</option>
                  {lists.provinces.map((p) => (
                    <option key={p.id} value={p.id} style={optionStyle}>
                      {getOptionLabel(p, ['province_name', 'type_name', 'name', 'title'])}
                    </option>
                  ))}
                </select>
                {errors.province_id && <p className="mt-1 text-sm text-red-600">{errors.province_id}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">{requiredLabel(t('district'))}</label>
                <select
                  className={getSelectClassName('district_id')}
                  style={optionStyle}
                  value={form.district_id}
                  disabled={!lists.districts.length}
                  onChange={(e) => handleFieldChange('district_id', e.target.value)}
                >
                  <option value="" style={optionStyle}>{t('select_district')}</option>
                  {lists.districts.map((d) => (
                    <option key={d.id} value={d.id} style={optionStyle}>
                      {getOptionLabel(d, ['type_name', 'district_name', 'name', 'title'])}
                    </option>
                  ))}
                </select>
                {errors.district_id && <p className="mt-1 text-sm text-red-600">{errors.district_id}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">{requiredLabel(t('village'))}</label>
                <select
                  className={getSelectClassName('village_id')}
                  style={optionStyle}
                  value={form.village_id}
                  disabled={!lists.villages.length}
                  onChange={(e) => handleFieldChange('village_id', e.target.value)}
                >
                  <option value="" style={optionStyle}>{t('select_village')}</option>
                  {lists.villages.map((v) => (
                    <option key={v.id} value={v.id} style={optionStyle}>
                      {getOptionLabel(v, ['type_name', 'village_name', 'name', 'title'])}
                    </option>
                  ))}
                </select>
                {errors.village_id && <p className="mt-1 text-sm text-red-600">{errors.village_id}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">{requiredLabel(t('id_type'))}</label>
                <select
                  className={getSelectClassName('receiver_id_type')}
                  style={optionStyle}
                  value={form.receiver_id_type}
                  onChange={(e) => handleFieldChange('receiver_id_type', e.target.value)}
                >
                  <option value="" style={optionStyle}>{t('select_id_type')}</option>
                  {lists.idTypes.map((i) => (
                    <option key={i.id} value={i.id} style={optionStyle}>
                      {getOptionLabel(i, ['type_name', 'id_type_name', 'name', 'title'])}
                    </option>
                  ))}
                </select>
                {errors.receiver_id_type && <p className="mt-1 text-sm text-red-600">{errors.receiver_id_type}</p>}
              </div>

              <Input
                label={requiredLabel(t('id_number'))}
                className={getFieldClassName('receiver_id_number')}
                placeholder={t('id_number')}
                error={errors.receiver_id_number}
                value={form.receiver_id_number}
                onChange={(e) => handleFieldChange('receiver_id_number', e.target.value)}
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? t('creating') : t('create_voucher')}
            </Button>
          </form>
        </div>
      </div>
    </PageContainer>
  )
}

export default VoucherCreate
