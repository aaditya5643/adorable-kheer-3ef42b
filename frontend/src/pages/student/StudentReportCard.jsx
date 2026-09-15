import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { School, Printer, Award, CheckCircle, Calendar, FileText } from 'lucide-react';

export default function StudentReportCard() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const studentId = user?.student_id || user?.student?.id;
        const res = await api.getReportCard(studentId);
        if (res.success) {
          setReport(res.report_card);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [user]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Generating Official Report Card...</div>;
  }

  if (!report) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Report card not available yet.</div>;
  }

  const { student, exam, subjects, summary } = report;

  return (
    <div>
      {/* Top Action Bar */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>Official Academic Transcript</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Verified grade report for {exam?.name || 'Term 1 Examination'} ({exam?.academic_year || '2026-2027'}).
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="btn btn-primary"
          id="print-report-card-btn"
        >
          <Printer size={16} />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Formal Printable Document Card */}
      <div
        className="card report-card-print"
        style={{
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '16px',
          padding: '3rem',
          maxWidth: '900px',
          margin: '0 auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* School Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #0F172A', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '14px', background: '#0F172A', color: '#FFFFFF', marginBottom: '0.75rem' }}>
            <School size={30} />
          </div>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            TechSchool Senior Academy
          </h2>
          <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '0.25rem' }}>
            Affiliated to Global Board of Secondary Education • School Code: 80492-SMS
          </div>
          <div style={{ display: 'inline-block', marginTop: '0.75rem', padding: '0.25rem 1.25rem', borderRadius: '9999px', background: '#EEF2FF', color: '#4338CA', fontWeight: 800, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Official Term Report Card • {exam?.name || 'Mid-Term 2026'}
          </div>
        </div>

        {/* Student Metadata Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem 2rem',
            background: '#F8FAFC',
            padding: '1.25rem 1.5rem',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            marginBottom: '2rem',
            fontSize: '0.875rem'
          }}
        >
          <div>
            <span style={{ color: '#64748B' }}>Student Name:</span>{' '}
            <strong style={{ color: '#0F172A' }}>{student.first_name} {student.last_name}</strong>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Admission Number:</span>{' '}
            <strong style={{ fontFamily: 'monospace', color: '#4F46E5' }}>{student.admission_number}</strong>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Class & Section:</span>{' '}
            <strong style={{ color: '#0F172A' }}>{student.class_name}</strong>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Academic Session:</span>{' '}
            <strong style={{ color: '#0F172A' }}>2026-2027</strong>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Guardian:</span>{' '}
            <strong style={{ color: '#0F172A' }}>{student.parent_first_name ? `${student.parent_first_name} ${student.parent_last_name}` : 'N/A'}</strong>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Date of Issue:</span>{' '}
            <strong style={{ color: '#0F172A' }}>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
          </div>
        </div>

        {/* Academic Marks Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#0F172A', color: '#FFFFFF' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderRadius: '8px 0 0 0' }}>Subject</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Max Marks</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Marks Obtained</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Grade</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderRadius: '0 8px 0 0' }}>Teacher Remarks</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, index) => (
              <tr key={sub.subject_id} style={{ borderBottom: '1px solid #E2E8F0', background: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0F172A' }}>
                  {sub.subject_name}{' '}
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B' }}>({sub.subject_code})</span>
                </td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#64748B' }}>
                  {sub.max_marks || 100}
                </td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 700, color: '#0F172A' }}>
                  {sub.marks_obtained !== null ? sub.marks_obtained : '-'}
                </td>
                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                      background: sub.grade_letter?.includes('A') ? '#DCFCE7' : '#EEF2FF',
                      color: sub.grade_letter?.includes('A') ? '#166534' : '#3730A3'
                    }}
                  >
                    {sub.grade_letter || '-'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.8125rem' }}>
                  {sub.comments || 'Satisfactory academic progress'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Aggregate Performance Box */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #CBD5E1', marginBottom: '2.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Total Score</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#0F172A', marginTop: '0.25rem' }}>
              {summary.total_marks} / {summary.total_max_marks}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Percentage</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#4F46E5', marginTop: '0.25rem' }}>
              {summary.percentage}%
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Cumulative GPA</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#059669', marginTop: '0.25rem' }}>
              {summary.gpa.toFixed(2)} <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>/ 4.0</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Attendance</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#0F172A', marginTop: '0.25rem' }}>
              {summary.attendance_percentage}%
            </div>
          </div>
        </div>

        {/* Academic Standing & Standing Note */}
        <div style={{ marginBottom: '3rem', padding: '0.875rem 1.25rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#065F46', textTransform: 'uppercase', fontWeight: 700 }}>Academic Standing:</span>{' '}
            <strong style={{ color: '#065F46', fontSize: '0.9375rem' }}>{summary.academic_standing}</strong>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#047857' }}>Eligible for Honors & Advanced Placement</div>
        </div>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '2rem', borderTop: '1px dashed #CBD5E1' }}>
          <div style={{ textAlign: 'center', width: '220px' }}>
            <div style={{ fontFamily: 'cursive', fontSize: '1.25rem', color: '#475569', marginBottom: '0.5rem' }}>
              Sarah Jenkins
            </div>
            <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
              Homeroom Teacher
            </div>
          </div>

          <div style={{ textAlign: 'center', width: '220px' }}>
            <div style={{ fontFamily: 'cursive', fontSize: '1.25rem', color: '#475569', marginBottom: '0.5rem' }}>
              Eleanor Vance, Ph.D.
            </div>
            <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
              Principal & Head of School
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
