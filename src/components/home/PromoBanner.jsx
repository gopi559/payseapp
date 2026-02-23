import React, { useEffect, useState } from 'react'
import { fetchWithBasicAuth } from '../../services/basicAuth.service'
import { LOGIN_BANNER_LIST } from '../../utils/constant'

const TEST_BANNER_IMAGE_ID = 904

const PromoBanner = () => {
  const [bannerData, setBannerData] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadBanner = async () => {
      try {
        const res = await fetchWithBasicAuth(LOGIN_BANNER_LIST, {
          image_id: TEST_BANNER_IMAGE_ID
        })

        const list = Array.isArray(res?.data) ? res.data : []

        const activeBanner = list
          .filter(item => Number(item?.status) === 1)
          .sort(
            (a, b) =>
              Number(a?.display_order || 0) -
              Number(b?.display_order || 0)
          )[0]

        if (isMounted) {
          setBannerData(activeBanner || null)
        }
      } catch {
        if (isMounted) setBannerData(null)
      }
    }

    loadBanner()

    return () => {
      isMounted = false
    }
  }, [])

  if (!bannerData?.image_url) return null

  const bannerAlt = bannerData?.banner_desc || 'Promo Banner'
  const bannerLink = bannerData?.banner_link

  const BannerImage = (
    <img
      src={bannerData.image_url}
      alt={bannerAlt}
      className="w-full h-auto rounded-xl object-cover"
    />
  )

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-2xl mx-auto">
        {bannerLink ? (
          <a href={bannerLink} target="_blank" rel="noreferrer">
            {BannerImage}
          </a>
        ) : (
          BannerImage
        )}
      </div>
    </div>
  )
}

export default PromoBanner