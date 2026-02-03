import { Suspense } from 'react'
import React from 'react'

// Feature pages
import HomePage from '../components/home/HomePage.jsx'
import SendStart from '../components/send/SendStart.jsx'
import SendConfirm from '../components/send/SendConfirm.jsx'
import SendSuccess from '../components/send/SendSuccess.jsx'
import ReceivePage from '../components/receive/ReceivePage'
import WalletToCardPage from '../components/wallet-to-card/WalletToCardPage'
import CashInPage from '../components/cash-in/CashInPage'
import CashInConfirm from '../components/cash-in/CashInConfirm'
import CashInSuccess from '../components/cash-in/CashInSuccess'
import CashOutPage from '../components/cash-out/CashOutPage'
import CashOutConfirm from '../components/cash-out/CashOutConfirm'
import CashOutSuccess from '../components/cash-out/CashOutSuccess'
import HistoryPage from '../components/history/HistoryPage'
import TransactionDetails from '../components/history/TransactionDetails'
import CardsPage from '../components/cards/PaysePayCards/CardsPage'
import CardDetails from '../components/cards/PaysePayCards/CardDetails'
import CardRequest from '../components/cards/PaysePayCards/CardRequest'
import CardBeneficiaryList from '../components/cards/OtherBankCards/CardBeneficiaryList'
import CardBeneficiaryAdd from '../components/cards/OtherBankCards/CardBeneficiaryAdd'
import CardBeneficiaryEdit from '../components/cards/OtherBankCards/CardBeneficiaryEdit'
import CardBeneficiaryView from '../components/cards/OtherBankCards/CardBeneficiaryView'
import CardBeneficiaryDelete from '../components/cards/OtherBankCards/CardBeneficiaryDelete'
import TransactionList from '../components/transactions/TransactionList'
import ViewTransactionList from '../components/transactions/viewTransactionList'
import ProfilePage from '../components/profile/ProfilePage'
import ProfileDetails from '../components/profile/ProfileDetails'

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
    path: 'wallet-to-card',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <WalletToCardPage />
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
    path: 'transactions',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <TransactionList />
      </Suspense>
    ),
  },
  {
    path: 'transactions/view/:id',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <ViewTransactionList />
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
    path: 'card-request',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CardRequest />
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
    path: 'other-cards',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CardBeneficiaryList />
      </Suspense>
    ),
  },
  {
    path: 'other-cards/add',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CardBeneficiaryAdd />
      </Suspense>
    ),
  },
  {
    path: 'other-cards/edit/:id',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CardBeneficiaryEdit />
      </Suspense>
    ),
  },
  {
    path: 'other-cards/view/:id',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CardBeneficiaryView />
      </Suspense>
    ),
  },
  {
    path: 'other-cards/delete/:id',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CardBeneficiaryDelete />
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

