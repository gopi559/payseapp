import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import Store from './Redux/store'
import appRouter from './Router/Router'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'

function App() {
  return (
    <Provider store={Store}>
      <div className="App">
        <RouterProvider router={appRouter} />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Provider>
  )
}

export default App

