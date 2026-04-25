import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Store from './components/Store';
import POS from './components/POS';
import Login from './components/Login';
import Register from './components/Register';
import AdminInventory from './components/AdminInventory';
import AdminDashboard from './components/AdminDashboard';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="pos" element={<POS />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
