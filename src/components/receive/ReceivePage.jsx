import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { HiArrowDownLeft } from 'react-icons/hi2'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import Input from '../../Reusable/Input'
import MobileInput from '../../Reusable/MobileInput'
import AmountInput from '../../Reusable/AmountInput'
import DataTable from '../../Reusable/Table'
import { sendService } from '../send/send.service'
import receiveService from './receive.service'
import { formatTableDateTime } from '../../utils/formatDate'
import THEME_COLORS from '../../theme/colors'

const ReceivePage = () => {
 const user = useSelector((state) => state.auth?.user)
 const walletId = useSelector((state) => state.wallet?.walletId)

 const [mobile, setMobile] = useState('+93')
 const [beneficiary, setBeneficiary] = useState(null)
 const [validating, setValidating] = useState(false)
 const [amount, setAmount] = useState('')
 const [remarks, setRemarks] = useState('')
 const [requestLoading, setRequestLoading] = useState(false)
 const [requestError, setRequestError] = useState('')
 const [requestList, setRequestList] = useState([])
 const [listLoading, setListLoading] = useState(false)
 const [currentPage, setCurrentPage] = useState(1)
 const [pageSize, setPageSize] = useState(10)

 const currentUserId = user?.reg_info?.id ?? user?.reg_info?.user_id ?? user?.user_id ?? user?.id
 const currentUserMobile = (user?.reg_info?.mobile ?? user?.reg_info?.reg_mobile ?? user?.mobile ?? '').toString().trim()

 const receiveColors = THEME_COLORS.receive
 const statusColors = THEME_COLORS.status

 const handleValidateBeneficiary = async () => {
 const trimmed = mobile.trim()
 if (!trimmed || trimmed === '+93') {
 setRequestError('Please Enter Beneficiary Mobile Number')
 return
 }
 const finalMobile = trimmed.startsWith('+93') ? trimmed : `+93${trimmed.replace(/^\+?\d+/, '').replace(/\D/g, '')}`
 setRequestError('')
 setValidating(true)
 try {
 const { data } = await sendService.validateBeneficiary(finalMobile)
 const benUserId = data.user_id
 const benMobile = (data.reg_mobile ?? finalMobile).toString().trim()
 if (benUserId != null && benUserId === currentUserId) {
 setBeneficiary(null)
 const msg = 'You cannot request money from yourself. Please enter a different mobile number.'
 setRequestError(msg)
 toast.error(msg)
 return
 }
 if (benMobile && currentUserMobile && benMobile === currentUserMobile) {
 setBeneficiary(null)
 const msg = 'You cannot request money from yourself. Please enter a different mobile number.'
 setRequestError(msg)
 toast.error(msg)
 return
 }
 setBeneficiary({
 user_id: data.user_id,
 reg_mobile: data.reg_mobile ?? finalMobile,
 reg_email: data.reg_email ?? '',
 first_name: data.first_name ?? '',
 middle_name: data.middle_name ?? null,
 last_name: data.last_name ?? '' })
 } catch (err) {
 setBeneficiary(null)
 const msg = err?.message || 'Beneficiary not found. Please check the mobile number.'
 setRequestError(msg)
 toast.error(msg)
 } finally {
 setValidating(false)
 }
 }

 const beneficiaryName = beneficiary
 ? [beneficiary.first_name, beneficiary.middle_name, beneficiary.last_name].filter(Boolean).join(' ') || beneficiary.reg_mobile
 : ''

 const handleRequestMoney = async (e) => {
 e?.preventDefault?.()
 if (!beneficiary) {
 setRequestError('Please validate beneficiary first')
 return
 }
 if (beneficiary.user_id != null && beneficiary.user_id === currentUserId) {
 setRequestError('You cannot request money from yourself. Please enter a different mobile number.')
 toast.error('You cannot request money from yourself.')
 return
 }
 if (!amount || parseFloat(amount) <= 0) {
 setRequestError('Please enter a valid amount')
 return
 }
 setRequestLoading(true)
 setRequestError('')
 try {
 await receiveService.requestMoney(beneficiary.user_id, parseFloat(amount), remarks || '')
 toast.success('Request sent successfully')
 setBeneficiary(null)
 setMobile('+93')
 setAmount('')
 setRemarks('')
 fetchRequestList()
 } catch (err) {
 const msg = err?.message || 'Request money failed'
 setRequestError(msg)
 toast.error(msg)
 } finally {
 setRequestLoading(false)
 }
 }

 const fetchRequestList = async () => {
 setListLoading(true)
 try {
 const { data } = await receiveService.getReqMoneyList({ get_cust_data: true })
 setRequestList(Array.isArray(data) ? data : [])
 } catch (err) {
 console.error(err)
 toast.error(err?.message || 'Failed to load request list')
 setRequestList([])
 } finally {
 setListLoading(false)
 }
 }

 useEffect(() => {
 fetchRequestList()
 }, [])

 const getStatusBadge = (status) => {
 const map = {
 1: { label: 'Paid', bg: statusColors.successBackground, text: statusColors.successText },
 2: { label: 'Pending', bg: statusColors.pendingBackground, text: statusColors.pendingText },
 3: { label: 'Declined', bg: statusColors.failedBackground, text: statusColors.failedText } }
 const cfg = map[status] || { label: 'Unknown', bg: statusColors.infoBackground, text: statusColors.infoText }
 return <span className="px-2 py-1 rounded text-xs font-medium" >{cfg.label}</span>
 }

 const isIncomingRequest = (request) => request.recv_cust_id === currentUserId

 const headers = [
 { key: 'id', label: 'ID', content: (row) => row.id ?? '-' },
 {
 key: 'type',
 label: 'Type',
 content: (row) => (
 <span
 className="px-2 py-1 rounded text-xs font-medium"
 style={{
 color: isIncomingRequest(row) ? statusColors.infoText : statusColors.pendingText }}
 >
 {isIncomingRequest(row) ? 'Incoming' : 'Outgoing'}
 </span>
 ) },
 { key: 'req_cust_id', label: 'Req Cust ID', content: (row) => row.req_cust_id ?? '-' },
 { key: 'recv_cust_id', label: 'Recv Cust ID', content: (row) => row.recv_cust_id ?? '-' },
 { key: 'req_cust_mobile', label: 'Req Cust Mobile', content: (row) => <span className="font-mono text-xs">{row.req_cust_mobile || '-'}</span> },
 { key: 'recv_cust_mobile', label: 'Recv Cust Mobile', content: (row) => <span className="font-mono text-xs">{row.recv_cust_mobile || '-'}</span> },
 { key: 'amount', label: 'Amount', content: (row) => Number(row.amount || 0).toFixed(2) },
 { key: 'currency_id', label: 'Currency ID', content: (row) => row.currency_id ?? '-' },
 { key: 'remarks', label: 'Remarks', content: (row) => row.remarks || '-' },
 { key: 'txn_rrn', label: 'RRN', content: (row) => <span className="font-mono text-xs">{row.txn_rrn || '-'}</span> },
 { key: 'expiry_on', label: 'Expires On', content: (row) => formatTableDateTime(row.expiry_on) },
 { key: 'status', label: 'Status', content: (row) => getStatusBadge(row.status) },
 { key: 'added_on', label: 'Added On', content: (row) => formatTableDateTime(row.added_on) },
 { key: 'last_modified_on', label: 'Last Modified On', content: (row) => formatTableDateTime(row.last_modified_on) },
 { key: 'last_modified_by', label: 'Last Modified By', content: (row) => row.last_modified_by || '-' },
 { key: 'req_cust_name', label: 'Req Cust Name', content: (row) => [row.req_cust_fname, row.req_cust_lname].filter(Boolean).join(' ') || '-' },
 { key: 'recv_cust_name', label: 'Recv Cust Name', content: (row) => [row.recv_cust_fname, row.recv_cust_lname].filter(Boolean).join(' ') || '-' },
 ]

 const handlePageChange = (page, newPageSize) => {
 setCurrentPage(page)
 if (newPageSize != null && newPageSize !== pageSize) {
 setPageSize(newPageSize)
 }
 }

 return (
 <PageContainer>
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-6">
 <h1 className="text-xl sm:text-2xl font-semibold shrink-0" style={{ color: receiveColors.title }}>
 Receive Money
 </h1>

 <div className="rounded-lg p-3 sm:p-4 shrink-0" style={{ border: `1px solid ${receiveColors.cardBorder}` }}>
 <div className="flex flex-col items-center mb-4">
 <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center mb-2" >
 <HiArrowDownLeft className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: receiveColors.accentText }} />
 </div>
 <p className="text-xs mb-1" style={{ color: receiveColors.subtitle }}>Your Wallet ID</p>
 <p className="text-sm sm:text-base font-bold font-mono break-all text-center" style={{ color: receiveColors.title }}>
 {walletId ?? '-'}
 </p>
 </div>
 <div className="pt-3" style={{ borderTop: `1px solid ${receiveColors.cardBorder}` }}>
 <h3 className="text-xs sm:text-sm font-semibold mb-2" style={{ color: receiveColors.title }}>Share Details</h3>
 <div className="space-y-2 text-xs sm:text-sm">
 <div className="flex justify-between gap-4">
 <span style={{ color: receiveColors.subtitle }}>Name</span>
 <span className="font-medium truncate max-w-[60%] text-right" style={{ color: receiveColors.title }}>
 {user?.reg_info?.first_name ?? user?.name ?? 'User'}
 </span>
 </div>
 <div className="flex justify-between gap-4">
 <span style={{ color: receiveColors.subtitle }}>Wallet ID</span>
 <span className="font-medium font-mono break-all text-right max-w-[60%]" style={{ color: receiveColors.title }}>
 {walletId ?? '-'}
 </span>
 </div>
 </div>
 </div>
 </div>

 <div className="rounded-lg p-4 sm:p-6 shrink-0" style={{ border: `1px solid ${receiveColors.cardBorder}` }}>
 <h2 className="text-lg font-semibold mb-4" style={{ color: receiveColors.title }}>Request Money</h2>
 {requestError && (
 <div className="px-3 py-2 rounded-md mb-4 text-sm" style={{ border: `1px solid ${receiveColors.errorBorder}`, color: receiveColors.errorText }}>
 {requestError}
 </div>
 )}
 <div className="space-y-4">
 <MobileInput
 label="Beneficiary Mobile Number"
 value={mobile}
 onChange={(e) => {
 setMobile(e.target.value)
 setBeneficiary(null)
 setRequestError('')
 }}
 placeholder="e.g. 998877665"
 disabled={!!beneficiary}
 />

 {!beneficiary ? (
 <Button
 onClick={handleValidateBeneficiary}
 disabled={validating || !mobile.trim()}
 >
 {validating ? 'Validating...' : 'Validate beneficiary'}
 </Button>
 ) : (
 <>
 <div className="rounded-lg p-4 space-y-2" style={{ border: `1px solid ${receiveColors.cardBorder}` }}>
 <div className="flex justify-between gap-4 text-sm">
 <span style={{ color: receiveColors.subtitle }}>Name</span>
 <span className="font-medium text-right" style={{ color: receiveColors.title }}>
 {beneficiaryName}
 </span>
 </div>
 <div className="flex justify-between gap-4 text-sm">
 <span style={{ color: receiveColors.subtitle }}>Email</span>
 <span className="font-medium text-right truncate max-w-[60%]" style={{ color: receiveColors.title }}>
 {beneficiary.reg_email || '-'}
 </span>
 </div>
 <div className="flex justify-between gap-4 text-sm">
 <span style={{ color: receiveColors.subtitle }}>User ID</span>
 <span className="font-medium text-right" style={{ color: receiveColors.title }}>
 {beneficiary.user_id}
 </span>
 </div>
 </div>

 <AmountInput
 label="Amount"
 value={amount}
 onChange={setAmount}
 />
 <Input
 label="Remarks (Optional)"
 value={remarks}
 onChange={(e) => setRemarks(e.target.value)}
 placeholder="e.g. Testing SendMoney via Web"
 />
 <div className="flex gap-2">
 <Button onClick={handleRequestMoney} disabled={requestLoading}>
 {requestLoading ? 'Sending...' : 'Request Money'}
 </Button>
 <Button
 type="button"
 variant="secondary"
 onClick={() => {
 setBeneficiary(null)
 setMobile('')
 setAmount('')
 setRemarks('')
 setRequestError('')
 }}
 >
 Back
 </Button>
 </div>
 </>
 )}
 </div>
 </div>

 <div className="rounded-lg p-4 sm:p-6 shrink-0" style={{ border: `1px solid ${receiveColors.cardBorder}` }}>
 <h2 className="text-lg font-semibold mb-4" style={{ color: receiveColors.title }}>Request Money History</h2>
 <DataTable
 data={requestList}
 headers={headers}
 loading={listLoading}
 searchPlaceholder="Search requests..."
 totalItems={requestList.length}
 currentPage={currentPage}
 pageSize={pageSize}
 onPageChange={handlePageChange}
 pageSizeOptions={[10, 20, 50, 100]}
 totalRowsLabel="Total Requests: {count}"
 emptyMessage="No money requests yet."
 fillHeight={false}
 tableMaxHeight="400px"
 />
 </div>
 </div>
 </PageContainer>
 )
}

export default ReceivePage


