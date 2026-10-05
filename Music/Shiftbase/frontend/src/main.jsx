import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import App from './App'
import './index.css'

const backendUrl = import.meta.env.VITE_API_URL || 'https://shiftbase.onrender.com'
axios.defaults.baseURL = backendUrl.replace(/\/$/, '')
axios.defaults.withCredentials = true
axios.defaults.timeout = 60000

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
