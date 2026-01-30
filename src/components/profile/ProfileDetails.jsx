import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import { ROUTES } from '../../config/routes'

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-0">
    <span className="text-xs sm:text-sm text-gray-600 shrink-0">{label}</span>
    <span className="text-sm sm:text-base font-medium text-brand-dark text-right break-all">{value ?? '—'}</span>
  </div>
)

const ProfileDetails = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const walletId = useSelector((state) => state.wallet.walletId)

  const regInfo = user?.reg_info || user
  const userKyc = user?.user_kyc || null
  const displayName = userKyc?.first_name || userKyc?.last_name
    ? [userKyc.first_name, userKyc.last_name].filter(Boolean).join(' ')
    : regInfo?.mobile || regInfo?.email || 'User'

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark mb-4 sm:mb-6">Profile Details</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Account</h2>
          <div className="space-y-0">
            <DetailRow label="Name" value={displayName} />
            <DetailRow label="User ref" value={regInfo?.user_ref} />
            <DetailRow label="Mobile" value={regInfo?.mobile} />
            <DetailRow label="Email" value={regInfo?.email} />
            <DetailRow label="User type" value={regInfo?.user_type_name} />
            <DetailRow label="Auth status" value={regInfo?.auth_status} />
            <DetailRow label="Status" value={regInfo?.status != null ? String(regInfo.status) : undefined} />
            <DetailRow label="Wallet / User ref" value={walletId || regInfo?.user_ref} />
          </div>
        </div>

        {userKyc && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">KYC details</h2>
            <div className="space-y-0">
              <DetailRow label="First name" value={userKyc.first_name} />
              <DetailRow label="Middle name" value={userKyc.moddle_name} />
              <DetailRow label="Last name" value={userKyc.last_name} />
              <DetailRow label="Father name" value={userKyc.father_name} />
              <DetailRow label="Document ID" value={userKyc.document_id} />
              <DetailRow label="Email" value={userKyc.email} />
              <DetailRow label="Emergency mobile" value={userKyc.emergency_mobnum} />
              <DetailRow label="Marital status" value={userKyc.marital_status} />
              <DetailRow label="Gender" value={userKyc.gender === 1 ? 'Male' : userKyc.gender === 2 ? 'Female' : userKyc.gender} />
              <DetailRow label="DOB" value={userKyc.dob} />
              <DetailRow label="Auth status" value={userKyc.auth_status} />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <Button
            onClick={() => navigate(ROUTES.PROFILE)}
            variant="outline"
            fullWidth
            size="md"
          >
            Back
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default ProfileDetails
