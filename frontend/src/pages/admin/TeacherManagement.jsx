import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Users, UserPlus, Mail, Phone, BookOpen, Briefcase, Award, X, AlertCircle, CheckCircle } from 'lucide-react';

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'Mathematics',
    qualification: 'M.Sc. Mathematics, B.Ed',
    employee_id: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, [departmentFilter]);

  async function loadTeachers() {
    setLoading(true);
    try {
      const params = {};
      if (departmentFilter) params.department = departmentFilter;
      const res = await api.getTeachers(params);
      if (res.success) setTeachers(res.teachers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTeacher(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await api.createTeacher(formData);
      if (res.success) {
        setSuccess('Faculty member added successfully!');
        loadTeachers();
        setTimeout(() => {
          setShowAddModal(false);
          setSuccess('');
          setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            department: 'Mathematics',
            qualification: '',
            employee_id: ''
          });
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to add teacher');
    } finally {
      setSubmitting(false);
    }
  }

  const departments = ['Mathematics', 'Science', 'Humanities', 'Technology'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>Faculty & Staff Directory</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Manage teaching faculty, departmental assignments, and class allocations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          id="add-teacher-btn"
        >
          <UserPlus size={16} />
          <span>Add New Faculty</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setDepartmentFilter('')}
          className={`btn btn-sm ${departmentFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Departments ({teachers.length})
        </button>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setDepartmentFilter(dept)}
            className={`btn btn-sm ${departmentFilter === dept ? 'btn-primary' : 'btn-secondary'}`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading Faculty Members...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {teachers.map((t) => (
            <div key={t.teacher_id} className="card card-hover">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <img
                  src={t.avatar}
                  alt={t.first_name}
                  style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', background: '#F1F5F9' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.first_name} {t.last_name}
                    </h3>
                  </div>
                  <span className="badge badge-teacher" style={{ marginTop: '0.25rem' }}>
                    {t.department}
                  </span>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B', marginTop: '0.25rem' }}>
                    ID: {t.employee_id}
                  </div>
                </div>
              </div>

              {/* Qualification */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569', marginBottom: '0.5rem' }}>
                <Award size={15} color="#6366F1" />
                <span>{t.qualification}</span>
              </div>

              {/* Contact */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B', marginBottom: '1rem' }}>
                <Mail size={14} />
                <span>{t.email}</span>
              </div>

              {/* Assigned Subjects & Classes */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                  Teaching Allocations
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {t.subjects && t.subjects.length > 0 ? (
                    t.subjects.map((sub, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          background: '#EEF2FF',
                          color: '#4338CA'
                        }}
                      >
                        {sub.name} ({sub.class_name})
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>No active classes</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Faculty Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Add Faculty Member</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTeacher}>
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
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="form-input"
                      placeholder="e.g. Robert"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="form-input"
                      placeholder="e.g. Vance"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Faculty Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    placeholder="robert.vance@techschool.edu"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="form-select"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      className="form-input"
                      placeholder="Auto-generated if blank"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Qualifications</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Ph.D. in Applied Mathematics"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Add Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
