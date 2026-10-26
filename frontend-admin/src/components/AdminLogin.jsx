import React, { useState } from 'react';
import { api } from '../services/api';
import { Lock, Mail, ShieldAlert, Film, ShieldCheck } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess, returnPath = '/overview' }) {
  const [email, setEmail] = useState('admin@cinema.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login(email, password);
      if (res.success) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid staff credentials');
    } finally {
      setLoading(false);
    }
  };

  const setRoleCredentials = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('Admin@123');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0b0d13',
      backgroundImage: 'radial-gradient(circle at 50% 20%, #151a26 0%, #0b0d13 70%)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#121622',
        border: '1px solid #1f2736',
        borderRadius: '12px',
        padding: '36px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            marginBottom: '14px'
          }}>
            <Film size={26} color="#f59e0b" />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '1px', color: '#f1f5f9' }}>
            CINEVERSE
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
            Cinema Operations & Ticketing Management
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '6px',
            padding: '12px 14px',
            marginBottom: '20px',
            color: '#fda4af',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Mail size={13} color="#94a3b8" /> Staff Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cinema.com"
              style={{ backgroundColor: '#0e121a', borderColor: '#1f2736' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Lock size={13} color="#94a3b8" /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ backgroundColor: '#0e121a', borderColor: '#1f2736' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', padding: '11px', fontWeight: 700 }}
          >
            {loading ? 'Authenticating Credentials...' : 'Authenticate & Enter Portal'}
          </button>
        </form>

        {/* Demo Fast Logins for Testing */}
        <div style={{ marginTop: '26px', paddingTop: '18px', borderTop: '1px solid #1f2736' }}>
          <div style={{
            fontSize: '0.72rem',
            color: '#64748b',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.5px',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            Quick Login Credentials
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setRoleCredentials('admin@cinema.com')}
              style={{ fontSize: '0.72rem', padding: '6px 4px' }}
            >
              Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setRoleCredentials('priya.nair@cinema.com')}
              style={{ fontSize: '0.72rem', padding: '6px 4px' }}
            >
              Manager
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setRoleCredentials('rahul.verma@cinema.com')}
              style={{ fontSize: '0.72rem', padding: '6px 4px' }}
            >
              Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
