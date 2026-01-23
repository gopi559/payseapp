import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import Store from './Redux/store'
import appRouter from './Router/Router'
import './index.css'

function App() {
  return (
    <Provider store={Store}>
      <div className="App">
        <RouterProvider router={appRouter} />
      </div>
    </Provider>
  )
}

export default App

