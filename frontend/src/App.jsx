import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ZohoProxyView from './pages/ZohoProxyView';
import AdminUsers from './pages/AdminUsers';
import AdminRoles from './pages/AdminRoles';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminZohoConfig from './pages/AdminZohoConfig';
import Unauthorized from './pages/Unauthorized';

// Shared Layout with Navbar, Sidebar, and Content Container
function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        <Sidebar />
        <section className="flex-1 min-w-0">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />

            {/* Role-Protected Zoho Application Data Proxies */}
            <Route 
              path="/zoho/people" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'HR', 'Manager']}>
                  <ZohoProxyView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/zoho/crm" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Sales', 'Manager']}>
                  <ZohoProxyView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/zoho/desk" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Support']}>
                  <ZohoProxyView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/zoho/books" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Finance']}>
                  <ZohoProxyView />
                </ProtectedRoute>
              } 
            />

            {/* Admin-Only Management Routes */}
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/roles" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminRoles />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/audit-logs" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminAuditLogs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/zoho-config" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminZohoConfig />
                </ProtectedRoute>
              } 
            />

            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
