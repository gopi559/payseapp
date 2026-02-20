import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import MobileInput from '../../Reusable/MobileInput'
import voucherService from './voucher.service.jsx'
import THEME_COLORS from '../../theme/colors'

const VoucherCreate = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    amount: '',
    receiver_name: '',
    receiver_mobile: '+93',
    receiver_id_type: 1,
    receiver_id_number: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [createdResult, setCreatedResult] = useState(null)
  const contentCard = THEME_COLORS.contentCard

  const handleSubmit = async (e) => {
    e.preventDefault()
    const finalMobile = form.receiver_mobile?.startsWith('+93')
      ? form.receiver_mobile
      : `+93${(form.receiver_mobile || '').replace(/^\+?\d+/, '').replace(/\D/g, '')}`

    if (!form.amount?.trim() || !form.receiver_name?.trim() || !finalMobile?.trim() || finalMobile === '+93' || !form.receiver_id_number?.trim()) {
      toast.error('Please fill all required fields')
      return
    }
    setSubmitting(true)
    setCreatedResult(null)
    try {
      const result = await voucherService.createCashcode({ ...form, receiver_mobile: finalMobile })
      setCreatedResult(result?.data ?? null)
      toast.success(result?.message || 'Cash code created successfully')
    } catch (err) {
      console.error(err)
      toast.error(err?.message || 'Failed to create cash code')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setForm({ amount: '', receiver_name: '', receiver_mobile: '+93', receiver_id_type: 1, receiver_id_number: '' })
    setCreatedResult(null)
  }

  const inputStyle = {
    borderColor: contentCard.border,
    color: contentCard.title,
    backgroundColor: THEME_COLORS.common.white,
  }

  return (
    <PageContainer>
      <div className="min-h-full px-4 py-6 overflow-x-hidden flex flex-col">
        <div className="w-full max-w-lg mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-bold" style={{ color: contentCard.title }}>Create Cash Code</h2>
            <div className="flex gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => navigate('/customer/voucher')}>
                Back
              </Button>
            </div>
          </div>

          {createdResult ? (
            <div className="w-full rounded-lg shadow-sm p-6" style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: contentCard.title }}>Cash Code Created</h3>
              <div className="rounded-lg p-4 space-y-2 mb-4" style={{ border: `1px solid ${contentCard.divider}`, backgroundColor: contentCard.accentBackground }}>
                <p><span className="font-medium" style={{ color: contentCard.subtitle }}>Cash Code:</span> <span className="font-mono font-bold text-lg" style={{ color: contentCard.title }}>{createdResult.cashcode}</span></p>
                <p><span className="font-medium" style={{ color: contentCard.subtitle }}>Temp PIN:</span> <span className="font-mono font-bold" style={{ color: contentCard.title }}>{createdResult.temp_pin}</span></p>
                <p><span className="font-medium" style={{ color: contentCard.subtitle }}>Status:</span> <span style={{ color: contentCard.title }}>{createdResult.status}</span></p>
              </div>
              <p className="text-sm mb-4" style={{ color: contentCard.subtitle }}>Share the cash code and PIN with the receiver.</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => navigate('/customer/voucher')}>Back to List</Button>
                <Button type="button" onClick={resetForm}>Create Another</Button>
              </div>
            </div>
          ) : (
            <div className="w-full rounded-lg shadow-sm p-6" style={{ backgroundColor: contentCard.background, border: `1px solid ${contentCard.border}` }}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: contentCard.subtitle }}>Amount *</label>
                  <input
                    type="text"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="e.g. 10.00"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: contentCard.subtitle }}>Receiver Name *</label>
                  <input
                    type="text"
                    value={form.receiver_name}
                    onChange={(e) => setForm((f) => ({ ...f, receiver_name: e.target.value }))}
                    placeholder="Receiver full name"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <MobileInput
                    label="Receiver Mobile *"
                    value={form.receiver_mobile}
                    onChange={(e) => setForm((f) => ({ ...f, receiver_mobile: e.target.value }))}
                    placeholder="e.g. 998877665"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: contentCard.subtitle }}>Receiver ID Type</label>
                  <input
                    type="number"
                    value={form.receiver_id_type}
                    onChange={(e) => setForm((f) => ({ ...f, receiver_id_type: Number(e.target.value) || 1 }))}
                    min={1}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: contentCard.subtitle }}>Receiver ID Number *</label>
                  <input
                    type="text"
                    value={form.receiver_id_number}
                    onChange={(e) => setForm((f) => ({ ...f, receiver_id_number: e.target.value }))}
                    placeholder="ID number"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={inputStyle}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => navigate('/customer/voucher')}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default VoucherCreate
