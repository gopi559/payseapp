import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import THEME_COLORS from '../../theme/colors'

const DetailRow = ({ label, value }) => {
  const contentCard = THEME_COLORS.contentCard
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b last:border-0" style={{ borderColor: contentCard.divider }}>
      <span className="text-xs sm:text-sm shrink-0" style={{ color: contentCard.subtitle }}>{label}</span>
      <span className="text-sm sm:text-base font-medium text-right break-all" style={{ color: contentCard.title }}>{value ?? '—'}</span>
    </div>
  )
}

const ProfileDetails = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const walletId = useSelector((state) => state.wallet.walletId)
  const contentCard = THEME_COLORS.contentCard

  const regInfo = user?.reg_info || user
  const userKyc = user?.user_kyc || null
  const displayName = userKyc?.first_name || userKyc?.last_name
    ? [userKyc.first_name, userKyc.last_name].filter(Boolean).join(' ')
    : regInfo?.mobile || regInfo?.email || 'User'

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: contentCard.title }}>Profile Details</h1>

        <div className="rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6" style={{ backgroundColor: contentCard.background, borderColor: contentCard.border }}>
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: contentCard.subtitle }}>Account</h2>
          <div className="space-y-0">
            <DetailRow label="Name" value={displayName} />
            <DetailRow label="User Ref" value={regInfo?.user_ref} />
            <DetailRow label="Mobile" value={regInfo?.mobile} />
            <DetailRow label="Email" value={regInfo?.email} />
            <DetailRow label="User Type" value={regInfo?.user_type_name} />
            <DetailRow label="Auth Status" value={regInfo?.auth_status} />
            <DetailRow label="Status" value={regInfo?.status != null ? String(regInfo.status) : undefined} />
            <DetailRow label="Account Number" value={walletId || regInfo?.user_ref} />
          </div>
        </div>

        {userKyc && (
          <div className="rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6" style={{ backgroundColor: contentCard.background, borderColor: contentCard.border }}>
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: contentCard.subtitle }}>KYC Details</h2>
            <div className="space-y-0">
              <DetailRow label="First Name" value={userKyc.first_name} />
              <DetailRow label="Middle Name" value={userKyc.moddle_name} />
              <DetailRow label="Last Name" value={userKyc.last_name} />
              <DetailRow label="Father Name" value={userKyc.father_name} />
              <DetailRow label="Document ID" value={userKyc.document_id} />
              <DetailRow label="Email" value={userKyc.email} />
              <DetailRow label="Emergency Mobile" value={userKyc.emergency_mobnum} />
              <DetailRow label="Marital Status" value={userKyc.marital_status} />
              <DetailRow label="Gender" value={userKyc.gender === 1 ? 'Male' : userKyc.gender === 2 ? 'Female' : userKyc.gender} />
              <DetailRow
                label="DOB"
                value={
                  userKyc.dob
                    ? `${String(new Date(userKyc.dob).getDate()).padStart(2, '0')}-${String(new Date(userKyc.dob).getMonth() + 1).padStart(2, '0')}-${new Date(userKyc.dob).getFullYear()}`
                    : '—'
                }
              />
              <DetailRow label="Auth Status" value={userKyc.auth_status} />
            </div>
          </div>
        )}

        <div className="rounded-lg shadow-sm border p-4 sm:p-6" style={{ backgroundColor: contentCard.background, borderColor: contentCard.border }}>
          <Button onClick={() => navigate('/customer/profile')} variant="outline" fullWidth size="md">
            Back
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default ProfileDetails
