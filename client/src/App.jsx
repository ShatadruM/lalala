import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

// Guard 1: Must be logged in (Session check)
const RequireAuth = () => {
  const { user } = useAuth()
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

// Guard 2: Must have a completed profile (Data check)
const RequireProfile = () => {
  const { profile } = useAuth()
  
  // If profile is missing OR key fields are empty, send to register
  if (!profile || !profile.registration_number || !profile.college_name) {
    return <Navigate to="/register" replace />
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
            
            {/* User is logged in, but might not be registered */}
            <Route path="/register" element={<Register />} />

            {/* User MUST be fully registered to see these */}
            <Route element={<RequireProfile />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>

          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}