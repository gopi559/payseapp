import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import MobileInput from '../../Reusable/MobileInput'
import voucherService from './voucher.service.jsx'
import THEME_COLORS from '../../theme/colors'
import {
  NATIONALITY_LIST,
  PROVINCE_LIST,
  DISTRICT_LIST,
  VILLAGE_LIST,
  ID_TYPE_LIST,
} from '../../utils/constant.jsx'
import { fetchWithBasicAuth } from '../../services/basicAuth.service.js'

const VoucherCreate = () => {
  const navigate = useNavigate()
  const contentCard = THEME_COLORS.contentCard

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

  useEffect(() => {
    Promise.all([
      fetchWithBasicAuth(NATIONALITY_LIST),
      fetchWithBasicAuth(PROVINCE_LIST),
      fetchWithBasicAuth(ID_TYPE_LIST),
    ])
      .then(([nationalities, provinces, idTypes]) =>
        setLists((p) => ({ ...p, nationalities, provinces, idTypes }))
      )
      .catch((e) => toast.error(e.message))
  }, [])

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
      .catch((e) => toast.error(e.message))
  }, [form.province_id])

  useEffect(() => {
    if (!form.district_id) {
      setLists((p) => ({ ...p, villages: [] }))
      setForm((f) => ({ ...f, village_id: '' }))
      return
    }
    fetchWithBasicAuth(VILLAGE_LIST, { district_id: Number(form.district_id) })
      .then((villages) => setLists((p) => ({ ...p, villages })))
      .catch((e) => toast.error(e.message))
  }, [form.district_id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const mobileDigits = form.receiver_mobile.replace(/\D/g, '').replace(/^93/, '')

    if (
      !form.amount ||
      !form.receiver_name ||
      !form.receiver_mobile ||
      !form.receiver_id_number ||
      !form.receiver_id_type
    ) {
      toast.error('Please fill all required fields')
      return
    }

    if (mobileDigits.length !== 9) {
      toast.error('Receiver mobile must be exactly 9 digits')
      return
    }

    const payload = {
      amount: String(form.amount),
      receiver_name: form.receiver_name,
      receiver_father_name: form.receiver_father_name,
      receiver_mobile: form.receiver_mobile.replace('+', ''),
      receiver_id_type: Number(form.receiver_id_type),
      receiver_id_number: form.receiver_id_number,
      nationality_id: form.nationality_id ? Number(form.nationality_id) : undefined,
      province_id: form.province_id ? Number(form.province_id) : undefined,
      district_id: form.district_id ? Number(form.district_id) : undefined,
      village_id: form.village_id ? Number(form.village_id) : undefined,
    }

    setSubmitting(true)
    try {
      await voucherService.createCashcode(payload)
      toast.success('Cash code created successfully')
      navigate('/customer/voucher')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    borderColor: contentCard.border,
    color: contentCard.title,
    backgroundColor: THEME_COLORS.common.white,
  }

  return (
    <PageContainer>
      <div className="max-w-lg mx-auto p-4">
        <Button variant="outline" onClick={() => navigate('/customer/voucher')}>
          Back
        </Button>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          <input className="w-full border p-2" style={inputStyle} placeholder="Amount"
            value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />

          <input className="w-full border p-2" style={inputStyle} placeholder="Receiver Name"
            value={form.receiver_name} onChange={(e) => setForm({ ...form, receiver_name: e.target.value })} />

          <input className="w-full border p-2" style={inputStyle} placeholder="Father Name"
            value={form.receiver_father_name} onChange={(e) => setForm({ ...form, receiver_father_name: e.target.value })} />

          <MobileInput
            label="Receiver Mobile"
            value={form.receiver_mobile}
            onChange={(e) => setForm({ ...form, receiver_mobile: e.target.value })}
          />

          <select className="w-full border p-2" style={inputStyle}
            value={form.nationality_id}
            onChange={(e) => setForm({ ...form, nationality_id: e.target.value })}>
            <option value="">Select Nationality</option>
            {lists.nationalities.map((n) => (
              <option key={n.id} value={n.id}>{n.nationality_name}</option>
            ))}
          </select>

          <select className="w-full border p-2" style={inputStyle}
            value={form.province_id}
            onChange={(e) => setForm({ ...form, province_id: e.target.value })}>
            <option value="">Select Province</option>
            {lists.provinces.map((p) => (
              <option key={p.id} value={p.id}>{p.province_name}</option>
            ))}
          </select>

          <select className="w-full border p-2" style={inputStyle}
            value={form.district_id}
            disabled={!lists.districts.length}
            onChange={(e) => setForm({ ...form, district_id: e.target.value })}>
            <option value="">Select District</option>
            {lists.districts.map((d) => (
              <option key={d.id} value={d.id}>{d.type_name}</option>
            ))}
          </select>

          <select className="w-full border p-2" style={inputStyle}
            value={form.village_id}
            disabled={!lists.villages.length}
            onChange={(e) => setForm({ ...form, village_id: e.target.value })}>
            <option value="">Select Village</option>
            {lists.villages.map((v) => (
              <option key={v.id} value={v.id}>{v.type_name}</option>
            ))}
          </select>

          <select className="w-full border p-2" style={inputStyle}
            value={form.receiver_id_type}
            onChange={(e) => setForm({ ...form, receiver_id_type: e.target.value })}>
            <option value="">Select ID Type</option>
            {lists.idTypes.map((i) => (
              <option key={i.id} value={i.id}>{i.type_name}</option>
            ))}
          </select>

          <input className="w-full border p-2" style={inputStyle} placeholder="ID Number"
            value={form.receiver_id_number}
            onChange={(e) => setForm({ ...form, receiver_id_number: e.target.value })} />

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Voucher'}
          </Button>
        </form>
      </div>
    </PageContainer>
  )
}

export default VoucherCreate
