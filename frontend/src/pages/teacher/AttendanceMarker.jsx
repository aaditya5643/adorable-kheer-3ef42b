import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  HelpCircle,
  Save,
  CheckCheck,
  AlertCircle,
  Users
} from 'lucide-react';

export default function AttendanceMarker() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('1'); // Default to Class 10-A
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [roster, setRoster] = useState([]);
  const [records, setRecords] = useState({}); // { student_id: { status, remarks } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await api.getClasses();
        if (res.success && res.classes.length > 0) {
          setClasses(res.classes);
          if (!selectedClass) setSelectedClass(res.classes[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadSheet();
    }
  }, [selectedClass, selectedDate]);

  async function loadSheet() {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.getClassAttendance(selectedClass, selectedDate);
      if (res.success) {
        setRoster(res.roster);
        const map = {};
        res.roster.forEach((item) => {
          map[item.student_id] = {
            status: item.status === 'unmarked' ? 'present' : item.status,
            remarks: item.remarks || ''
          };
        });
        setRecords(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleStatusChange(studentId, newStatus) {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: newStatus
      }
    }));
  }

  function handleRemarksChange(studentId, newRemarks) {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: newRemarks
      }
    }));
  }

  function handleMarkAllPresent() {
    setRecords((prev) => {
      const updated = { ...prev };
      roster.forEach((st) => {
        updated[st.student_id] = {
          ...updated[st.student_id],
          status: 'present',
          remarks: updated[st.student_id]?.remarks || 'On time'
        };
      });
      return updated;
    });
  }

  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    try {
      const payload = {
        class_id: Number(selectedClass),
        date: selectedDate,
        records: Object.keys(records).map((studentId) => ({
          student_id: Number(studentId),
          status: records[studentId].status,
          remarks: records[studentId].remarks
        }))
      };

      const res = await api.markAttendanceBatch(payload);
      if (res.success) {
        setFeedback({ type: 'success', message: `Attendance successfully logged for ${payload.records.length} students!` });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save attendance.' });
    } finally {
      setSaving(false);
    }
  }

  // Count summaries from state
  const counts = {
    total: roster.length,
    present: Object.values(records).filter((r) => r.status === 'present').length,
    late: Object.values(records).filter((r) => r.status === 'late').length,
    absent: Object.values(records).filter((r) => r.status === 'absent').length,
    excused: Object.values(records).filter((r) => r.status === 'excused').length
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>Class Attendance Register</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Record daily attendance logs, excused absences, and arrival timestamps.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="btn btn-primary"
          id="save-attendance-btn"
        >
          <Save size={16} />
          <span>{saving ? 'Recording Sheet...' : 'Save Attendance Sheet'}</span>
        </button>
      </div>

      {/* Filter and Date Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="form-select"
                style={{ width: 'auto', fontWeight: 600 }}
                id="attendance-class-select"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-input"
                style={{ width: 'auto', fontWeight: 600 }}
                id="attendance-date-picker"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="btn btn-secondary btn-sm"
            id="mark-all-present-btn"
          >
            <CheckCheck size={16} color="#10B981" />
            <span>Mark All Present</span>
          </button>
        </div>
      </div>

      {/* Notification feedback */}
      {feedback && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: feedback.type === 'success' ? '#065F46' : '#991B1B',
            border: `1px solid ${feedback.type === 'success' ? '#A7F3D0' : '#FECACA'}`
          }}
        >
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{feedback.message}</span>
        </div>
      )}

      {/* Summary Chips */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ background: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={16} color="#64748B" />
          <span style={{ fontSize: '0.8125rem', color: '#475569' }}>Total Roster:</span>
          <strong style={{ fontSize: '0.9375rem' }}>{counts.total}</strong>
        </div>

        <div style={{ background: '#ECFDF5', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} color="#059669" />
          <span style={{ fontSize: '0.8125rem', color: '#065F46' }}>Present:</span>
          <strong style={{ fontSize: '0.9375rem', color: '#065F46' }}>{counts.present}</strong>
        </div>

        <div style={{ background: '#FFFBEB', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} color="#D97706" />
          <span style={{ fontSize: '0.8125rem', color: '#92400E' }}>Late:</span>
          <strong style={{ fontSize: '0.9375rem', color: '#92400E' }}>{counts.late}</strong>
        </div>

        <div style={{ background: '#FEF2F2', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <XCircle size={16} color="#DC2626" />
          <span style={{ fontSize: '0.8125rem', color: '#991B1B' }}>Absent:</span>
          <strong style={{ fontSize: '0.9375rem', color: '#991B1B' }}>{counts.absent}</strong>
        </div>

        <div style={{ background: '#EFF6FF', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle size={16} color="#2563EB" />
          <span style={{ fontSize: '0.8125rem', color: '#1E40AF' }}>Excused:</span>
          <strong style={{ fontSize: '0.9375rem', color: '#1E40AF' }}>{counts.excused}</strong>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>#</th>
              <th>Student Details</th>
              <th style={{ textAlign: 'center', width: '380px' }}>Attendance Status</th>
              <th>Remarks / Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                  Loading attendance roster...
                </td>
              </tr>
            ) : roster.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                  No students in this class.
                </td>
              </tr>
            ) : (
              roster.map((st, index) => {
                const currentStatus = records[st.student_id]?.status || 'present';
                const currentRemarks = records[st.student_id]?.remarks || '';

                return (
                  <tr key={st.student_id}>
                    <td style={{ color: '#94A3B8', fontWeight: 600 }}>{index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={st.avatar}
                          alt={st.first_name}
                          style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#F1F5F9' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>
                            {st.first_name} {st.last_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B' }}>
                            {st.admission_number}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Interactive Toggle Buttons */}
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem' }}>
                        {[
                          { id: 'present', label: 'Present', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
                          { id: 'late', label: 'Late', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
                          { id: 'absent', label: 'Absent', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
                          { id: 'excused', label: 'Excused', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' }
                        ].map((btn) => {
                          const isSelected = currentStatus === btn.id;
                          return (
                            <button
                              key={btn.id}
                              type="button"
                              onClick={() => handleStatusChange(st.student_id, btn.id)}
                              style={{
                                padding: '0.375rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                border: `1.5px solid ${isSelected ? btn.color : '#E2E8F0'}`,
                                backgroundColor: isSelected ? btn.bg : '#FFFFFF',
                                color: isSelected ? btn.color : '#64748B',
                                transform: isSelected ? 'scale(1.04)' : 'none',
                                boxShadow: isSelected ? `0 2px 6px ${btn.border}` : 'none'
                              }}
                            >
                              {btn.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Remarks Input */}
                    <td>
                      <input
                        type="text"
                        value={currentRemarks}
                        onChange={(e) => handleRemarksChange(st.student_id, e.target.value)}
                        placeholder="Add reason or note..."
                        className="form-input"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
                      />
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
