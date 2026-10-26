import React, { useState } from 'react';
import { api } from '../../services/api';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@cinema.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.adminLogin(email, password);
      if (res.success) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('Admin@123');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      padding: '20px'
    }}>
      <div className="modal-card" style={{ maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔐</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Admin Staff Portal</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '4px' }}>
            Movie Theater Ticket Engine Management Console
          </p>
        </div>

        {error && (
          <div className="notification-banner error">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Staff Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@cinema.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '14px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
          border: '1px dashed #2e3a52',
          fontSize: '0.8rem'
        }}>
          <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>
            🎯 College Evaluation Demo Credentials:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => fillDemo('admin@cinema.com')}
            >
              👑 Admin: admin@cinema.com / Admin@123
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => fillDemo('manager1@cinema.com')}
            >
              💼 Manager: manager1@cinema.com / Admin@123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

