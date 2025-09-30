import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./Services/Auth/AuthContext";
import ProtectedRoute from "./Services/Auth/ProtectedRoute";
import Login from "./Services/Auth/Login";
import Dashboard from "./Services/Auth/Dashboard";
import ForgotPassword from "./Services/Auth/ForgotPassword";
import VerifyOtp from "./Services/Auth/VerifyOtp";
import ResetPassword from "./Services/Auth/ResetPassword";
import Register from "./Services/Auth/Register";
import LoadingOverlay from "./components/LoadingOverlay";
import TermsAndConditions from "./pages/TermsAndConditions";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Material from "./pages/Material";

// Wrapper with initial loader
const AppContent: React.FC = () => {
  const { isLoading } = useAuth();
  const [showInitialLoader, setShowInitialLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowInitialLoader(false), 1500); // 1.5s delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {(showInitialLoader || isLoading) && <LoadingOverlay />}
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Material Page */}
          <Route
            path="/material"
            element={
              <ProtectedRoute>
                <Material />
              </ProtectedRoute>
            }
          />
          {/* Other Pages */}
          <Route
            path="/terms-and-conditions"
            element={
              <ProtectedRoute>
                <TermsAndConditions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact-us"
            element={
              <ProtectedRoute>
                <ContactUs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <ProtectedRoute>
                <PrivacyPolicy />
              </ProtectedRoute>
            }
          />
          {/* Password Reset Flow */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
