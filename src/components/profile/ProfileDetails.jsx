import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { FiBriefcase, FiFileText, FiMapPin, FiUser } from 'react-icons/fi'
import PageContainer from '../../Reusable/PageContainer'
import profileService from './profile.service'

const formatValue = (value, fallback) => {
  if (value === null || value === undefined) return fallback
  const text = String(value).trim()
  return text ? text : fallback
}

const formatDate = (value, locale, fallback) => {
  if (!value || value === '0001-01-01T00:00:00Z') return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toLocaleDateString(locale === 'ar' ? 'ar' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getProfileValueTranslationKey = (value) => {
  if (value === null || value === undefined) return null

  const normalizedValue = String(value).trim().toLowerCase()

  const valueMap = {
    single: 'profile_value_single',
    married: 'profile_value_married',
    afghan: 'profile_value_afghan',
    male: 'profile_value_male',
    female: 'profile_value_female',
    hinduism: 'profile_value_hinduism',
    islam: 'profile_value_islam',
    "bachelor's degree": 'profile_value_bachelors_degree',
    'low annual income': 'profile_value_low_annual_income',
    'low net worth group': 'profile_value_low_net_worth_group',
    kabul: 'profile_value_kabul',
    'personal use': 'profile_value_personal_use',
    'government employee': 'profile_value_government_employee',
    'business income': 'profile_value_business_income',
    'permanent address': 'profile_value_permanent_address',
    official: 'profile_value_official_address',
    'same as ekyc doc': 'profile_value_same_as_ekyc_doc',
  }

  return valueMap[normalizedValue] ?? null
}

const translateProfileValue = (value, t, fallback) => {
  const formattedValue = formatValue(value, fallback)
  if (formattedValue === fallback) return fallback

  const translationKey = getProfileValueTranslationKey(formattedValue)
  return translationKey ? t(translationKey, { defaultValue: formattedValue }) : formattedValue
}

const createDocumentUrl = (base64) => {
  if (!base64) return null
  if (String(base64).startsWith('data:')) return base64
  return `data:image/jpeg;base64,${base64}`
}

const getDocumentPreviewTranslationKey = (document) => {
  const columnName = String(document?.column_name || '').trim().toLowerCase()
  const face = String(document?.face || '').trim().toLowerCase()

  if (columnName === 'request_image' && face === 'front') return 'profile_address_document'
  if (columnName === 'request_image' && face === 'back') return 'profile_identity_document'
  if (columnName === 'candidate_image' && face === 'selfie') return 'profile_selfie_document'

  return null
}

const getDocumentPreviewLabel = (document, index, t) => {
  const translationKey = getDocumentPreviewTranslationKey(document)
  if (translationKey) return t(translationKey)

  const columnName = String(document?.column_name || '').trim().toLowerCase()
  const face = String(document?.face || '').trim().toLowerCase()
  const combined = [columnName.replace(/_/g, ' '), face].filter(Boolean).join(' - ')
  return combined || `Document ${index + 1}`
}

const resolveUserId = (user) =>
  user?.reg_info?.user_id ??
  user?.reg_info?.id ??
  user?.user_id ??
  user?.id ??
  null

const DetailGrid = ({ items, fallback }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-gray-200 bg-white p-3 transition hover:shadow-sm"
        >
          <p className="text-xs font-medium text-gray-500">{item.label}</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 break-words">
            {formatValue(item.value, fallback)}
          </p>
        </div>
      ))}
    </div>
  )
}

