import React from 'react'
import PageContainer from '../../Reusable/PageContainer'
import ActionGrid from './ActionGrid'
import PromoBanner from './PromoBanner'

const HomePage = () => {
  return (
    <PageContainer>
      <ActionGrid />
      <PromoBanner />
    </PageContainer>
  )
}

export default HomePage

