import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../Reusable/PageContainer'
import Button from '../../Reusable/Button'
import { ROUTES } from '../../config/routes'

const ScanPage = () => {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  
  const handleScan = () => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      navigate(ROUTES.SCAN_CONFIRM)
    }, 2000)
  }
  
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark mb-4 sm:mb-6">Scan QR Code</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gray-900 rounded-lg flex items-center justify-center mb-3 sm:mb-4 relative overflow-hidden">
              {scanning ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-36 h-36 sm:w-40 sm:h-40 border-3 border-brand-primary border-dashed animate-pulse rounded-lg"></div>
                </div>
              ) : (
                <div className="text-center text-white">
                  <span className="text-4xl sm:text-5xl mb-2 block">📷</span>
                  <p className="text-xs sm:text-sm">Point camera at QR code</p>
                </div>
              )}
            </div>
            {scanning && (
              <p className="text-xs sm:text-sm text-gray-600">Scanning...</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <Button onClick={handleScan} fullWidth size="md" disabled={scanning}>
            {scanning ? 'Scanning...' : 'Start Scan'}
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default ScanPage


