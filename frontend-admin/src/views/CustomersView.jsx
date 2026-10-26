import React from 'react';
import { Users, Award, Shield } from 'lucide-react';

export default function CustomersView({ customers = [] }) {
  return (
    <div>
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Customer Accounts & Loyalty Memberships</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              Relational demonstration of CUSTOMER (1:0..1) ACCOUNT and CUSTOMER (1:0..1) LOYALTY_ACCOUNT
            </p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Auth Account</th>
                <th>Loyalty Tier</th>
                <th>Points Balance</th>
                <th>Lifetime Bookings</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => {
                const isVip = c.membership_level === 'Platinum' || c.membership_level === 'Gold';
                return (
                  <tr key={c.customer_id}>
                    <td><strong>#{c.customer_id}</strong></td>
                    <td><strong>{c.customer_name}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>
                      <span className={`badge ${c.account_id ? 'badge-success' : 'badge-danger'}`}>
                        {c.account_id ? 'Verified Portal User' : 'Guest (No Auth)'}
                      </span>
                    </td>
                    <td>
                      {c.membership_level ? (
                        <span className={`badge ${isVip ? 'badge-purple' : 'badge-info'}`} style={{ gap: '4px' }}>
                          <Award size={12} /> {c.membership_level}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Standard (0 Tier)</span>
                      )}
                    </td>
                    <td>{c.total_points !== null ? `${c.total_points} pts` : '-'}</td>
                    <td><strong>{c.total_bookings_count}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

