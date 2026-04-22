import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/Users';
import WhatsAppConnect from './pages/admin/WhatsAppConnect';
import AdminProfile from './pages/admin/AdminProfile';
import UserScannedContacts from './pages/admin/UserScannedContacts';

import UserDashboard from './pages/user/UserDashboard';
import ScannedContacts from './pages/user/ScannedContacts';
import UserProfile from './pages/user/UserProfile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UsersManagement />} />
              <Route path="/admin/whatsapp" element={<WhatsAppConnect />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/users/:id/scanned" element={<UserScannedContacts />} />
            </Route>

            {/* User Routes */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/user" element={<UserDashboard />} />
              <Route path="/user/scanned" element={<ScannedContacts />} />
              <Route path="/user/profile" element={<UserProfile />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
