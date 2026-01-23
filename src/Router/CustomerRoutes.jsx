import { Suspense } from 'react'
import React from 'react'

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

// Simple loading component
const LinearProgress = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
  </div>
)

export const customerRoutes = [
  {
    path: 'home',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    path: 'send',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <SendStart />
      </Suspense>
    ),
  },
  {
    path: 'send/confirm',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <SendConfirm />
      </Suspense>
    ),
  },
  {
    path: 'send/success',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <SendSuccess />
      </Suspense>
    ),
  },
  {
    path: 'receive',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <ReceivePage />
      </Suspense>
    ),
  },
  {
    path: 'scan',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <ScanPage />
      </Suspense>
    ),
  },
  {
    path: 'scan/confirm',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <ScanConfirm />
      </Suspense>
    ),
  },
  {
    path: 'cash-in',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CashInPage />
      </Suspense>
    ),
  },
  {
    path: 'cash-in/confirm',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CashInConfirm />
      </Suspense>
    ),
  },
  {
    path: 'cash-in/success',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CashInSuccess />
      </Suspense>
    ),
  },
  {
    path: 'cash-out',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CashOutPage />
      </Suspense>
    ),
  },
  {
    path: 'cash-out/confirm',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CashOutConfirm />
      </Suspense>
    ),
  },
  {
    path: 'cash-out/success',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CashOutSuccess />
      </Suspense>
    ),
  },
  {
    path: 'history',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <HistoryPage />
      </Suspense>
    ),
  },
  {
    path: 'history/:id',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <TransactionDetails />
      </Suspense>
    ),
  },
  {
    path: 'cards',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CardsPage />
      </Suspense>
    ),
  },
  {
    path: 'cards/:id',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CardDetails />
      </Suspense>
    ),
  },
  {
    path: 'profile',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <ProfilePage />
      </Suspense>
    ),
  },
  {
    path: 'profile/details',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <ProfileDetails />
      </Suspense>
    ),
  },
]

