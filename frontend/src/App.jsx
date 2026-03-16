import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Attendance = lazy(() => import('./pages/Attendance'));
const QRManager = lazy(() => import('./pages/QRManager'));
const Settings = lazy(() => import('./pages/Settings'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B8A09A] mx-auto" />
        <p className="mt-3 text-sm text-gray-500">Loading page...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
          <Route path="/dashboard" element={<Navigate to="/dashboard/today" replace />} />
          <Route path="/dashboard/:viewMode" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/attendance" element={<Navigate to="/attendance/today" replace />} />
          <Route path="/attendance/:viewMode" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/qr-manager" element={<ProtectedRoute><QRManager /></ProtectedRoute>} />
          <Route path="/settings" element={<Navigate to="/settings/system" replace />} />
          <Route path="/settings/:tabId" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
