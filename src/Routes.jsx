import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import { useAuth } from "./contexts/AuthContext";
import NotFound from "pages/NotFound";
import PitchUploadDashboard from './pages/pitch-upload-dashboard';
import ComprehensiveResults from './pages/comprehensive-results';
import AssessmentProcessing from './pages/assessment-processing';
import PitchVersionTracker from './pages/pitch-version-tracker';
import AnalyticsDashboard from './pages/analytics-dashboard';
import PitchTemplateLibrary from './pages/pitch-template-library';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Profile from './pages/auth/Profile';
import Settings from './pages/auth/Settings';
import SavedPitches from "pages/saved-pitches";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<Navigate to="/pitch-upload-dashboard" replace />} />
        <Route path="/pitch-upload-dashboard" element={<ProtectedRoute><PitchUploadDashboard /></ProtectedRoute>} />
        <Route path="/comprehensive-results" element={<ProtectedRoute><ComprehensiveResults /></ProtectedRoute>} />
        <Route path="/assessment-processing" element={<ProtectedRoute><AssessmentProcessing /></ProtectedRoute>} />
        <Route path="/pitch-version-tracker" element={<ProtectedRoute><PitchVersionTracker /></ProtectedRoute>} />
        <Route path="/analytics-dashboard" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/pitch-template-library" element={<ProtectedRoute><PitchTemplateLibrary /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/saved-pitches" element={<ProtectedRoute><SavedPitches /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
