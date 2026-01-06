import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Landing Page
import LandingPage from './pages/LandingPage';

// Donor Pages
import DonorHomePage from './pages/donor/DonorHomePage';
import DonorLoginPage from './pages/donor/DonorLoginPage';
import DonorAuthPage from './pages/donor/DonorAuthPage';
import DonorRegisterPage from './pages/donor/DonorRegisterPage';
import DonorDashboardPage from './pages/donor/DonorDashboardPage';
import DonorRequestDetailsPage from './pages/donor/DonorRequestDetailsPage';
import DonorHealthChecklistPage from './pages/donor/DonorHealthChecklistPage';
import DonorProofUploadPage from './pages/donor/DonorProofUploadPage';
import DonorCertificatePage from './pages/donor/DonorCertificatePage';
import DonorHistoryPage from './pages/donor/DonorHistoryPage';
import DonorProfilePage from './pages/donor/DonorProfilePage';

// Needy Pages
import NeedyHomePage from './pages/needy/NeedyHomePage';
import NeedyLoginPage from './pages/needy/NeedyLoginPage';
import NeedyRegisterPage from './pages/needy/NeedyRegisterPage';
import NeedyDashboardPage from './pages/needy/NeedyDashboardPage';
import NeedyProfilePage from './pages/needy/NeedyProfilePage';
import NeedyHistoryPage from './pages/needy/NeedyHistoryPage';
import NeedyRequestCreatePage from './pages/needy/NeedyRequestCreatePage';
import NeedyRequestStatusPage from './pages/needy/NeedyRequestStatusPage';
import NeedyFeedbackPage from './pages/needy/NeedyFeedbackPage';
import NeedyRequestCompletePage from './pages/needy/NeedyRequestCompletePage';

// Admin Pages
import AdminHomePage from './pages/admin/AdminHomePage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminDonorsPage from './pages/admin/AdminDonorsPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminFeedbackAlertsPage from './pages/admin/AdminFeedbackAlertsPage';
import AdminCertificatesPage from './pages/admin/AdminCertificatesPage';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import DonorRoute from './components/DonorRoute';
import NeedyRoute from './components/NeedyRoute';
import AdminRoute from './components/AdminRoute';

// Test Pages
import TestAuthFlow from './pages/TestAuthFlow';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Test Route */}
              <Route path="/test-auth" element={<TestAuthFlow />} />
              
              {/* Donor Routes */}
              <Route path="/donor" element={<DonorHomePage />} />
              <Route path="/donor/auth" element={<DonorAuthPage />} />
              <Route path="/donor/login" element={<DonorLoginPage />} />
              <Route path="/donor/register" element={
                <ProtectedRoute>
                  <DonorRegisterPage />
                </ProtectedRoute>
              } />
              <Route path="/donor/dashboard" element={
                <DonorRoute>
                  <DonorDashboardPage />
                </DonorRoute>
              } />
              <Route path="/donor/request/:id" element={
                <DonorRoute>
                  <DonorRequestDetailsPage />
                </DonorRoute>
              } />
              <Route path="/donor/health-checklist" element={
                <DonorRoute>
                  <DonorHealthChecklistPage />
                </DonorRoute>
              } />
              <Route path="/donor/proof-upload/:requestId" element={
                <DonorRoute>
                  <DonorProofUploadPage />
                </DonorRoute>
              } />
              <Route path="/donor/certificate/:id" element={
                <DonorRoute>
                  <DonorCertificatePage />
                </DonorRoute>
              } />
              <Route path="/donor/history" element={
                <DonorRoute>
                  <DonorHistoryPage />
                </DonorRoute>
              } />
              <Route path="/donor/profile" element={
                <DonorRoute>
                  <DonorProfilePage />
                </DonorRoute>
              } />

              {/* Needy Routes */}
              <Route path="/needy" element={<NeedyHomePage />} />
              <Route path="/needy/login" element={<NeedyLoginPage />} />
              <Route path="/needy/register" element={
                <ProtectedRoute>
                  <NeedyRegisterPage />
                </ProtectedRoute>
              } />
              <Route path="/needy/dashboard" element={
                <NeedyRoute>
                  <NeedyDashboardPage />
                </NeedyRoute>
              } />
              <Route path="/needy/profile" element={
                <NeedyRoute>
                  <NeedyProfilePage />
                </NeedyRoute>
              } />
              <Route path="/needy/history" element={
                <NeedyRoute>
                  <NeedyHistoryPage />
                </NeedyRoute>
              } />
              <Route path="/needy/request/create" element={
                <NeedyRoute>
                  <NeedyRequestCreatePage />
                </NeedyRoute>
              } />
              <Route path="/needy/request/status/:id" element={
                <NeedyRoute>
                  <NeedyRequestStatusPage />
                </NeedyRoute>
              } />
              <Route path="/needy/feedback/:requestId" element={
                <NeedyRoute>
                  <NeedyFeedbackPage />
                </NeedyRoute>
              } />
              <Route path="/needy/request/complete" element={
                <NeedyRoute>
                  <NeedyRequestCompletePage />
                </NeedyRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminHomePage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/register" element={<AdminRegisterPage />} />
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              } />
              <Route path="/admin/donors" element={
                <AdminRoute>
                  <AdminDonorsPage />
                </AdminRoute>
              } />
              <Route path="/admin/requests" element={
                <AdminRoute>
                  <AdminRequestsPage />
                </AdminRoute>
              } />
              <Route path="/admin/feedback-alerts" element={
                <AdminRoute>
                  <AdminFeedbackAlertsPage />
                </AdminRoute>
              } />
              <Route path="/admin/certificates" element={
                <AdminRoute>
                  <AdminCertificatesPage />
                </AdminRoute>
              } />
            </Routes>
          </div>
        </Router>
    </AuthProvider>
  );
}

export default App;