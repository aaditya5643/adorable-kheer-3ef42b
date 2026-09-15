import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { CreditCard, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function FeeManagement() {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFees();
  }, []);

  async function loadFees() {
    setLoading(true);
    try {
      const res = await api.getAllFees();
      if (res.success) {
        setFees(res.fees);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePay(feeId) {
    try {
      const res = await api.payFee(feeId, { payment_method: 'Cash / Reception Counter' });
      if (res.success) {
        loadFees();
      }
    } catch (err) {
      alert(err.message || 'Payment failed');
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>Fee Billing & Invoices</h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
          Monitor student tuition fees, track collections, and record incoming payments.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#EEF2FF' }}>
            <DollarSign size={26} color="#4F46E5" />
          </div>
          <div>
            <div className="stat-val">${summary?.total_receivable?.toLocaleString() || '0'}</div>
            <div className="stat-label">Total Receivable</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ECFDF5' }}>
            <CheckCircle size={26} color="#10B981" />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#065F46' }}>
              ${summary?.total_collected?.toLocaleString() || '0'}
            </div>
            <div className="stat-label">Total Collected ({summary?.paid_count || 0} Paid)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF2F2' }}>
            <AlertTriangle size={26} color="#EF4444" />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#991B1B' }}>
              {summary?.unpaid_count || 0}
            </div>
            <div className="stat-label">Pending Invoices</div>
          </div>
        </div>
      </div>

      {/* Fee Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Invoice Description</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                  Loading Invoices...
                </td>
              </tr>
            ) : fees.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                  No fee records found.
                </td>
              </tr>
            ) : (
              fees.map((f) => {
                const isPaid = f.status === 'paid';
                return (
                  <tr key={f.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{f.first_name} {f.last_name}</div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B' }}>{f.admission_number}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{f.class_name}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>{f.title}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F172A' }}>
                        ${f.amount.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#475569' }}>{f.due_date}</span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: isPaid ? '#ECFDF5' : '#FEF2F2',
                          color: isPaid ? '#065F46' : '#991B1B',
                          border: `1px solid ${isPaid ? '#A7F3D0' : '#FECACA'}`
                        }}
                      >
                        {isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!isPaid ? (
                        <button
                          onClick={() => handlePay(f.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#059669', borderColor: '#A7F3D0' }}
                        >
                          <CheckCircle size={14} />
                          <span>Record Payment</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                          Settled {f.paid_date ? `(${f.paid_date})` : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
