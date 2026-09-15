import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CalendarCheck, CheckCircle, Clock, XCircle, HelpCircle } from 'lucide-react';

export default function StudentAttendance() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const studentId = user?.student_id || user?.student?.id;
        const res = await api.getStudentAttendance(studentId);
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, [user]);

  const stats = data?.stats;
  const history = data?.history || [];

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>My Attendance Record</h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
          Detailed record of daily school attendance, punctuality, and absence history.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ECFDF5' }}>
            <CalendarCheck size={26} color="#10B981" />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#065F46' }}>
              {stats?.attendance_percentage || 95}%
            </div>
            <div className="stat-label">Overall Attendance</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#EEF2FF' }}>
            <CheckCircle size={26} color="#4F46E5" />
          </div>
          <div>
            <div className="stat-val">{stats?.present_count || 0}</div>
            <div className="stat-label">Days Present</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FFFBEB' }}>
            <Clock size={26} color="#F59E0B" />
          </div>
          <div>
            <div className="stat-val">{stats?.late_count || 0}</div>
            <div className="stat-label">Late Arrivals</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF2F2' }}>
            <XCircle size={26} color="#EF4444" />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#991B1B' }}>
              {stats?.absent_count || 0}
            </div>
            <div className="stat-label">Days Absent</div>
          </div>
        </div>
      </div>

      {/* Daily Logs Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Class</th>
              <th>Status</th>
              <th>Remarks / Note</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                  Loading attendance records...
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                  No attendance history available.
                </td>
              </tr>
            ) : (
              history.map((h) => {
                const statusStyles = {
                  present: { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0', label: 'Present' },
                  late: { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', label: 'Late' },
                  absent: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', label: 'Absent' },
                  excused: { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE', label: 'Excused' }
                };
                const s = statusStyles[h.status] || statusStyles.present;

                return (
                  <tr key={h.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>
                        {new Date(h.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </td>
                    <td>{h.class_name}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: s.bg,
                          color: s.color,
                          border: `1px solid ${s.border}`
                        }}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: h.remarks ? '#334155' : '#94A3B8', fontSize: '0.8125rem' }}>
                        {h.remarks || 'Standard entry'}
                      </span>
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
