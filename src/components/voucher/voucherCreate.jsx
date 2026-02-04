import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import voucherService from './voucher.service.jsx'

const VoucherCreate = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    amount: '',
    receiver_name: '',
    receiver_mobile: '',
    receiver_id_type: 1,
    receiver_id_number: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [createdResult, setCreatedResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount?.trim() || !form.receiver_name?.trim() || !form.receiver_mobile?.trim() || !form.receiver_id_number?.trim()) {
      toast.error('Please fill all required fields')
      return
    }
    setSubmitting(true)
    setCreatedResult(null)
    try {
      const result = await voucherService.createCashcode(form)
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
    setForm({ amount: '', receiver_name: '', receiver_mobile: '', receiver_id_type: 1, receiver_id_number: '' })
    setCreatedResult(null)
  }

  return (
    <PageContainer>
      <div className="bg-gray-50 min-h-full px-4 py-6 overflow-x-hidden flex flex-col">
        <div className="w-full max-w-lg mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-800">Create Cash Code</h2>
            <div className="flex gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => navigate('/customer/voucher')}>
                Back
              </Button>
            </div>
          </div>

          {createdResult ? (
            <div className="border border-gray-200 w-full rounded-lg shadow-sm bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cash Code Created</h3>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2 mb-4">
                <p><span className="font-medium text-gray-600">Cash Code:</span> <span className="font-mono font-bold text-lg">{createdResult.cashcode}</span></p>
                <p><span className="font-medium text-gray-600">Temp PIN:</span> <span className="font-mono font-bold">{createdResult.temp_pin}</span></p>
                <p><span className="font-medium text-gray-600">Status:</span> {createdResult.status}</p>
              </div>
              <p className="text-sm text-gray-600 mb-4">Share the cash code and PIN with the receiver.</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => navigate('/customer/voucher')}>Back to List</Button>
                <Button type="button" onClick={resetForm}>Create Another</Button>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 w-full rounded-lg shadow-sm bg-white p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input
                    type="text"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="e.g. 10.00"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Name *</label>
                  <input
                    type="text"
                    value={form.receiver_name}
                    onChange={(e) => setForm((f) => ({ ...f, receiver_name: e.target.value }))}
                    placeholder="Receiver full name"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Mobile *</label>
                  <input
                    type="text"
                    value={form.receiver_mobile}
                    onChange={(e) => setForm((f) => ({ ...f, receiver_mobile: e.target.value }))}
                    placeholder="e.g. 93123456789"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receiver ID Type</label>
                  <input
                    type="number"
                    value={form.receiver_id_type}
                    onChange={(e) => setForm((f) => ({ ...f, receiver_id_type: Number(e.target.value) || 1 }))}
                    min={1}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receiver ID Number *</label>
                  <input
                    type="text"
                    value={form.receiver_id_number}
                    onChange={(e) => setForm((f) => ({ ...f, receiver_id_number: e.target.value }))}
                    placeholder="ID number"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
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


