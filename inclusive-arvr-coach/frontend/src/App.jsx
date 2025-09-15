// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import WellyouAssistant from "./components/WellyouAssistant.jsx";
import Landing from "./pages/Landing.jsx";
import Auth from "./pages/Auth.jsx";
import GetStarted from "./pages/GetStarted.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import UploadPage from "./pages/Upload.jsx";
import UserMetricsProfile from "./pages/UserMetricsProfile.jsx";
import FitConnected from "./pages/FitConnected.jsx";
import { getUser } from "./lib/userStore.js";
import "./App.css";

// Protected route wrapper
function Protected({ children }) {
  const user = getUser();
  const loc = useLocation();
  if (!user) return <Navigate to="/auth" state={{ from: loc }} replace />;
  return children;
}

// NeedsCategory wrapper
function NeedsCategory({ children }) {
  // Category gating disabled to streamline onboarding without disability selection
  return children;
}

export default function App() {
  console.log('App component rendering');
  const loc = useLocation();
  const user = getUser();
  console.log('Current location:', loc.pathname);
  console.log('User:', user);

  // Only show navbar on certain pages
  const hideNav = loc.pathname === "/" || loc.pathname === "/auth";

  return (
    <div className="app" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {!hideNav && <NavBar />}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/fit-connected" element={<FitConnected />} />
        
        <Route
          path="/get-started"
          element={
            <Protected>
              <GetStarted />
            </Protected>
          }
        />

        <Route
          path="/dashboard"
          element={
            <Protected>
              <NeedsCategory>
                <Dashboard />
              </NeedsCategory>
            </Protected>
          }
        />

        <Route
          path="/upload"
          element={
            <Protected>
              <NeedsCategory>
                <UploadPage />
              </NeedsCategory>
            </Protected>
          }
        />

        <Route
          path="/metrics-profile"
          element={
            <Protected>
              <NeedsCategory>
                <UserMetricsProfile />
              </NeedsCategory>
            </Protected>
          }
        />

        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      {!hideNav && <WellyouAssistant />}
    </div>
  );
}
