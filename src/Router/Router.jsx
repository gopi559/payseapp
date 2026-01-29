import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '../Login/LoginPage.jsx'
import ProtectedRoute from './ProtectRoute'
import { customerRoutes } from './index'
import { ROUTES } from '../config/routes'

// Error component
const Error = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-brand-dark mb-4">404</h1>
      <p className="text-gray-600">Page not found</p>
    </div>
  </div>
)

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={ROUTES.LOGIN} replace />,
    errorElement: <Error />,
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
    errorElement: <Error />,
  },
  {
    path: '/customer',
    element: <ProtectedRoute />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Navigate to="/customer/home" replace />,
      },
      ...customerRoutes,
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
])

export default appRouter

