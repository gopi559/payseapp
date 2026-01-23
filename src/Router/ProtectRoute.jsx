import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AppShell from '../shell/AppShell'
import { ROUTES } from '../config/routes'

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

export default ProtectedRoute

