import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import NewTest from './pages/NewTest'
import TestHistory from './pages/TestHistory'
import TestResult from './pages/TestResult'

function PublicRoute({ children }) {
  const { session, isLoading } = useAuth()
  if (isLoading) return null
  if (session) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected — wrapped in Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <Layout><Students /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/:id/history"
        element={
          <ProtectedRoute>
            <Layout><TestHistory /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/test/new"
        element={
          <ProtectedRoute>
            <Layout><NewTest /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/test/result/:id"
        element={
          <ProtectedRoute>
            <Layout><TestResult /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
