import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  CalendarCheck,
  Award,
  Bell,
  CreditCard,
  LogOut,
  ChevronRight,
  BookOpen
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const roleNavItems = {
    admin: [
      { to: '/admin', label: 'Overview', icon: LayoutDashboard },
      { to: '/admin/students', label: 'Students', icon: GraduationCap },
      { to: '/admin/teachers', label: 'Faculty Directory', icon: Users },
      { to: '/admin/classes', label: 'Classes & Subjects', icon: School },
      { to: '/admin/attendance', label: 'Attendance Hub', icon: CalendarCheck },
      { to: '/admin/grades', label: 'Exam & Grades', icon: Award },
      { to: '/admin/announcements', label: 'Announcements', icon: Bell },
      { to: '/admin/fees', label: 'Fee Invoices', icon: CreditCard },
    ],
    teacher: [
      { to: '/teacher', label: 'Teacher Dashboard', icon: LayoutDashboard },
      { to: '/teacher/attendance', label: 'Mark Attendance', icon: CalendarCheck },
      { to: '/teacher/grades', label: 'Gradebook Entry', icon: Award },
      { to: '/teacher/classes', label: 'My Assigned Classes', icon: BookOpen },
      { to: '/teacher/announcements', label: 'Notices', icon: Bell },
    ],
    student: [
      { to: '/student', label: 'My Dashboard', icon: LayoutDashboard },
      { to: '/student/attendance', label: 'My Attendance', icon: CalendarCheck },
      { to: '/student/grades', label: 'Report Card & GPA', icon: Award },
      { to: '/student/fees', label: 'Tuition & Fees', icon: CreditCard },
      { to: '/student/announcements', label: 'Notice Board', icon: Bell },
    ],
    parent: [
      { to: '/parent', label: 'Parent Dashboard', icon: LayoutDashboard },
      { to: '/parent/attendance', label: 'Child Attendance', icon: CalendarCheck },
      { to: '/parent/grades', label: 'Academic Progress', icon: Award },
      { to: '/parent/fees', label: 'Fee Billing & Pay', icon: CreditCard },
      { to: '/parent/announcements', label: 'School Notices', icon: Bell },
    ]
  };

  const navItems = roleNavItems[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className="sidebar"
      style={{
        width: '260px',
        backgroundColor: '#0F172A',
        color: '#E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        minHeight: '100vh',
        borderRight: '1px solid #1E293B',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          borderBottom: '1px solid #1E293B'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)'
          }}
        >
          <School size={22} color="#FFFFFF" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            TechSchool <span style={{ color: '#818CF8', fontSize: '0.8125rem', fontWeight: 600 }}>SMS</span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Enterprise Edition
          </div>
        </div>
      </div>

      {/* Role Pill Indicator */}
      <div style={{ padding: '1rem 1.25rem 0.5rem' }}>
        <div
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            background: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor:
                  user.role === 'admin' ? '#A855F7' : user.role === 'teacher' ? '#6366F1' : user.role === 'student' ? '#10B981' : '#F59E0B'
              }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F1F5F9' }}>
              {user.role} Portal
            </span>
          </div>
          <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>v1.0</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/teacher' || item.to === '/student' || item.to === '/parent'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6875rem 0.875rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive ? '#FFFFFF' : '#94A3B8',
                backgroundColor: isActive ? '#4F46E5' : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              <ChevronRight size={14} style={{ opacity: 0.5 }} />
            </NavLink>
          );
        })}
      </nav>

      {/* User Card at bottom */}
      <div
        style={{
          padding: '1rem',
          margin: '0.75rem',
          borderRadius: '12px',
          background: '#1E293B',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.first_name}`}
          alt={user.first_name}
          style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#334155', objectFit: 'cover' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.first_name} {user.last_name}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.email}
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'color 0.15s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#EF4444')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#94A3B8')}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
