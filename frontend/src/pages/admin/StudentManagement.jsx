import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Search,
  UserPlus,
  Filter,
  Eye,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  Award
} from 'lucide-react';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Modals state
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [profileModalStudent, setProfileModalStudent] = useState(null);
  const [profileDetails, setProfileDetails] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    class_id: '',
    date_of_birth: '2010-05-15',
    gender: 'Male',
    blood_group: 'O+',
    address: '124 School Way, Springfield',
    emergency_contact: '+1 (555) 999-1234'
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClasses();
    loadStudents();
  }, [selectedClass]);

  async function loadClasses() {
    try {
      const res = await api.getClasses();
      if (res.success) setClasses(res.classes);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadStudents() {
    setLoading(true);
    try {
      const params = {};
      if (selectedClass) params.class_id = selectedClass;
      if (search) params.search = search;
      const res = await api.getStudents(params);
      if (res.success) setStudents(res.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStudents();
  };

  async function handleEnrollSubmit(e) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const res = await api.createStudent(formData);
      if (res.success) {
        setFormSuccess('Student enrolled successfully!');
        loadStudents();
        setTimeout(() => {
          setShowEnrollModal(false);
          setFormSuccess('');
          setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            class_id: '',
            date_of_birth: '2010-05-15',
            gender: 'Male',
            blood_group: 'O+',
            address: '',
            emergency_contact: ''
          });
        }, 1200);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to enroll student');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleViewProfile(studentId) {
    setProfileModalStudent(studentId);
    setProfileLoading(true);
    try {
      const res = await api.getStudentById(studentId);
      if (res.success) {
        setProfileDetails(res.student);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleDeleteStudent(studentId, name) {
    if (!window.confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.deleteStudent(studentId);
      if (res.success) {
        loadStudents();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete student');
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>Student Directory</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Manage student registrations, cohort enrollments, and academic profiles.
          </p>
        </div>

        <button
          onClick={() => setShowEnrollModal(true)}
          className="btn btn-primary"
          id="enroll-student-btn"
        >
          <UserPlus size={16} />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name, admission #, or email..."
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                id="student-search-input"
              />
            </div>
            <button type="submit" className="btn btn-secondary">Search</button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#64748B" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-select"
              style={{ width: 'auto' }}
              id="student-class-filter"
            >
              <option value="">All Classes & Grades</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Admission #</th>
              <th>Student Name</th>
              <th>Class / Section</th>
              <th>Parent / Guardian</th>
              <th>Attendance Rate</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                  Loading students...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                  No students found matching current filters.
                </td>
              </tr>
            ) : (
              students.map((st) => (
                <tr key={st.student_id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4F46E5' }}>
                      {st.admission_number}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={st.avatar}
                        alt={st.first_name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>
                          {st.first_name} {st.last_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{st.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{st.class_name}</span>
                  </td>
                  <td>
                    {st.parent_first_name ? (
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                          {st.parent_first_name} {st.parent_last_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{st.parent_phone}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>Not Assigned</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: st.attendance_rate >= 85 ? '#10B981' : (st.attendance_rate >= 70 ? '#F59E0B' : '#EF4444')
                        }}
                      >
                        {st.attendance_rate}%
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>({st.total_days} days)</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>
                      Active
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleViewProfile(st.student_id)}
                        className="btn btn-secondary btn-sm"
                        title="View Complete Academic Profile"
                        id={`view-student-${st.student_id}`}
                      >
                        <Eye size={14} />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(st.student_id, `${st.first_name} ${st.last_name}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#EF4444' }}
                        title="Delete Student"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>Enroll New Student</h3>
              <button onClick={() => setShowEnrollModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div style={{ padding: '0.75rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} />
                    <span>{formSuccess}</span>
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
                      placeholder="e.g. Alexander"
                      id="enroll-first-name"
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
                      placeholder="e.g. Hayes"
                      id="enroll-last-name"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Student Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      placeholder="alex.hayes@techschool.edu"
                      id="enroll-email"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Class & Grade *</label>
                    <select
                      required
                      value={formData.class_id}
                      onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                      className="form-select"
                      id="enroll-class-select"
                    >
                      <option value="">Select Class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="form-select"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select
                      value={formData.blood_group}
                      onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      className="form-select"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Home Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="form-input"
                    placeholder="Residential street address"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Contact Number</label>
                  <input
                    type="text"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  id="enroll-submit-btn"
                >
                  {submitting ? 'Enrolling...' : 'Complete Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {profileModalStudent && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>Student Profile</h3>
              <button onClick={() => setProfileModalStudent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {profileLoading || !profileDetails ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>Loading Profile Details...</div>
              ) : (
                <div>
                  {/* Bio Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                    <img
                      src={profileDetails.avatar}
                      alt={profileDetails.first_name}
                      style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#F1F5F9', border: '2px solid #E2E8F0' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                        {profileDetails.first_name} {profileDetails.last_name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <span className="badge badge-student">{profileDetails.class_name}</span>
                        <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: '#64748B' }}>
                          #{profileDetails.admission_number}
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                          Blood Group: <strong>{profileDetails.blood_group}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Stats Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981' }}>
                        {profileDetails.attendance_summary?.present_count || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Days Present</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F59E0B' }}>
                        {profileDetails.attendance_summary?.late_count || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Late Marks</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EF4444' }}>
                        {profileDetails.attendance_summary?.absent_count || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Days Absent</div>
                    </div>
                  </div>

                  {/* Recent Grades Breakdown */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.75rem' }}>
                      Academic Performance (Term 1)
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {profileDetails.grades?.map((g) => (
                        <div
                          key={g.grade_id}
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
                          <div>
                            <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{g.subject_name}</span>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{g.comments}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F172A' }}>{g.marks_obtained}/100</span>
                            <span
                              style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: g.grade_letter.includes('A') ? '#DCFCE7' : '#EFF6FF',
                                color: g.grade_letter.includes('A') ? '#166534' : '#1E40AF'
                              }}
                            >
                              {g.grade_letter}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.5rem' }}>Parent & Emergency Contact</div>
                    <div style={{ color: '#475569' }}>
                      Guardian: <strong>{profileDetails.parent_first_name || 'N/A'} {profileDetails.parent_last_name || ''}</strong>
                    </div>
                    <div style={{ color: '#475569' }}>Phone: {profileDetails.parent_phone || profileDetails.emergency_contact || 'N/A'}</div>
                    <div style={{ color: '#475569' }}>Residential Address: {profileDetails.address || 'N/A'}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setProfileModalStudent(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
