import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminScanner from "./pages/AdminScanner";
import AdminStats from "./pages/AdminStats";
//import VendorDashboard from "./pages/VendorDashboard";
import VendorStats from "./pages/VendorStats";
import VendorScanner from "./pages/VendorScanner";
import StudentStats from "./pages/StudentStats";

// Guard 1: Must be logged in
const RequireAuth = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Guard 2: Must have a completed profile
const RequireProfile = () => {
  const { profile } = useAuth();
  if (!profile || !profile.registration_number || !profile.college_name) {
    return <Navigate to="/register" replace />;
  }
  return <Outlet />;
};

// Guard 3: ADMINS ONLY (The Firewall)
const RequireAdmin = () => {
  const { profile, loading } = useAuth();

  if (loading) return <div>Checking Permissions...</div>;

  // If role is NOT 'admin', kick them back to dashboard
  if (profile?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const RequireVendor = () => {
  const { profile, loading } = useAuth();
  if (loading) return <div>Checking...</div>;
  if (profile?.role !== "vendor") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

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
              <Route path="/me/stats" element={<StudentStats />} />

              {/* ADMIN AREA  */}
              <Route element={<RequireAdmin />}>
                <Route path="/admin/scanner" element={<AdminScanner />} />
                <Route path="/admin/stats" element={<AdminStats />} />
              </Route>
            </Route>
          </Route>

          {/* VENDOR AREA  */}
          <Route element={<RequireVendor />}>
            
            <Route
              path="/vendor"
              element={<Navigate to="/vendor/scanner" replace />}
            />

            <Route path="/vendor/scanner" element={<VendorScanner />} />
            <Route path="/vendor/stats" element={<VendorStats />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
