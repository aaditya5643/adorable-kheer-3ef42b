import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Phone,
  DollarSign
} from 'lucide-react';

export default function ParentDashboard() {
  const { user, activeChildId, setActiveChildId } = useAuth();
  const navigate = useNavigate();

  const [childProfile, setChildProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeChildId) {
      loadChildData(activeChildId);
    } else if (user?.children?.length > 0) {
      setActiveChildId(user.children[0].student_id);
    } else {
      setLoading(false);
    }
  }, [activeChildId, user]);

  async function loadChildData(studentId) {
    setLoading(true);
    try {
      const res = await api.getStudentById(studentId);
      if (res.success) {
        setChildProfile(res.student);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePayFee(feeId) {
    try {
      const res = await api.payFee(feeId, { payment_method: 'Parent Online Card Payment' });
      if (res.success) {
        loadChildData(activeChildId);
      }
    } catch (err) {
      alert('Payment processing failed');
    }
  }

  const att = childProfile?.attendance_summary;
  const totalDays = att?.total_days || 0;
  const presentCount = (att?.present_count || 0) + (att?.late_count || 0) * 0.5;
  const attRate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 95;

  return (
    <div>
      {/* Parent Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #78350F 0%, #92400E 100%)',
          borderRadius: '16px',
          padding: '2rem 2.5rem',
          color: '#FFFFFF',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 10px 25px -5px rgba(146, 64, 14, 0.3)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FDE68A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Parent & Guardian Portal
          </span>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
            Welcome, {user?.first_name}!
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#FEF3C7', marginTop: '0.5rem', maxWidth: '520px' }}>
            Monitor academic progress, daily classroom attendance, exam marks, and tuition billing for your enrolled children.
          </p>
        </div>

        {/* Multi-Child Selector Chips */}
        {user?.children?.length > 1 && (
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '0.75rem', color: '#FDE68A', fontWeight: 600, marginBottom: '0.35rem' }}>
              Switch Child View:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {user.children.map((ch) => {
                const isSelected = activeChildId === ch.student_id;
                return (
                  <button
                    key={ch.student_id}
                    onClick={() => setActiveChildId(ch.student_id)}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
                      color: isSelected ? '#78350F' : '#FFFFFF',
                      transition: 'all 0.15s'
                    }}
                  >
                    {ch.first_name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading Child Details...</div>
      ) : (
        <div>
          {/* Active Child Overview Card */}
          <div className="card" style={{ marginBottom: '1.75rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={childProfile?.avatar}
                  alt=""
                  style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#F1F5F9', border: '2px solid #E2E8F0' }}
                />
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    {childProfile?.first_name} {childProfile?.last_name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span className="badge badge-student">{childProfile?.class_name}</span>
                    <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: '#64748B' }}>
                      #{childProfile?.admission_number}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => navigate('/parent/attendance')}
                  className="btn btn-secondary btn-sm"
                >
                  <CalendarCheck size={14} />
                  <span>Attendance Log</span>
                </button>
                <button
                  onClick={() => navigate('/parent/grades')}
                  className="btn btn-primary btn-sm"
                >
                  <Award size={14} />
                  <span>View Term Grades</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#ECFDF5' }}>
                <CalendarCheck size={26} color="#10B981" />
              </div>
              <div>
                <div className="stat-val" style={{ color: '#065F46' }}>{attRate}%</div>
                <div className="stat-label">Attendance Record</div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.25rem' }}>
                  {att?.absent_count || 0} absences logged
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#EEF2FF' }}>
                <Award size={26} color="#4F46E5" />
              </div>
              <div>
                <div className="stat-val" style={{ color: '#4338CA' }}>A (3.85 GPA)</div>
                <div className="stat-label">Academic Standing</div>
                <div style={{ fontSize: '0.6875rem', color: '#10B981', fontWeight: 600, marginTop: '0.25rem' }}>
                  Distinction Honor Roll
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF3C7' }}>
                <CreditCard size={26} color="#D97706" />
              </div>
              <div>
                <div className="stat-val" style={{ color: '#92400E' }}>
                  {childProfile?.fees?.filter((f) => f.status === 'unpaid').length === 0 ? 'All Settled' : 'Action Needed'}
                </div>
                <div className="stat-label">Tuition Status</div>
              </div>
            </div>
          </div>

          {/* Invoices & Fee Payment Box */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <CreditCard size={18} color="#D97706" />
                  <span>School Invoices & Fees</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {childProfile?.fees?.map((fee) => {
                  const isPaid = fee.status === 'paid';
                  return (
                    <div
                      key={fee.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.875rem 1rem',
                        borderRadius: '10px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F172A' }}>{fee.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          Due Date: {fee.due_date}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                          ${fee.amount.toFixed(2)}
                        </span>
                        {isPaid ? (
                          <span className="badge" style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>
                            Settled
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePayFee(fee.id)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#10B981', borderColor: '#34D399' }}
                          >
                            Pay Online
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Grades Breakdown */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Award size={18} color="#4F46E5" />
                  <span>Term 1 Mid-Term Grades</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {childProfile?.grades?.map((g) => (
                  <div
                    key={g.grade_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.875rem',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>{g.subject_name}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>{g.comments}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{g.marks_obtained}/100</span>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          background: g.grade_letter.includes('A') ? '#DCFCE7' : '#EEF2FF',
                          color: g.grade_letter.includes('A') ? '#166534' : '#3730A3'
                        }}
                      >
                        {g.grade_letter}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
