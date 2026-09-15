import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Calendar, UserCheck, Search } from 'lucide-react';

export default function Header() {
  const { user, activeChildId, setActiveChildId } = useAuth();

  return (
    <header
      className="header-navbar"
      style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      {/* Left side: Context badge & Parent Child Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: '#F1F5F9',
            fontSize: '0.8125rem',
            color: '#475569',
            fontWeight: 500
          }}
        >
          <Calendar size={14} color="#6366F1" />
          <span>Academic Session 2026-2027 • Term 1</span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            color: '#B45309',
            fontSize: '0.75rem',
            fontWeight: 700
          }}
          title="Connected to Firebase Cloud Project techschool-da235"
        >
          <span>🔥</span>
          <span>Firebase Cloud (techschool-da235)</span>
        </div>


        {/* Parent child switcher dropdown if parent */}
        {user?.role === 'parent' && user.children?.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>Active Child:</span>
            <select
              value={activeChildId || ''}
              onChange={(e) => setActiveChildId(Number(e.target.value))}
              className="form-select"
              style={{
                padding: '0.3rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderColor: '#6366F1',
                backgroundColor: '#EEF2FF',
                color: '#4338CA',
                width: 'auto'
              }}
            >
              {user.children.map((ch) => (
                <option key={ch.student_id} value={ch.student_id}>
                  {ch.first_name} {ch.last_name} ({ch.class_name || 'Grade 10'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Role badge, notifications, and user avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Role Badge */}
        <span className={`badge badge-${user?.role || 'admin'}`}>
          {user?.role === 'admin' && '👑 Super Admin'}
          {user?.role === 'teacher' && '👩‍🏫 Faculty Member'}
          {user?.role === 'student' && '🎓 Student'}
          {user?.role === 'parent' && '👨‍👧 Parent / Guardian'}
        </span>

        {/* Notification Bell */}
        <div style={{ position: 'relative', cursor: 'pointer', padding: '0.25rem' }}>
          <Bell size={20} color="#64748B" />
          <span
            style={{
              position: 'absolute',
              top: '1px',
              right: '2px',
              width: '8px',
              height: '8px',
              backgroundColor: '#EF4444',
              borderRadius: '50%',
              boxShadow: '0 0 4px #EF4444'
            }}
          />
        </div>

        {/* Avatar & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name}`}
            alt={user?.first_name}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #E2E8F0', objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user?.first_name} {user?.last_name}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {user?.role === 'student' ? user.class_name || 'Grade 10-A' : user?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
