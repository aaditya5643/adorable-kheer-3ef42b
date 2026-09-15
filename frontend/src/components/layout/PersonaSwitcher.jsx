import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, GraduationCap, Users, UserCheck } from 'lucide-react';

export default function PersonaSwitcher() {
  const { user, loginAsDemo } = useAuth();

  const personas = [
    { role: 'admin', label: 'Admin (Eleanor)', icon: Shield, subtitle: 'School Superuser' },
    { role: 'teacher', label: 'Teacher (Sarah)', icon: UserCheck, subtitle: 'Math Faculty / 10-A' },
    { role: 'student', label: 'Student (Liam)', icon: GraduationCap, subtitle: 'Grade 10 Student' },
    { role: 'parent', label: 'Parent (Robert)', icon: Users, subtitle: 'Parent of Liam' }
  ];

  return (
    <div className="demo-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, color: '#F8FAFC' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
          Interactive Demo Switcher:
        </span>
        <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Click any role to test its specific portal instantly</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {personas.map((p) => {
          const Icon = p.icon;
          const isActive = user?.role === p.role;
          return (
            <button
              key={p.role}
              id={`switch-to-${p.role}`}
              onClick={() => loginAsDemo(p.role)}
              className={`demo-persona-btn ${isActive ? 'active' : ''}`}
              title={`Switch perspective to ${p.label}`}
            >
              <Icon size={13} />
              <span>{p.label}</span>
              {isActive && <span style={{ fontSize: '0.6875rem', opacity: 0.8 }}>(Active)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
