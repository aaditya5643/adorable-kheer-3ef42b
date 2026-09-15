import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { School, Plus, Users, BookOpen, UserCheck, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Class modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    grade_level: '10',
    section: 'C',
    room_number: 'Room 203',
    class_teacher_id: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Class Details modal
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [classRes, teacherRes] = await Promise.all([
        api.getClasses(),
        api.getTeachers()
      ]);
      if (classRes.success) setClasses(classRes.classes);
      if (teacherRes.success) setTeachers(teacherRes.teachers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateClass(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await api.createClass(formData);
      if (res.success) {
        setSuccess('Class section created successfully!');
        loadData();
        setTimeout(() => {
          setShowAddModal(false);
          setSuccess('');
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to create class');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleViewClass(classId) {
    setSelectedClassId(classId);
    setDetailsLoading(true);
    try {
      const res = await api.getClassById(classId);
      if (res.success) {
        setClassDetails(res.class);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>Classes & Sections</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Configure grade streams, homeroom teachers, classroom locations, and curricula.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          id="create-class-btn"
        >
          <Plus size={16} />
          <span>New Class Section</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading classes...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {classes.map((c) => (
            <div key={c.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #C7D2FE'
                    }}
                  >
                    <School size={22} color="#4F46E5" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A' }}>{c.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{c.room_number || 'Room TBD'}</span>
                  </div>
                </div>

                <span className="badge" style={{ background: '#F1F5F9', color: '#475569' }}>
                  Grade {c.grade_level}
                </span>
              </div>

              {/* Teacher Info */}
              <div style={{ background: '#F8FAFC', padding: '0.75rem 0.875rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Class Teacher
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={16} color="#10B981" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>
                    {c.teacher_first_name ? `${c.teacher_first_name} ${c.teacher_last_name}` : 'Not assigned'}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ textAlign: 'center', padding: '0.5rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4F46E5' }}>{c.student_count}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Enrolled Students</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.5rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#06B6D4' }}>{c.subject_count}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Active Subjects</div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: 'auto' }}>
                <button
                  onClick={() => handleViewClass(c.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Users size={14} />
                  <span>View Student Roster & Subjects</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Class Details Modal */}
      {selectedClassId && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {classDetails?.name || 'Class Details'} Roster
              </h3>
              <button onClick={() => setSelectedClassId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {detailsLoading || !classDetails ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>Loading Class Details...</div>
              ) : (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Enrolled Students ({classDetails.students?.length || 0})
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                      {classDetails.students?.map((s) => (
                        <div
                          key={s.student_id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img src={s.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                              {s.first_name} {s.last_name}
                            </span>
                          </div>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B' }}>
                            {s.admission_number}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Assigned Subjects
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {classDetails.subjects?.map((sub) => (
                        <div
                          key={sub.id}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            background: '#EEF2FF',
                            border: '1px solid #C7D2FE',
                            fontSize: '0.8125rem'
                          }}
                        >
                          <strong style={{ color: '#4338CA' }}>{sub.name}</strong>
                          <span style={{ color: '#6366F1', marginLeft: '0.35rem' }}>({sub.code})</span>
                          {sub.teacher_first_name && (
                            <div style={{ fontSize: '0.6875rem', color: '#475569', marginTop: '0.15rem' }}>
                              Instructor: {sub.teacher_first_name} {sub.teacher_last_name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedClassId(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create New Class Section</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClass}>
              <div className="modal-body">
                {error && (
                  <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div style={{ padding: '0.75rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {success}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Grade Level *</label>
                    <select
                      value={formData.grade_level}
                      onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                      className="form-select"
                    >
                      <option value="9">Grade 9</option>
                      <option value="10">Grade 10</option>
                      <option value="11">Grade 11</option>
                      <option value="12">Grade 12</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Section Identifier *</label>
                    <input
                      type="text"
                      required
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="form-input"
                      placeholder="e.g. A, B, or C"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Homeroom Number</label>
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Room 204"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Class Teacher</label>
                  <select
                    value={formData.class_teacher_id}
                    onChange={(e) => setFormData({ ...formData, class_teacher_id: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select Faculty Member</option>
                    {teachers.map((t) => (
                      <option key={t.user_id} value={t.user_id}>
                        {t.first_name} {t.last_name} ({t.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
