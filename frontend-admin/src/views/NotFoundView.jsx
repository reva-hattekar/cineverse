import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function NotFoundView() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '12px',
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <AlertCircle size={32} color="#f59e0b" />
      </div>

      <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>
        Route Not Found
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', marginBottom: '24px' }}>
        The requested cinema administrative section does not exist or has been relocated.
      </p>

      <Link to="/overview" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <LayoutDashboard size={16} />
        <span>Return to Operations Overview</span>
      </Link>
    </div>
  );
}

