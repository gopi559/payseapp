import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../shared/layout/PageContainer'
import Button from '../../shared/components/Button'
import { ROUTES } from '../../config/routes'

const ScanPage = () => {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  
  const handleScan = () => {
    setScanning(true)
    // Simulate QR scan
    setTimeout(() => {
      setScanning(false)
      navigate(ROUTES.SCAN_CONFIRM)
    }, 2000)
  }
  
  return (
    <PageContainer>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Scan QR Code</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-64 h-64 bg-gray-900 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
              {scanning ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-4 border-brand-primary border-dashed animate-pulse"></div>
                </div>
              ) : (
                <div className="text-center text-white">
                  <span className="text-6xl mb-2 block">📷</span>
                  <p className="text-sm">Point camera at QR code</p>
                </div>
              )}
            </div>
            {scanning && (
              <p className="text-sm text-gray-600">Scanning...</p>
            )}
          </div>
        </div>
        
        <Button onClick={handleScan} fullWidth disabled={scanning}>
          {scanning ? 'Scanning...' : 'Start Scan'}
        </Button>
      </div>
    </PageContainer>
  )
}

export default ScanPage