const ProfileDetails = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const user = useSelector((state) => state.auth.user)
  const walletId = useSelector((state) => state.wallet.walletId)
  const profileImage = useSelector((state) => state.auth.profileImage)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState({ kyc: {}, occupation: {}, address: [] })
  const [documents, setDocuments] = useState([])
  const [error, setError] = useState('')
  const [documentsError, setDocumentsError] = useState('')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [showDocuments, setShowDocuments] = useState(true)
  const notAvailable = t('not_available')
  const regInfo = user?.reg_info || user
  const userKyc = user?.user_kyc || null
  const userId = resolveUserId(user)
  const userRef = regInfo?.user_ref || walletId || null
  const userMobile = regInfo?.mobile || regInfo?.reg_mobile || user?.mobile || null
  const displayName =
    userKyc?.first_name || userKyc?.last_name
      ? [userKyc.first_name, userKyc.last_name].filter(Boolean).join(' ')
      : regInfo?.mobile || regInfo?.email || t('user')
  const accountType = regInfo?.user_type_name || profileData?.kyc?.UserTypeName || notAvailable

  useEffect(() => {
    let isMounted = true

    const fetchPersonalDetails = async () => {
      setLoading(true)
      setError('')
      setDocumentsError('')

      try {
        const personalDetailsPromise = profileService.getPersonalInformationList()
        const documentPromise = userId
          ? profileService.getDocumentList({
              user_id: userId,
              userId,
              user_ref: userRef,
              userRef,
              mobile: userMobile,
              reg_mobile: userMobile,
            })
          : Promise.resolve([])

        const [personalResult, documentResult] = await Promise.allSettled([
          personalDetailsPromise,
          documentPromise,
        ])

        if (!isMounted) return

        if (personalResult.status !== 'fulfilled') {
          throw personalResult.reason
        }

        const data = personalResult.value
        setProfileData({
          kyc: data?.kyc ?? {},
          occupation: data?.occupation ?? {},
          address: Array.isArray(data?.address) ? data.address : [],
        })

        if (documentResult.status === 'fulfilled') {
          setDocuments(Array.isArray(documentResult.value) ? documentResult.value : [])
        } else {
          setDocuments([])
          setDocumentsError(documentResult.reason?.message || t('profile_unable_to_load_personal_documents'))
        }
      } catch (err) {
        if (!isMounted) return
        setError(err?.message || t('profile_unable_to_load_details'))
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchPersonalDetails()

    return () => {
      isMounted = false
    }
  }, [t, userId, userRef, userMobile])

  const kycItems = useMemo(() => {
    const kyc = profileData.kyc || {}
    return [
      { label: t('profile_first_name'), value: kyc.UserFName },
      { label: t('profile_last_name'), value: kyc.UserLName },
      { label: t('profile_dob'), value: formatDate(kyc.DOB, i18n.language, notAvailable) },
      { label: t('profile_email'), value: kyc.Email },
      { label: t('profile_marital_status'), value: translateProfileValue(kyc.MaritalStatus, t, notAvailable) },
      { label: t('profile_nationality'), value: translateProfileValue(kyc.NationalityName, t, notAvailable) },
      { label: t('profile_gender'), value: translateProfileValue(kyc.GenderName, t, notAvailable) },
      { label: t('profile_religion'), value: translateProfileValue(kyc.ReligionName, t, notAvailable) },
      { label: t('profile_qualification'), value: translateProfileValue(kyc.QualificationName, t, notAvailable) },
      { label: t('profile_income'), value: translateProfileValue(kyc.AnnualIncomeDesc, t, notAvailable) },
      { label: t('profile_net_worth'), value: translateProfileValue(kyc.NetWorthDesc, t, notAvailable) },
      { label: t('profile_place_of_birth'), value: translateProfileValue(kyc.PlaceOfBirthName, t, notAvailable) },
      { label: t('profile_account_purpose'), value: translateProfileValue(kyc.AccountPurposeName, t, notAvailable) },
      { label: t('profile_emergency_number'), value: kyc.EmergencyNumber },
    ]
  }, [i18n.language, notAvailable, profileData.kyc, t])

  const occupationItems = useMemo(() => {
    const occupation = profileData.occupation || {}
    return [
      { label: t('profile_occupation_name'), value: translateProfileValue(occupation.occupation_name, t, notAvailable) },
      { label: t('profile_employer_name'), value: occupation.employer_name },
      { label: t('profile_designation'), value: occupation.designation },
      { label: t('profile_source_of_fund'), value: translateProfileValue(occupation.source_of_fund, t, notAvailable) },
      { label: t('profile_monthly_income'), value: occupation.momthly_income },
      { label: t('profile_office_address'), value: occupation.office_full_address },
      { label: t('profile_place_of_posting'), value: occupation.place_of_posting },
    ]
  }, [profileData.occupation, t])

  const primaryAddress = profileData.address?.[0] || {}
  const identityImage =
    documents.find((document) => String(document?.face || '').toLowerCase() === 'front') ||
    documents.find((document) => String(document?.column_name || '').toLowerCase().includes('request')) ||
    documents[0] ||
    null

  const addressDocumentItems = [
    { label: t('profile_address_type_desc'), value: translateProfileValue(primaryAddress.address_type_name, t, notAvailable) },
    { label: t('profile_address_label'), value: primaryAddress.address_line || primaryAddress.village_name },
    { label: t('profile_doc_type'), value: translateProfileValue(primaryAddress.address_proof_type_name, t, notAvailable) },
    {
      label: t('profile_proof_number'),
      value:
        primaryAddress.address_proof_number ||
        primaryAddress.proof_number ||
        primaryAddress.address_proof_no ||
        primaryAddress.doc_number,
    },
    { label: t('status'), value: primaryAddress.status },
  ]

  const identityDocumentItems = [
    {
      label: t('profile_document_name'),
      value:
        profileData.kyc?.id_type_name ||
        profileData.kyc?.IDTypeName ||
        profileData.kyc?.document_name ||
        profileData.kyc?.DocumentName,
    },
    {
      label: t('profile_document_number'),
      value:
        profileData.kyc?.document_number ||
        profileData.kyc?.DocumentNumber ||
        profileData.kyc?.id_number ||
        profileData.kyc?.IdNumber ||
        profileData.kyc?.IDNumber,
    },
    { label: t('profile_document_image_id'), value: identityImage?.id },
    { label: t('status'), value: profileData.kyc?.status ?? identityImage?.status },
  ]

  return (
    <PageContainer>
      <div className="mx-auto max-w-5xl px-4 py-8">

        <div className="mb-8 flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{t('profile_details')}</h1>
            <p className="text-sm text-gray-500">
              {t('profile_personal_occupation_address_information')}
            </p>
          </div>

          <button
            onClick={() => navigate('/customer/profile')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            {t('back')}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-xl border bg-white p-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
            <span className="ml-3 text-sm text-gray-600">{t('profile_loading')}</span>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-emerald-50">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <FiUser className="text-4xl text-emerald-700" />
                  )}
                </div>

                <h2 className="text-2xl font-semibold text-gray-900">{displayName}</h2>
                <p className="mt-1 text-sm text-gray-600">{formatValue(userMobile, notAvailable)}</p>
              </div>

              <div className="mt-6 grid gap-4 border-t border-gray-200 pt-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">{t('profile_user_ref')}</p>
                  <p className="mt-1 break-all font-medium text-gray-900">{formatValue(userRef, notAvailable)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('profile_account_type')}</p>
                  <p className="mt-1 font-medium text-gray-900">{formatValue(accountType, notAvailable)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FiUser className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-800">{t('profile_kyc_details')}</h2>
              </div>
              <DetailGrid items={kycItems} fallback={notAvailable} />
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FiBriefcase className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-800">
                  {t('profile_occupation_details')}
                </h2>
              </div>
              <DetailGrid items={occupationItems} fallback={notAvailable} />
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FiMapPin className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-800">
                  {t('profile_address_details')}
                </h2>
              </div>

              {profileData.address.length === 0 ? (
                <p className="text-sm text-gray-500">{t('profile_no_address_records_found')}</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {profileData.address.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                          {translateProfileValue(addr.address_type_name, t, notAvailable)}
                        </span>

                        <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          {translateProfileValue(addr.address_proof_type_name, t, notAvailable)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-700">
                        <p>{formatValue(addr.address_line, notAvailable)}</p>
                        <p>
                          {formatValue(addr.city_name, notAvailable)},{' '}
                          {formatValue(addr.state_name, notAvailable)}
                        </p>
                        <p>
                          {translateProfileValue(addr.country_name, t, notAvailable)} -{' '}
                          {formatValue(addr.postal_code, notAvailable)}
                        </p>
                        <p>{formatValue(addr.village_name, notAvailable)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FiFileText className="text-gray-500" />
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">{t('profile_personal_documents')}</h2>
                    <p className="text-xs text-gray-500">{t('profile_view_personal_documents')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDocuments((previous) => !previous)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {showDocuments ? t('profile_hide_documents') : t('profile_show_documents')}
                </button>
              </div>

              {showDocuments && (
                <div className="space-y-5">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-900">{t('profile_address_document')}</h3>
                  <div className="mt-4">
                    <DetailGrid items={addressDocumentItems} fallback={notAvailable} />
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-900">{t('profile_identity_document')}</h3>
                  <div className="mt-4">
                    <DetailGrid items={identityDocumentItems} fallback={notAvailable} />
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">{t('profile_document_images')}</h3>
                  </div>

                  {documents.length === 0 ? (
                    <p className="text-sm text-gray-500">{documentsError || t('not_available')}</p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {documents.map((document, index) => {
                        const previewUrl = createDocumentUrl(document?.image)

                        return (
                          <div
                            key={document?.id || `${document?.column_name}-${document?.face}-${index}`}
                            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                          >
                            <div className="aspect-[4/3] bg-gray-100">
                              {previewUrl ? (
                                <img
                                  src={previewUrl}
                                  alt={getDocumentPreviewLabel(document, index, t)}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                  {t('profile_no_preview')}
                                </div>
                              )}
                            </div>

                            <div className="space-y-2 p-4">
                              <p className="text-sm font-semibold text-gray-900">
                                {getDocumentPreviewLabel(document, index, t)}
                              </p>
                              <p className="text-xs text-gray-500">{t('profile_image_id')}: {formatValue(document?.id, notAvailable)}</p>
                              <button
                                onClick={() =>
                                  setSelectedDocument({
                                    title: getDocumentPreviewLabel(document, index, t),
                                    url: previewUrl,
                                  })
                                }
                                className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                                disabled={!previewUrl}
                              >
                                {t('profile_preview_document')}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {selectedDocument?.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">{selectedDocument.title}</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                {t('close')}
              </button>
            </div>
            <div className="flex max-h-[calc(90vh-73px)] items-center justify-center overflow-auto bg-gray-100 p-4">
              <img
                src={selectedDocument.url}
                alt={selectedDocument.title}
                className="max-h-full w-auto rounded-xl bg-white object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default ProfileDetails
