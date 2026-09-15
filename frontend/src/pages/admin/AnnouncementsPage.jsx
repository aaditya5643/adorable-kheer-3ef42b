import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Bell, Plus, Trash2, Calendar, User, Tag, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    target_role: 'all'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadNotices();
  }, []);

  async function loadNotices() {
    setLoading(true);
    try {
      const res = await api.getAnnouncements();
      if (res.success) setNotices(res.notices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateNotice(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await api.createAnnouncement(formData);
      if (res.success) {
        setSuccess('Announcement posted successfully!');
        loadNotices();
        setTimeout(() => {
          setShowCreateModal(false);
          setSuccess('');
          setFormData({
            title: '',
            content: '',
            category: 'General',
            target_role: 'all'
          });
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteNotice(id) {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await api.deleteAnnouncement(id);
      if (res.success) {
        loadNotices();
      }
    } catch (err) {
      alert('Failed to delete announcement');
    }
  }

  const canPost = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>School Announcements & Notices</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Official bulletins, academic updates, and urgent school notices.
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            id="post-announcement-btn"
          >
            <Plus size={16} />
            <span>Post New Announcement</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading Announcements...</div>
      ) : notices.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Bell size={36} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B' }}>No Announcements Found</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            There are currently no active bulletins posted for your role.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {notices.map((n) => (
            <div key={n.id} className="card card-hover" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        backgroundColor: '#EEF2FF',
                        color: '#4F46E5',
                        textTransform: 'uppercase'
                      }}
                    >
                      {n.category}
                    </span>
                    <span className="badge badge-admin" style={{ fontSize: '0.6875rem' }}>
                      Audience: {n.target_role === 'all' ? 'Entire School' : `${n.target_role}s`}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{n.title}</h3>
                </div>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDeleteNotice(n.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                    title="Delete Announcement"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <p style={{ fontSize: '0.9375rem', color: '#334155', lineHeight: 1.6, marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                {n.content}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.75rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <User size={13} />
                  <span>Posted by {n.author_first_name} {n.author_last_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Calendar size={13} />
                  <span>{new Date(n.created_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Post Announcement</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNotice}>
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

                <div className="form-group">
                  <label className="form-label">Announcement Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Science Laboratory Schedule Updates"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="form-select"
                    >
                      <option value="General">General Notice</option>
                      <option value="Academic">Academic / Exam</option>
                      <option value="Meeting">Meeting / Conference</option>
                      <option value="Staff">Faculty / Staff</option>
                      <option value="Event">Sports & Cultural</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Audience</label>
                    <select
                      value={formData.target_role}
                      onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                      className="form-select"
                    >
                      <option value="all">Entire School (All Roles)</option>
                      <option value="teacher">Faculty Only</option>
                      <option value="student">Students Only</option>
                      <option value="parent">Parents Only</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message Content *</label>
                  <textarea
                    required
                    rows="5"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="form-textarea"
                    placeholder="Type the detailed announcement message here..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
