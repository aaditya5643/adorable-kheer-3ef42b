import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  GraduationCap,
  CalendarCheck,
  Award,
  BookOpen,
  Bell,
  Clock,
  Printer,
  TrendingUp,
  CreditCard
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const studentId = user?.student_id || user?.student?.id;
        if (studentId) {
          const res = await api.getStudentById(studentId);
          if (res.success) {
            setStudentDetails(res.student);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const attSummary = studentDetails?.attendance_summary;
  const totalDays = attSummary?.total_days || 0;
  const presentCount = (attSummary?.present_count || 0) + (attSummary?.late_count || 0) * 0.5;
  const attRate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 95;

  return (
    <div>
      {/* Student Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
          borderRadius: '16px',
          padding: '2rem 2.5rem',
          color: '#FFFFFF',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 10px 25px -5px rgba(6, 95, 70, 0.3)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Student Portal • {user?.class_name || 'Grade 10-A'}
          </span>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
            Welcome, {user?.first_name}!
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#D1FAE5', marginTop: '0.5rem', maxWidth: '520px' }}>
            Enrolled in <strong>{user?.class_name || 'Grade 10-A'}</strong> (Adm #{user?.admission_number || 'SMS-2026-0101'}). Check your attendance progress, subject grades, and term report card.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/student/grades')}
            className="btn btn-primary"
            style={{ backgroundColor: '#10B981', borderColor: '#34D399', color: '#064E3B', fontWeight: 700 }}
            id="student-view-report-card-btn"
          >
            <Award size={16} />
            <span>View Official Report Card</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ECFDF5' }}>
            <CalendarCheck size={26} color="#10B981" />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#065F46' }}>{attRate}%</div>
            <div className="stat-label">Attendance Rate</div>
            <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.25rem' }}>
              {attSummary?.absent_count || 0} absences in {totalDays} sessions
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#EEF2FF' }}>
            <Award size={26} color="#4F46E5" />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#4338CA' }}>3.85</div>
            <div className="stat-label">Term GPA (Mid-Term)</div>
            <div style={{ fontSize: '0.6875rem', color: '#10B981', fontWeight: 600, marginTop: '0.25rem' }}>
              Honor Roll Standing
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#F5F3FF' }}>
            <BookOpen size={26} color="#8B5CF6" />
          </div>
          <div>
            <div className="stat-val">{studentDetails?.subjects?.length || 4}</div>
            <div className="stat-label">Enrolled Subjects</div>
            <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.25rem' }}>
              Term 1 Academic Load
            </div>
          </div>
        </div>
      </div>

      {/* Subject Grades & Schedule */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Grades */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Award size={18} color="#4F46E5" />
              <span>Mid-Term Subject Scores</span>
            </div>
            <button
              onClick={() => navigate('/student/grades')}
              className="btn btn-secondary btn-sm"
            >
              Full Report Card
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {studentDetails?.grades?.map((g) => (
              <div
                key={g.grade_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F172A' }}>{g.subject_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{g.comments}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#0F172A' }}>
                    {g.marks_obtained}/100
                  </span>
                  <span
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: 800,
                      backgroundColor: g.grade_letter.includes('A') ? '#DCFCE7' : '#EFF6FF',
                      color: g.grade_letter.includes('A') ? '#15803D' : '#3730A3'
                    }}
                  >
                    {g.grade_letter}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enrolled Subjects & Teachers */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BookOpen size={18} color="#06B6D4" />
              <span>Class Curriculum</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {studentDetails?.subjects?.map((sub) => (
              <div
                key={sub.id}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.875rem' }}>{sub.name}</span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#6366F1', fontWeight: 600 }}>
                    {sub.code}
                  </span>
                </div>
                {sub.teacher_first && (
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
                    Instructor: {sub.teacher_first} {sub.teacher_last}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
