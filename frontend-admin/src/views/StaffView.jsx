import React from 'react';
import { ShieldCheck, UserCheck, Building } from 'lucide-react';

export default function StaffView({ staff = [] }) {
  return (
    <div>
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Cinema Operations Staff & RBAC</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Role-Based Access Control and venue assignments (ADMIN_STAFF)</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Employee Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Assigned Role</th>
                <th>Venue Location</th>
                <th>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.staff_id}>
                  <td><strong>STAFF-#{s.staff_id}</strong></td>
                  <td><strong>{s.staff_name}</strong></td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>
                    <span className={`badge ${s.role === 'Admin' ? 'badge-danger' : s.role === 'Manager' ? 'badge-warning' : 'badge-info'}`}>
                      {s.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building size={14} color="#64748b" />
                      <span>{s.theater_name} ({s.city})</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {s.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

