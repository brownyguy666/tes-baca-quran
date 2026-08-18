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
import LiveScreen from './pages/LiveScreen'
import DemoAssessment from './pages/DemoAssessment'

function PublicRoute({ children }) {
  const { session, isDemo, isLoading } = useAuth()
  if (isLoading) return null
  if (session) {
    return <Navigate to={isDemo ? '/demo' : '/dashboard'} replace />
  }
  return children
}

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

function RoleHomeRedirect() {
  const { isDemo } = useAuth()
  return <Navigate to={isDemo ? '/demo' : '/dashboard'} replace />
}

export default function App() {
  const { isDemo } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      {/* Demo Assessment studio for Kemenag / Guest evaluators */}
      <Route path="/demo" element={<Protected><DemoAssessment /></Protected>} />

      {/* Protected — wrapped in Layout */}
      <Route
        path="/dashboard"
        element={<Protected>{isDemo ? <DemoAssessment /> : <Dashboard />}</Protected>}
      />
      <Route
        path="/test/new"
        element={<Protected>{isDemo ? <DemoAssessment /> : <NewTest />}</Protected>}
      />
      <Route path="/students"              element={<Protected><Students /></Protected>} />
      <Route path="/students/:id/history"  element={<Protected><TestHistory /></Protected>} />
      <Route path="/test/result/:id"       element={<Protected><TestResult /></Protected>} />

      {/* New routes */}
      <Route path="/history"               element={<Protected><HistoryLog /></Protected>} />
      <Route path="/reports"               element={<Protected><Reports /></Protected>} />
      <Route path="/rubric"                element={<Protected><Rubric /></Protected>} />
      <Route path="/settings"              element={<Protected><Settings /></Protected>} />

      {/* Standalone Student Live Screen */}
      <Route path="/live"                  element={<LiveScreen />} />

      {/* Default */}
      <Route path="/"  element={<RoleHomeRedirect />} />
      <Route path="*"  element={<RoleHomeRedirect />} />
    </Routes>
  )
}

