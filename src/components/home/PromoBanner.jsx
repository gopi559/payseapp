import React, { useEffect, useState } from 'react'
import { fetchWithBasicAuth, postWithBasicAuth } from '../../services/basicAuth.service.js'
import { LOGIN_BANNER_IMAGE, LOGIN_BANNER_LIST } from '../../utils/constant.jsx'

const PromoBanner = () => {
 const [bannerSrc, setBannerSrc] = useState('')
 const [bannerLink, setBannerLink] = useState('')
 const [isLoading, setIsLoading] = useState(true)
 const handleImageError = (event) => {
 event.currentTarget.style.display = 'none'
 setBannerSrc('')
 }

 useEffect(() => {
 let isMounted = true
 let objectUrl = null

 const pickBanner = (items) => {
 if (!Array.isArray(items) || items.length === 0) return null

 const valid = items
 .filter((item) => Number(item?.status) === 1 && Number(item?.process_status) === 1)
 .sort((a, b) => Number(a?.display_order ?? 9999) - Number(b?.display_order ?? 9999))

 return valid[0] || items[0]
 }

 const resolveImageFromResponse = async (response) => {
 const contentType = response.headers.get('content-type') || ''

 if (contentType.includes('application/json')) {
 const json = await response.json().catch(() => null)
 if (!response.ok || json?.code !== 1) {
 throw new Error(json?.message || 'Failed to fetch banner image')
 }

 const payload = json?.data
 if (typeof payload === 'string') return payload
 if (payload?.image_url) return payload.image_url
 if (payload?.url) return payload.url
 return null
 }

 if (!response.ok) {
 throw new Error('Failed to fetch banner image')
 }

 const blob = await response.blob()
 objectUrl = URL.createObjectURL(blob)
 return objectUrl
 }

 const loadBanner = async () => {
 try {
 const bannerList = await fetchWithBasicAuth(LOGIN_BANNER_LIST, { image_id: 1 })
 const selectedBanner = pickBanner(bannerList)

 if (!selectedBanner) {
 if (isMounted) setBannerSrc('')
 return
 }

 if (isMounted) {
 setBannerLink(selectedBanner.banner_link || '')
 }

 const imageId = Number(selectedBanner?.image_id)
 if (!imageId || Number.isNaN(imageId)) {
 if (isMounted) {
 setBannerSrc(selectedBanner?.image_url || '')
 }
 return
 }

 const imageResponse = await postWithBasicAuth(LOGIN_BANNER_IMAGE, { image_id: imageId })
 const resolvedSrc = await resolveImageFromResponse(imageResponse)

 if (isMounted && resolvedSrc) {
 setBannerSrc(resolvedSrc)
 } else if (isMounted) {
 setBannerSrc(selectedBanner?.image_url || '')
 }
 } catch (error) {
 if (isMounted) {
 setBannerSrc('')
 }
 } finally {
 if (isMounted) {
 setIsLoading(false)
 }
 }
 }

 loadBanner()

 return () => {
 isMounted = false
 if (objectUrl) {
 URL.revokeObjectURL(objectUrl)
 }
 }
 }, [])

 if (!isLoading && !bannerSrc) return null

 return (
 <div className="w-full px-4 pt-12 pb-8">
 <div className="mx-auto">
 {bannerLink ? (
 <a href={bannerLink} target="_blank" rel="noreferrer">
 <img 
 src={bannerSrc} 
 alt="Paysey Payment Banner" 
 onError={handleImageError}
 className={`w-full h-[190px] sm:h-[220px] rounded-xl object-cover ${isLoading ? 'opacity-80' : 'opacity-100'}`}
 />
 </a>
 ) : (
 <img 
 src={bannerSrc} 
 alt="Paysey Payment Banner" 
 onError={handleImageError}
 className={`w-full h-[190px] sm:h-[220px] rounded-xl object-cover ${isLoading ? 'opacity-80' : 'opacity-100'}`}
 />
 )}
 </div>
 </div>
 )
}

export default PromoBanner


