import React from 'react';
import { Popcorn, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SnacksView({ snacks = [] }) {
  return (
    <div>
      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Concessions & F&B Inventory</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Stock levels, pricing, and concession replenishment tracking</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Snack Name</th>
                <th>Retail Price</th>
                <th>Inventory Stock</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {snacks.map(s => {
                const isLow = s.stock_quantity < 100;
                return (
                  <tr key={s.snack_id}>
                    <td><strong>#{s.snack_id}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Popcorn size={16} color="#f59e0b" />
                        <strong>{s.snack_name}</strong>
                      </div>
                    </td>
                    <td><strong style={{ color: '#10b981' }}>₹{parseFloat(s.price).toFixed(2)}</strong></td>
                    <td>{s.stock_quantity} units</td>
                    <td>
                      <span className={`badge ${isLow ? 'badge-warning' : 'badge-success'}`} style={{ gap: '4px' }}>
                        {isLow ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                        {isLow ? 'Low Stock' : 'Optimal'}
                      </span>
                    </td>
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

