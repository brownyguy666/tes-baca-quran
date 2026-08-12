import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f2d1a',
              color: '#dcfce7',
              border: '1px solid rgba(22,163,74,0.3)',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: '13px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#0f2d1a' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0f2d1a' },
              style: {
                border: '1px solid rgba(239,68,68,0.3)',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
