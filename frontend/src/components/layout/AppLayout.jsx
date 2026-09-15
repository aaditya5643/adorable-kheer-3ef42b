import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PersonaSwitcher from './PersonaSwitcher';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: '#F8FAFC' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748B', fontWeight: 500 }}>Loading School Management System...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // If unauthenticated and not on /login, redirect to /login
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <PersonaSwitcher />
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="page-wrapper">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
