import React from 'react'
import { useParams } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'

const CardDetails = () => {
  const { id } = useParams()
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Card Details</h1>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600">Card ID: {id}</p>
        </div>
      </div>
    </PageContainer>
  )
}

export default CardDetails


