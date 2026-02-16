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
  const profileImageFromRedux = useSelector((state) => state.auth.profileImage)
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [localImagePreview, setLocalImagePreview] = useState(null)
  const [loadingImage, setLoadingImage] = useState(false)
  
  // Use Redux image if available, otherwise use local preview
  const profileImage = profileImageFromRedux || localImagePreview

  const regInfo = user?.reg_info || user
  const userKyc = user?.user_kyc || null
  const displayName = userKyc?.first_name || userKyc?.last_name
    ? [userKyc.first_name, userKyc.last_name].filter(Boolean).join(' ')
    : regInfo?.mobile || regInfo?.email || 'User'
  const userRef = regInfo?.user_ref || walletId
  const userId = regInfo?.user_id ?? regInfo?.id ?? user?.user_id ?? user?.id ?? null

  // Fetch profile image on component mount if not already in Redux
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!userId || profileImageFromRedux) return

      setLoadingImage(true)
      try {
        const result = await profileService.fetchImage({
          user_id: userId,
          page: 1,
          no_of_data: 50,
          is_temp: 0,
        })
        
        // Set image URL in Redux if available
        if (result.imageUrl) {
          dispatch(setProfileImage(result.imageUrl))
        }
      } catch (err) {
        // Silently fail - user might not have uploaded an image yet
        console.log('Profile image not found:', err?.message)
      } finally {
        setLoadingImage(false)
      }
    }

    fetchProfileImage()
  }, [userId, profileImageFromRedux, dispatch])

  const handleLogout = () => {
    authService.logout()
    navigate('/')
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    // Preview image locally
    const reader = new FileReader()
    reader.onloadend = () => {
      setLocalImagePreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload image
    handleImageUpload(file)
  }

  const handleImageUpload = async (file) => {
    if (!userId) {
      toast.error('User ID not available')
      return
    }

    setUploading(true)
    try {
      const uploadResult = await profileService.uploadImage({
        user_id: userId,
        file: file,
        page: 1,
        no_of_data: 50,
        is_temp: 0,
      })
      toast.success('Profile image uploaded successfully')
      
      // Try to get image URL from upload response first
      let imageUrl = uploadResult?.imageUrl ?? null
      
      // If not in upload response, fetch the updated profile image
      if (!imageUrl) {
        try {
          const result = await profileService.fetchImage({
            user_id: userId,
            page: 1,
            no_of_data: 50,
            is_temp: 0,
          })
          imageUrl = result.imageUrl
        } catch (fetchErr) {
          console.log('Failed to fetch updated image:', fetchErr?.message)
        }
      }
      
      // Update Redux with the image URL (or use local preview if API doesn't return URL)
      if (imageUrl) {
        dispatch(setProfileImage(imageUrl))
        setLocalImagePreview(null) // Clear local preview since we have Redux image
      } else if (localImagePreview) {
        // If API doesn't return URL, use local preview and store in Redux
        dispatch(setProfileImage(localImagePreview))
      }
    } catch (err) {
      const msg = err?.message || 'Failed to upload profile image'
      toast.error(msg)
      setLocalImagePreview(null)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImageClick = () => {
    if (!uploading && !loadingImage) {
      fileInputRef.current?.click()
    }
  }

  const handleRemoveImage = async () => {
    if (!profileImage) return

    const confirmRemove = window.confirm('Are you sure you want to remove your profile picture?')
    if (!confirmRemove) return

    setUploading(true)
    try {
      await profileService.removeImage({ user_id: userId })
      dispatch(setProfileImage(null))
      setLocalImagePreview(null)
      toast.success('Profile picture removed successfully')
    } catch (err) {
      const msg = err?.message || 'Failed to remove profile picture'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark mb-4 sm:mb-6">Profile</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <div className="relative mb-4">
              <div 
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center overflow-hidden border-2 ${
                  profileImage ? 'border-gray-200' : 'border-brand-primary bg-brand-primary'
                } ${uploading || loadingImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-brand-action hover:shadow-md'} transition-all duration-200`}
                onClick={handleImageClick}
                title="Click to upload profile picture"
              >
                {loadingImage ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  </div>
                ) : profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={() => {
                      // Fallback to default if image fails to load
                      dispatch(setProfileImage(null))
                      setLocalImagePreview(null)
                    }}
                  />
                ) : (
                  <span className="text-4xl sm:text-5xl text-white">👤</span>
                )}
              </div>
              
              {/* Camera Icon Button */}
              {!uploading && !loadingImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleImageClick()
                  }}
                  className="absolute bottom-0 right-0 sm:right-2 bg-brand-primary text-white rounded-full p-2.5 sm:p-3 shadow-lg hover:bg-brand-action transition-all duration-200 border-2 border-white hover:scale-110 z-10"
                  aria-label="Upload profile image"
                  title="Upload profile picture"
                >
                  <HiCamera className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Remove Icon Button - Only show when image exists */}
              {!uploading && !loadingImage && profileImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveImage()
                  }}
                  className="absolute top-0 right-0 sm:right-2 bg-red-500 text-white rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-red-600 transition-all duration-200 border-2 border-white hover:scale-110 z-10"
                  aria-label="Remove profile image"
                  title="Remove profile picture"
                >
 <HiXMark className="w-4 h-4 sm:w-5 sm:h-5" />           
      </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={uploading || loadingImage}
              />
            </div>

            {/* Status Messages */}
            {uploading && (
              <div className="flex items-center gap-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-primary border-t-transparent"></div>
                <p className="text-xs sm:text-sm text-gray-600">Uploading image...</p>
              </div>
            )}

            {/* Action Buttons */}
            {!uploading && !loadingImage && (
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-3">
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="text-xs sm:text-sm text-brand-primary hover:text-brand-action font-medium transition-colors px-3 py-1.5 rounded-md hover:bg-brand-surfaceMuted"
                >
                  {profileImage ? 'Change Picture' : 'Upload Picture'}
                </button>
                {profileImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium transition-colors px-3 py-1.5 rounded-md hover:bg-red-50"
                  >
                    Remove Picture
                  </button>
                )}
              </div>
            )}

            {/* User Info */}
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-brand-dark mb-1">{displayName}</h2>
              {regInfo?.mobile && (
                <p className="text-xs sm:text-sm text-gray-600">{regInfo.mobile}</p>
              )}
              {regInfo?.email && !regInfo?.mobile && (
                <p className="text-xs sm:text-sm text-gray-600">{regInfo.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 border-t border-gray-100 pt-3 sm:pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">User ref</span>
              <span className="font-medium text-brand-dark font-mono text-xs sm:text-sm break-all text-right max-w-[60%]">{userRef || '—'}</span>
            </div>
            {regInfo?.user_type_name && (
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Account type</span>
                <span className="font-medium text-brand-dark text-xs sm:text-sm">{regInfo.user_type_name}</span>
              </div>
            )}
            {regInfo?.auth_status && (
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Status</span>
                <span className="font-medium text-brand-dark text-xs sm:text-sm">{regInfo.auth_status}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/customer/profile/details')}
            className="w-full flex items-center justify-between py-2 px-2 hover:bg-brand-surfaceMuted rounded-md transition-colors"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">👤</span>
              <span className="font-medium text-brand-dark text-sm sm:text-base">Profile Details</span>
            </div>
            <span className="text-gray-400 text-lg">›</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <Button onClick={handleLogout} variant="outline" fullWidth size="md" className="flex items-center justify-center gap-2">
            <CiLogout />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default ProfilePage

