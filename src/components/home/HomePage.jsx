import React from 'react'
import PageContainer from '../../Reusable/PageContainer'
import ActionGrid from './ActionGrid'
import PromoBanner from './PromoBanner'

const HomePage = () => {
  return (
    <PageContainer>
      <div className="w-full max-w-[680px] mx-auto pb-12 min-h-[115vh]">
        <ActionGrid />
        <PromoBanner />
      </div>
    </PageContainer>
  )
}

export default HomePage
