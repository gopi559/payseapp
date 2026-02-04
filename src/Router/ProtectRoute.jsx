import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AppShell from '../SidebarComponenets/AppShell'

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

export default ProtectedRoute

