import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingsPage from './pages/BookingsPage';
import CalendarPage from './pages/CalendarPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/bookings" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/not-found" element={<h1>Page Not Found</h1>} />
            <Route path="/bookings" element={
              <ProtectedRoute><BookingsPage /></ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute><CalendarPage /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}
