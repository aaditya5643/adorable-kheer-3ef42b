import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  BookOpen,
  CalendarCheck,
  Award,
  Users,
  Clock,
  ArrowRight,
  CheckCircle,
  Bell
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classesData, setClassesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getMyClasses();
        if (res.success) {
          setClassesData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const homeroom = classesData?.class_teacher_of?.[0];

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
          borderRadius: '16px',
          padding: '2rem 2.5rem',
          color: '#FFFFFF',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Faculty Portal • {user?.department || 'Department of Mathematics'}
          </span>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
            Welcome back, {user?.first_name}!
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#E0E7FF', marginTop: '0.5rem', maxWidth: '540px' }}>
            Homeroom Teacher for <strong>{homeroom?.name || 'Grade 10-A'}</strong>. You can record daily attendance, evaluate student exams, and track classroom performance.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/teacher/attendance')}
            className="btn btn-primary"
            style={{ backgroundColor: '#4F46E5', borderColor: '#6366F1' }}
            id="teacher-take-attendance-btn"
          >
            <CalendarCheck size={16} />
            <span>Mark Today's Attendance</span>
          </button>
          <button
            onClick={() => navigate('/teacher/grades')}
            className="btn btn-secondary"
            id="teacher-open-gradebook-btn"
          >
            <Award size={16} />
            <span>Enter Exam Grades</span>
          </button>
        </div>
      </div>

      {/* Homeroom & Teaching Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Homeroom Classroom Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Users size={18} color="#4F46E5" />
              <span>Assigned Homeroom: {homeroom?.name || 'Grade 10-A'}</span>
            </div>
            <span className="badge badge-student">Active Roster</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '10px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
                {homeroom?.student_count || 6}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Students</div>
            </div>
            <div style={{ padding: '1rem', background: '#ECFDF5', borderRadius: '10px', textAlign: 'center', border: '1px solid #A7F3D0' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#065F46' }}>
                {homeroom?.room_number || 'Room 201'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#047857' }}>Location</div>
            </div>
            <div style={{ padding: '1rem', background: '#EEF2FF', borderRadius: '10px', textAlign: 'center', border: '1px solid #C7D2FE' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4338CA' }}>94%</div>
              <div style={{ fontSize: '0.75rem', color: '#4F46E5' }}>Attendance Rate</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/teacher/attendance')}
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
            >
              <CalendarCheck size={14} />
              <span>Open Class Register</span>
            </button>
            <button
              onClick={() => navigate('/teacher/classes')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              <Users size={14} />
              <span>View Roster</span>
            </button>
          </div>
        </div>

        {/* Teaching Allocations */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BookOpen size={18} color="#06B6D4" />
              <span>Curriculum Subject Allocations</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {classesData?.teaching_subjects?.map((ts, idx) => (
              <div
                key={idx}
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
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F172A' }}>{ts.subject_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {ts.name} • Room: {ts.room_number || 'Room 201'}
                  </div>
                </div>
                <button
                  onClick={() => navigate('/teacher/grades')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  Enter Grades
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
