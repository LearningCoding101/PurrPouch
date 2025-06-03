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
import EditCatProfile from "./page/EditCatProfile";
import MealPlans from "./page/MealPlans";
import AboutUs from "./page/AboutUs";
import Cart from "./page/Cart";
import Orders from "./page/Orders";
import { AuthProvider } from "./provider/auth_provider";
import { CatProfileProvider } from "./provider/cat_profile_provider";
import {
  AuthGuard,
  AdminGuard,
  StaffGuard,
  CustomerGuard,
  GuestGuard,
} from "./services/routing";
// Admin components
import AdminLayout from "./component/admin/AdminLayout";
import AdminDashboard from "./component/admin/Dashboard";
import AdminOrders from "./component/admin/Orders";
import AdminDeliveries from "./component/admin/Deliveries";
import AdminCustomers from "./component/admin/Customers";
import AdminSettings from "./component/admin/Settings";
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
      <CatProfileProvider>
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
                <Route
                  path="/edit-cat-profile/:id"
                  element={<EditCatProfile />}
                />
                <Route path="/meal-plans/:id" element={<MealPlans />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/customer" element={<CustomerPanel />} />
              </Route>

              {/* Admin only routes */}
              <Route element={<AdminGuard />}>
                <Route path="/admin/*" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="deliveries" element={<AdminDeliveries />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route
                    index
                    element={<Navigate to="/admin/dashboard" replace />}
                  />
                </Route>
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
      </CatProfileProvider>
    </AuthProvider>
  );
}

export default App;
