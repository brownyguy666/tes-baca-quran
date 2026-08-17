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
import HistoryLog from './pages/HistoryLog'
import Reports from './pages/Reports'
import Rubric from './pages/Rubric'
import Settings from './pages/Settings'

function PublicRoute({ children }) {
  const { session, isLoading } = useAuth()
  if (isLoading) return null
  if (session) return <Navigate to="/dashboard" replace />
  return children
}

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      {/* Protected — wrapped in Layout */}
      <Route path="/dashboard"             element={<Protected><Dashboard /></Protected>} />
      <Route path="/students"              element={<Protected><Students /></Protected>} />
      <Route path="/students/:id/history"  element={<Protected><TestHistory /></Protected>} />
      <Route path="/test/new"              element={<Protected><NewTest /></Protected>} />
      <Route path="/test/result/:id"       element={<Protected><TestResult /></Protected>} />

      {/* New routes */}
      <Route path="/history"               element={<Protected><HistoryLog /></Protected>} />
      <Route path="/reports"               element={<Protected><Reports /></Protected>} />
      <Route path="/rubric"                element={<Protected><Rubric /></Protected>} />
      <Route path="/settings"              element={<Protected><Settings /></Protected>} />

      {/* Default */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
