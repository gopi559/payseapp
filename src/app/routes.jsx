import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import AppShell from '../shell/AppShell'
import { ROUTES } from '../config/routes'

// Auth pages
import LoginPage from '../auth/pages/LoginPage'
import PasscodePage from '../auth/pages/PasscodePage'

// Feature pages
import HomePage from '../features/home/HomePage'
import SendStart from '../features/send/pages/SendStart'
import SendConfirm from '../features/send/pages/SendConfirm'
import SendSuccess from '../features/send/pages/SendSuccess'
import ReceivePage from '../features/receive/ReceivePage'
import ScanPage from '../features/scan/ScanPage'
import ScanConfirm from '../features/scan/ScanConfirm'
import CashInPage from '../features/cash-in/pages/CashInPage'
import CashInConfirm from '../features/cash-in/pages/CashInConfirm'
import CashInSuccess from '../features/cash-in/pages/CashInSuccess'
import CashOutPage from '../features/cash-out/pages/CashOutPage'
import CashOutConfirm from '../features/cash-out/pages/CashOutConfirm'
import CashOutSuccess from '../features/cash-out/pages/CashOutSuccess'
import HistoryPage from '../features/history/HistoryPage'
import TransactionDetails from '../features/history/TransactionDetails'
import CardsPage from '../features/cards/CardsPage'
import CardDetails from '../features/cards/CardDetails'
import ProfilePage from '../features/profile/ProfilePage'
import ProfileDetails from '../features/profile/ProfileDetails'
import ChangePasscode from '../features/profile/ChangePasscode'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  
  return <AppShell>{children}</AppShell>
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />
  }
  
  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.PASSCODE}
        element={
          <PublicRoute>
            <PasscodePage />
          </PublicRoute>
        }
      />
      
      {/* Protected routes */}
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SEND_START}
        element={
          <ProtectedRoute>
            <SendStart />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SEND_CONFIRM}
        element={
          <ProtectedRoute>
            <SendConfirm />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SEND_SUCCESS}
        element={
          <ProtectedRoute>
            <SendSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.RECEIVE}
        element={
          <ProtectedRoute>
            <ReceivePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SCAN}
        element={
          <ProtectedRoute>
            <ScanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SCAN_CONFIRM}
        element={
          <ProtectedRoute>
            <ScanConfirm />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CASH_IN}
        element={
          <ProtectedRoute>
            <CashInPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CASH_IN_CONFIRM}
        element={
          <ProtectedRoute>
            <CashInConfirm />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CASH_IN_SUCCESS}
        element={
          <ProtectedRoute>
            <CashInSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CASH_OUT}
        element={
          <ProtectedRoute>
            <CashOutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CASH_OUT_CONFIRM}
        element={
          <ProtectedRoute>
            <CashOutConfirm />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CASH_OUT_SUCCESS}
        element={
          <ProtectedRoute>
            <CashOutSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HISTORY}
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TRANSACTION_DETAILS}
        element={
          <ProtectedRoute>
            <TransactionDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CARDS}
        element={
          <ProtectedRoute>
            <CardsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CARD_DETAILS}
        element={
          <ProtectedRoute>
            <CardDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROFILE_DETAILS}
        element={
          <ProtectedRoute>
            <ProfileDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CHANGE_PASSCODE}
        element={
          <ProtectedRoute>
            <ChangePasscode />
          </ProtectedRoute>
        }
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to={ROUTES.HOME} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}

export default AppRoutes

