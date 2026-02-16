import { Suspense } from 'react'
import React from 'react'

// Feature pages
import HomePage from '../components/home/HomePage.jsx'
import SendStart from '../components/send/SendStart.jsx'
import SendConfirm from '../components/send/SendConfirm.jsx'
import SendSuccess from '../components/send/SendSuccess.jsx'
import SendTransactionDetails from '../components/send/SendTransactionDetails.jsx'
import ReceivePage from '../components/receive/ReceivePage'
import WalletToCardStart from '../components/wallet-to-card/WalletToCardStart'
import WalletToCardConfirm from '../components/wallet-to-card/WalletToCardConfirm'
import WalletToCardSuccess from '../components/wallet-to-card/WalletToCardSuccess'
import WalletToCardTransactionDetails from '../components/wallet-to-card/WalletToCardTransactionDetails'
import CardToCardStart from '../components/card-to-card/CardToCardStart'
import CardToCardConfirm from '../components/card-to-card/CardToCardConfirm'
import CardToCardSuccess from '../components/card-to-card/CardToCardSuccess'
import CardToCardTransactionDetails from '../components/card-to-card/CardToCardTransactionDetails'


import CashInPage from '../components/cash-in/CashInPage'
import CashInConfirm from '../components/cash-in/CashInConfirm'
import CashInSuccess from '../components/cash-in/CashInSuccess'
import CashInTransactionDetails from '../components/cash-in/CashInTransactionDetails'


import CashInMethod from '../components/cash-in/CashInMethod'
import CashInCardList from '../components/cash-in/CashInCardList'

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
import DisputeList from '../components/disputes/DisputeList'
import VoucherPage from '../components/voucher/VoucherPage'
import VoucherCreate from '../components/voucher/voucherCreate'
import ViewVoucher from '../components/voucher/viewVoucher'
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
    path: 'send/details',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <SendTransactionDetails />
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
        <WalletToCardStart />
      </Suspense>
    ),
  },
  {
    path: 'wallet-to-card/confirm',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <WalletToCardConfirm />
      </Suspense>
    ),
  },
  {
    path: 'wallet-to-card/success',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <WalletToCardSuccess />
      </Suspense>
    ),
  },
  {
    path: 'wallet-to-card/details',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <WalletToCardTransactionDetails />
      </Suspense>
    ),
  },
  {
    path: 'card-to-card',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CardToCardStart />
      </Suspense>
    ),
  },
  {
    path: 'card-to-card/confirm',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CardToCardConfirm />
      </Suspense>
    ),
  },
  {
    path: 'card-to-card/success',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CardToCardSuccess />
      </Suspense>
    ),
  },
  {
    path: 'card-to-card/details',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <CardToCardTransactionDetails />
      </Suspense>
    ),
  },
 
 
 
{
  path: 'cash-in',
  element: (
    <Suspense fallback={<LinearProgress />}>
      <CashInMethod />
    </Suspense>
  ),
},
{
  path: 'cash-in/cards',
  element: (
    <Suspense fallback={<LinearProgress />}>
      <CashInCardList />
    </Suspense>
  ),
},
{
  path: 'cash-in/add',
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
  path: 'cash-in/details',
  element: (
    <Suspense fallback={<LinearProgress />}>
      <CashInTransactionDetails />
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
    path: 'disputes',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <DisputeList />
      </Suspense>
    ),
  },
  {
    path: 'voucher',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <VoucherPage />
      </Suspense>
    ),
  },
  {
    path: 'voucher/create',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <VoucherCreate />
      </Suspense>
    ),
  },
  {
    path: 'voucher/view',
    element: (
      <Suspense fallback={<LinearProgress />}>
        <ViewVoucher />
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

