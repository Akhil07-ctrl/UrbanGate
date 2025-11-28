import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationCenter } from './components/NotificationCenter';
import { Layout } from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { Welcome } from './pages/Welcome';
import { FeaturesPage } from './pages/FeaturesPage';
import { BenefitsPage } from './pages/BenefitsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { Login, Register } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Communities } from './pages/Communities';
import { CommunityManagement } from './pages/CommunityManagement';
import { Complaints } from './pages/Complaints';
import { Announcements } from './pages/Announcements';
import { VisitorPass } from './pages/VisitorPass';
import { Parking } from './pages/Parking';
import { Facilities } from './pages/Facilities';
import { Payments } from './pages/Payments';
import { Polls } from './pages/Polls';

import './index.css';

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-text"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Welcome />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/benefits" element={<BenefitsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          user ? (
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/complaints"
        element={
          <ProtectedRoute>
            <Layout>
              <Complaints />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/communities"
        element={
          <ProtectedRoute>
            <Layout>
              <Communities />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/community-management"
        element={
          <ProtectedRoute>
            <Layout>
              <CommunityManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <Layout>
              <Announcements />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/visitor-pass"
        element={
          <ProtectedRoute>
            <Layout>
              <VisitorPass />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/parking"
        element={
          <ProtectedRoute>
            <Layout>
              <Parking />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/facilities"
        element={
          <ProtectedRoute>
            <Layout>
              <Facilities />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Layout>
              <Payments />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/polls"
        element={
          <ProtectedRoute>
            <Layout>
              <Polls />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <SocketProvider>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
              <NotificationCenter />
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </SocketProvider>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
