import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import PageContainer from '../../Reusable/PageContainer'
import ConfirmCard from '../../Reusable/ConfirmCard'
import Button from '../../Reusable/Button'
import OtpInput from '../../Reusable/OtpInput'
import cashInService from './cashIn.service'
import { generateStan } from '../../utils/generateStan'

const CashInConfirm = () => {
 const navigate = useNavigate()
 const [cashInData, setCashInData] = useState(null)
 const [otp, setOtp] = useState('')
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')
 const [otpSent, setOtpSent] = useState(false)
 const [otpError, setOtpError] = useState('')

 useEffect(() => {
 const data = sessionStorage.getItem('cashInData')
 if (!data) {
 navigate('/customer/cash-in')
 return
 }
 setCashInData(JSON.parse(data))
 }, [navigate])

 const handleSendOtp = async () => {
 if (!cashInData) {
 setError('Session expired. Please start again from Cash In.')
 return
 }
 setLoading(true)
 setError('')
 setOtpError('')
 try {
 // Generate STAN before sending OTP
 const stan = generateStan()
 const { data } = await cashInService.sendOtp({
 card_number: cashInData.card_number,
 cvv: cashInData.cvv,
 expiry_date: cashInData.expiry_date,
 txn_amount: cashInData.txn_amount })
 const rrn = data?.rrn ?? ''
 // Use generated STAN if API doesn't return one, otherwise use API's STAN
 const finalStan = data?.stan ?? stan
 // Update cashInData with RRN and STAN
 const updatedData = { ...cashInData, rrn, stan: finalStan }
 sessionStorage.setItem('cashInData', JSON.stringify(updatedData))
 setCashInData(updatedData)
 setOtpSent(true)
 setOtp('')
 toast.success('OTP sent successfully')
 } catch (err) {
 const msg = err?.message || 'Failed to send OTP. Please try again.'
 setError(msg)
 toast.error(msg)
 } finally {
 setLoading(false)
 }
 }

 /** Confirm button: verify OTP and complete transaction */
 const handleConfirmOtp = async () => {
 if (!otp || otp.length < 4) {
 setOtpError('Please enter the OTP received')
 return
 }
 if (!cashInData?.rrn || !cashInData?.stan) {
 setError('Session expired. Please start again from Cash In.')
 return
 }
 setLoading(true)
 setOtpError('')
 setError('')
 try {
 const { data: transactionData } = await cashInService.confirmCardToWallet({
 card_number: cashInData.card_number,
 txn_amount: cashInData.txn_amount,
 cvv: cashInData.cvv,
 expiry_date: cashInData.expiry_date,
 otp,
 rrn: cashInData.rrn,
 stan: cashInData.stan })
 sessionStorage.removeItem('cashInData')
 sessionStorage.setItem('cashInSuccess', JSON.stringify({
 ...transactionData,
 card_number: cashInData.card_number,
 card_name: cashInData.card_name,
 txn_amount: cashInData.txn_amount,
 cvv: cashInData.cvv,
 expiry_date: cashInData.expiry_date }))
 toast.success('Cash in successful')
 setTimeout(() => {
 navigate('/customer/cash-in/success')
 }, 800)
 } catch (err) {
 const msg = err?.message || 'Invalid or expired OTP. Transaction failed.'
 setOtpError(msg)
 toast.error(msg)
 } finally {
 setLoading(false)
 }
 }

 if (!cashInData) return null

 const maskedCard = cashInData.card_number
 ? `${cashInData.card_number.slice(0, 4)} **** **** ${cashInData.card_number.slice(-4)}`
 : 'â€”'

 return (
 <PageContainer>
 <div className="px-4 py-6">
 <h1 className="text-2xl font-bold text-brand-dark mb-6">
 {otpSent ? 'Enter OTP' : 'Confirm Transaction'}
 </h1>

 {error && (
 <div className="border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
 {error}
 </div>
 )}

 {!otpSent ? (
 <>
 <ConfirmCard
 items={[
 { label: 'Card', value: maskedCard },
 { label: 'Card Name', value: cashInData.card_name || 'N/A' },
 { label: 'Amount', value: `â‚¹${parseFloat(cashInData.txn_amount).toFixed(2)}` },
 ]}
 total={parseFloat(cashInData.txn_amount)}
 />
 <p className="text-sm text-gray-500 mt-2 mb-4">
 Click Send OTP to receive a code. After verifying OTP, the transaction will be completed.
 </p>
 <div className="mt-6 space-y-3">
 <Button onClick={handleSendOtp} fullWidth disabled={loading}>
 {loading ? 'Sending OTP...' : 'Send OTP'}
 </Button>
 <Button
 onClick={() => navigate('/customer/cash-in')}
 variant="outline"
 fullWidth
 disabled={loading}
 >
 Cancel
 </Button>
 </div>
 </>
 ) : (
 <>
 <div className="rounded-lg border border-gray-200 px-4 py-3 mb-4">
 <p className="text-sm text-gray-600">
 OTP sent successfully. Enter it below, then confirm to complete the transaction.
 </p>
 </div>
 <OtpInput
 length={4}
 onChange={setOtp}
 error={otpError}
 disabled={loading}
 />
 <div className="mt-4 space-y-2">
 <Button onClick={handleConfirmOtp} fullWidth disabled={loading || otp.length !== 4}>
 {loading ? 'Verifying...' : 'Confirm'}
 </Button>
 <Button
 onClick={() => navigate('/customer/cash-in')}
 variant="outline"
 fullWidth
 disabled={loading}
 >
 Cancel
 </Button>
 </div>
 </>
 )}
 </div>
 </PageContainer>
 )
}

export default CashInConfirm


