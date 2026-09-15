import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Users,
  GraduationCap,
  School,
  CalendarCheck,
  TrendingUp,
  Award,
  Bell,
  ArrowUpRight,
  UserPlus,
  BookPlus
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.getAdminOverview();
        if (res.success) {
          setData(res.overview);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading School Analytics...</div>;
  }

  const stats = [
    {
      label: 'Enrolled Students',
      value: data?.total_students || 0,
      icon: GraduationCap,
      color: '#4F46E5',
      bg: '#EEF2FF',
      sub: 'Active Academic Year 2026-27'
    },
    {
      label: 'Teaching Faculty',
      value: data?.total_teachers || 0,
      icon: Users,
      color: '#06B6D4',
      bg: '#ECFEFF',
      sub: '4 Academic Departments'
    },
    {
      label: 'Classes & Sections',
      value: data?.total_classes || 0,
      icon: School,
      color: '#8B5CF6',
      bg: '#F5F3FF',
      sub: 'Grades 9 & 10 Active'
    },
    {
      label: 'Avg Attendance Rate',
      value: `${data?.attendance_rate || 94}%`,
      icon: CalendarCheck,
      color: '#10B981',
      bg: '#ECFDF5',
      sub: 'Past 14 School Days'
    }
  ];

  return (
    <div>
      {/* Top Banner & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A' }}>Executive Dashboard</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Central administrative overview of student enrollment, faculty metrics, and school operations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/admin/students')}
            className="btn btn-primary"
            id="admin-quick-enroll-btn"
          >
            <UserPlus size={16} />
            <span>Enroll Student</span>
          </button>
          <button
            onClick={() => navigate('/admin/announcements')}
            className="btn btn-secondary"
            id="admin-quick-notice-btn"
          >
            <Bell size={16} />
            <span>Post Notice</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: s.bg }}>
                <Icon size={26} color={s.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="stat-val">{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.25rem' }}>{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics & Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Subject Performance & Averages */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Award size={18} color="#4F46E5" />
              <span>Subject Performance Averages</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Term 1 Midterms</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {data?.subject_performance?.map((sub, i) => {
              const score = sub.average_score || 75;
              const color = score >= 85 ? '#10B981' : (score >= 75 ? '#6366F1' : '#F59E0B');
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{sub.subject_name}</span>
                    <span style={{ fontWeight: 700, color }}>{score}%</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${score}%`,
                        backgroundColor: color,
                        borderRadius: '9999px',
                        transition: 'width 0.6s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade Distribution & Performance */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={18} color="#10B981" />
              <span>Grade Distribution</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Overall Cohort</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.grade_distribution?.map((g, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: g.grade_letter.includes('A') ? '#DCFCE7' : '#EFF6FF',
                      color: g.grade_letter.includes('A') ? '#166534' : '#1E40AF',
                      fontWeight: 700,
                      fontSize: '0.8125rem'
                    }}
                  >
                    {g.grade_letter}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>
                    {g.grade_letter === 'A+' ? 'Outstanding Mastery' : (g.grade_letter === 'A' ? 'Superior Performance' : 'Proficient Competency')}
                  </span>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                  {g.count} assessments
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Enrollment by Class + Recent School Announcements */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
        {/* Class Enrollment Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <School size={18} color="#8B5CF6" />
              <span>Class Roster Capacities</span>
            </div>
            <button
              onClick={() => navigate('/admin/classes')}
              className="btn btn-secondary btn-sm"
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {data?.enrollment_by_grade?.map((c, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{c.class_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Grade {c.grade_level} Stream</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#4F46E5' }}>
                    {c.student_count} Students
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#10B981', fontWeight: 600 }}>Active Roster</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Bell size={18} color="#EC4899" />
              <span>Recent Announcements</span>
            </div>
            <button
              onClick={() => navigate('/admin/announcements')}
              className="btn btn-secondary btn-sm"
            >
              Manage
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.recent_announcements?.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{a.title}</span>
                  <span className="badge badge-admin" style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem' }}>
                    {a.target_role}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Posted by {a.first_name} {a.last_name} • {new Date(a.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
