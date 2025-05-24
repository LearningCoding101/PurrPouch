import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./component/register";
import Dashboard from "./component/dashboard";
import Login from "./component/login";
import Homepage from "./page/homepage";
import CatProfile from "./page/CatProfile";
import CatProfileRouter from "./page/CatProfileRouter";
import CatProfileDetail from "./page/CatProfileDetail";
import AboutUs from "./page/AboutUs";
import { AuthProvider } from "./provider/auth_provider";
import {
  AuthGuard,
  AdminGuard,
  StaffGuard,
  CustomerGuard,
  GuestGuard,
} from "./services/routing";
// Header and Footer are now used in the PageWrapper component
import FontStyles from "./theme/FontStyles";
import LogoExamplePage from "./page/LogoExamplePage";

function App() {
  const AdminPanel = () => (
    <div style={{ padding: "20px", textAlign: "center" }}>
      Admin Role Access Only
    </div>
  );
  const StaffPanel = () => (
    <div style={{ padding: "20px", textAlign: "center" }}>
      Staff Role Access Only
    </div>
  );
  const CustomerPanel = () => (
    <div style={{ padding: "20px", textAlign: "center" }}>
      Customer Role Access Only
    </div>
  );
  const Unauthorized = () => (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Unauthorized Access</h2>
      <p>You don't have permission to access this page.</p>
    </div>
  );

  return (
    <AuthProvider>
      <Router>
        <FontStyles />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Routes>
            {/* Public routes - Unauthenticated/Guest users */}
            <Route path="/" element={<Homepage />} />
            <Route path="/sample" element={<LogoExamplePage />} />

            <Route path="/about-us" element={<AboutUs />} />

            <Route element={<GuestGuard />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected routes for any authenticated user */}
            <Route element={<AuthGuard />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Customer routes - customer, staff, and admin can access */}
            <Route element={<CustomerGuard />}>
              <Route path="/cat-profile" element={<CatProfileRouter />} />
              <Route path="/cat-profile-create" element={<CatProfile />} />
              <Route path="/cat-profile/:id" element={<CatProfileDetail />} />
              <Route path="/customer" element={<CustomerPanel />} />
            </Route>

            {/* Admin only routes */}
            <Route element={<AdminGuard />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>

            {/* Staff and Admin routes */}
            <Route element={<StaffGuard />}>
              <Route path="/staff" element={<StaffPanel />} />
            </Route>

            {/* Utility routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
