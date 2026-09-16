import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import "./App.css";

// Layout
import Header from "./Header";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddProperty from "./pages/AddProperty";
import GuestDashboard from "./pages/GuestDashboard";
import HostDashboard from "./pages/HostDashboard";
import AccountPage from "./pages/AccountPage";
import PaymentsPage from "./pages/PaymentsPage";
import CategoryPage from "./pages/CategoryPage";
import PropertyPage from "./pages/PropertyPage";
import ManagePropertyPage from "./pages/ManagePropertyPage";

// Features
import HomesPage from "./features/homes/pages/HomesPage";

function AuthenticatedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function HostRoute({ children }) {
  const { user } = useAuth();
  return user?.role === "HOST" && user?.mode === "HOSTING" ? (
    children
  ) : (
    <Navigate to="/guest/dashboard" replace />
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />

          <Routes>
            {/* Home */}
            <Route path="/" element={<HomesPage />} />

            {/* Guest Dashboard */}
            <Route
              path="/guest/dashboard"
              element={
                <AuthenticatedRoute>
                  <GuestDashboard />
                </AuthenticatedRoute>
              }
            />

            <Route
              path="/bookings"
              element={
                <AuthenticatedRoute>
                  <GuestDashboard />
                </AuthenticatedRoute>
              }
            />

            <Route
              path="/host/dashboard"
              element={
                <HostRoute>
                  <HostDashboard />
                </HostRoute>
              }
            />
            <Route
              path="/host/properties"
              element={
                <HostRoute>
                  <HostDashboard />
                </HostRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <AuthenticatedRoute>
                  <PaymentsPage />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthenticatedRoute>
                  <AccountPage />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthenticatedRoute>
                  <AccountPage settings />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/experiences"
              element={<CategoryPage category="EXPERIENCES" />}
            />
            <Route
              path="/services"
              element={<CategoryPage category="SERVICES" />}
            />
            <Route path="/properties/:id" element={<PropertyPage />} />
            <Route
              path="/host/properties/:id/manage"
              element={
                <HostRoute>
                  <ManagePropertyPage />
                </HostRoute>
              }
            />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            {/* Hosting */}
            <Route path="/add-property" element={<AddProperty />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
