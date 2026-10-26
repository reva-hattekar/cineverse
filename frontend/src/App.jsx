import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import CustomerPortal from './components/customer/CustomerPortal';
import { api } from './services/api';

export default function App() {
  const [mode, setMode] = useState('admin'); // Primary interface is Admin Dashboard
  const [adminUser, setAdminUser] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    // Check stored admin session
    const stored = api.getStoredAdminUser();
    if (stored) {
      setAdminUser(stored);
    }

    // Health check ping
    checkSystem();
    const interval = setInterval(checkSystem, 15000);
    return () => clearInterval(interval);
  }, []);

  const checkSystem = async () => {
    try {
      const res = await api.checkHealth();
      setSystemStatus(res);
    } catch (err) {
      setSystemStatus({ database: { connected: false, message: 'Backend unreachable' } });
    }
  };

  const handleAdminLoginSuccess = (user) => {
    setAdminUser(user);
  };

  const handleAdminLogout = () => {
    api.adminLogout();
    setAdminUser(null);
  };

  return (
    <div>
      <Navbar
        mode={mode}
        setMode={setMode}
        systemStatus={systemStatus}
        adminUser={adminUser}
        onLogout={handleAdminLogout}
      />

      {mode === 'admin' ? (
        adminUser ? (
          <AdminDashboard adminUser={adminUser} />
        ) : (
          <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
        )
      ) : (
        <CustomerPortal />
      )}
    </div>
  );
}

