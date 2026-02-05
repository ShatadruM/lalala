import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminScanner from './pages/AdminScanner' 

// Guard 1: Must be logged in
const RequireAuth = () => {
  const { user } = useAuth()
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

// Guard 2: Must have a completed profile
const RequireProfile = () => {
  const { profile } = useAuth()
  if (!profile || !profile.registration_number || !profile.college_name) {
    return <Navigate to="/register" replace />
  }
  return <Outlet />
}

// Guard 3: ADMINS ONLY (The Firewall)
const RequireAdmin = () => {
  const { profile, loading } = useAuth()
  
  if (loading) return <div>Checking Permissions...</div>

  // If role is NOT 'admin', kick them back to dashboard
  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  
  return <Outlet />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Area */}
          <Route element={<RequireAuth />}>
            
            <Route path="/register" element={<Register />} />

            {/* Student Area */}
            <Route element={<RequireProfile />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* ADMIN AREA (Nested inside Profile check to ensure they are fully set up) */}
              <Route element={<RequireAdmin />}>
                <Route path="/admin" element={<AdminScanner />} />
              </Route>

            </Route>

          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}