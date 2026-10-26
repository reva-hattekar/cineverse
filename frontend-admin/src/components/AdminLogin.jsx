import React, { useState } from 'react';
import { api } from '../services/api';
import { Lock, Mail, ShieldAlert, Film, ShieldCheck, Sparkles } from 'lucide-react';

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
      backgroundColor: '#050508',
      backgroundImage: `
        radial-gradient(circle at 50% 15%, rgba(69, 10, 20, 0.45) 0%, transparent 60%),
        radial-gradient(circle at 10% 80%, rgba(18, 18, 26, 0.6) 0%, transparent 65%)
      `,
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#12121a',
        backgroundImage: 'radial-gradient(ellipse at top right, rgba(69, 10, 20, 0.3) 0%, transparent 70%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(69, 10, 20, 0.25)'
      }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.22) 0%, rgba(69, 10, 20, 0.45) 100%)',
            border: '1px solid rgba(225, 29, 72, 0.4)',
            marginBottom: '16px',
            boxShadow: '0 4px 16px rgba(225, 29, 72, 0.3)'
          }}>
            <Film size={28} color="#e11d48" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.6rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: '#ffffff',
            margin: '0 0 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            CINEVERSE
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e11d48', display: 'inline-block' }} />
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            Cinema Operations & Ticketing Control
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(225, 29, 72, 0.12)',
            border: '1px solid rgba(225, 29, 72, 0.3)',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '22px',
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1' }}>
              <Mail size={13} color="#fb7185" /> Staff Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cinema.com"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1' }}>
              <Lock size={13} color="#fb7185" /> Security Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', padding: '12px', fontSize: '0.9rem' }}
          >
            {loading ? 'Authenticating Credentials...' : 'Authenticate & Enter Control Room →'}
          </button>
        </form>

        {/* Demo Fast Logins for Testing */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{
            fontSize: '0.7rem',
            color: '#64748b',
            textTransform: 'uppercase',
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            Preloaded Operator Profiles
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setRoleCredentials('admin@cinema.com')}
              style={{ fontSize: '0.74rem', padding: '7px 4px' }}
            >
              Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setRoleCredentials('priya.nair@cinema.com')}
              style={{ fontSize: '0.74rem', padding: '7px 4px' }}
            >
              Manager
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setRoleCredentials('rahul.verma@cinema.com')}
              style={{ fontSize: '0.74rem', padding: '7px 4px' }}
            >
              Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
