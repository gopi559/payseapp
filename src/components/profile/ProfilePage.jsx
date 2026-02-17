import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { CiLogout } from 'react-icons/ci'
import { HiCamera, HiXMark } from 'react-icons/hi2'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import authService from '../../Login/auth.service.jsx'
import profileService from './profile.service'
import { setProfileImage } from '../../Redux/store.jsx'

const ProfilePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const user = useSelector((state) => state.auth.user)
  const walletId = useSelector((state) => state.wallet.walletId)
  const profileImage = useSelector((state) => state.auth.profileImage)
  const profileImageId = useSelector((state) => state.auth.profileImageId)

  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState(null)

  const regInfo = user?.reg_info || user
  const userKyc = user?.user_kyc || null

  const displayName =
    userKyc?.first_name || userKyc?.last_name
      ? [userKyc.first_name, userKyc.last_name].filter(Boolean).join(' ')
      : regInfo?.mobile || regInfo?.email || 'User'

  const userRef = regInfo?.user_ref || walletId
  const userId = regInfo?.user_id ?? regInfo?.id ?? null

  /* ================= FETCH IMAGE (POST → BLOB) ================= */
  useEffect(() => {
    if (!profileImage && profileImageId) {
      profileService
        .fetchImageById({ image_id: profileImageId })
        .then((res) => {
          dispatch(
            setProfileImage({
              id: res.imageId,
              url: res.imageUrl,
            })
          )
        })
        .catch(() => {})
    }
  }, [profileImage, profileImageId, dispatch])

  /* ================= IMAGE SELECT ================= */
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => setLocalPreview(reader.result)
    reader.readAsDataURL(file)

    handleImageUpload(file)
  }

  /* ================= UPLOAD ================= */
  const handleImageUpload = async (file) => {
    if (!userId) {
      toast.error('User ID not found')
      return
    }

    setUploading(true)
    try {
      const uploadRes = await profileService.uploadImage({
        user_id: userId,
        file,
      })

      if (uploadRes?.imageId) {
        const imageRes = await profileService.fetchImageById({
          image_id: uploadRes.imageId,
        })

        dispatch(
          setProfileImage({
            id: imageRes.imageId,
            url: imageRes.imageUrl,
          })
        )

        setLocalPreview(null)
        toast.success('Profile picture updated')
      }
    } catch (err) {
      toast.error(err?.message || 'Upload failed')
      setLocalPreview(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  /* ================= REMOVE ================= */
  const handleRemoveImage = async () => {
    if (!profileImageId) return

    if (!window.confirm('Remove profile picture?')) return

    setUploading(true)
    try {
      await profileService.removeImage({ image_id: profileImageId })
      dispatch(setProfileImage({ id: null, url: null }))
      toast.success('Profile picture removed')
    } catch (err) {
      toast.error(err?.message || 'Failed to remove image')
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/')
  }

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold mb-6">Profile</h1>

        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="w-28 h-28 rounded-full overflow-hidden border flex items-center justify-center cursor-pointer hover:shadow"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : localPreview ? (
                  <img
                    src={localPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">👤</span>
                )}
              </div>

              {!uploading && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-brand-primary text-white p-2 rounded-full"
                >
                  <HiCamera />
                </button>
              )}

              {!uploading && profileImage && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                >
                  <HiXMark />
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            <h2 className="text-lg font-semibold">{displayName}</h2>
            {regInfo?.mobile && (
              <p className="text-sm text-gray-600">{regInfo.mobile}</p>
            )}
          </div>

          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>User ref</span>
              <span className="font-mono">{userRef || '—'}</span>
            </div>
            {regInfo?.user_type_name && (
              <div className="flex justify-between text-sm">
                <span>Account type</span>
                <span>{regInfo.user_type_name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 mb-6">
          <button
            onClick={() => navigate('/customer/profile/details')}
            className="w-full flex justify-between items-center"
          >
            <span>Profile Details</span>
            <span>›</span>
          </button>
        </div>

        <Button onClick={handleLogout} variant="outline" fullWidth>
          <CiLogout /> Logout
        </Button>
      </div>
    </PageContainer>
  )
}

export default ProfilePage
