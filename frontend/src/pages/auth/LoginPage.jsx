import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { School, Shield, UserCheck, GraduationCap, Users, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@techschool.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      redirectByRole(u.role);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoClick(role) {
    setError('');
    setLoading(true);
    try {
      const u = await loginAsDemo(role);
      redirectByRole(u.role);
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  }

  function redirectByRole(role) {
    if (role === 'admin') navigate('/admin');
    else if (role === 'teacher') navigate('/teacher');
    else if (role === 'student') navigate('/student');
    else if (role === 'parent') navigate('/parent');
    else navigate('/');
  }

  const demoPresets = [
    { role: 'admin', title: 'Administrator', name: 'Dr. Eleanor Vance', email: 'admin@techschool.edu', icon: Shield, color: '#A855F7' },
    { role: 'teacher', title: 'Teacher (Faculty)', name: 'Sarah Jenkins', email: 'sarah.jenkins@techschool.edu', icon: UserCheck, color: '#4F46E5' },
    { role: 'student', title: 'Student', name: 'Liam Johnson', email: 'liam.johnson@techschool.edu', icon: GraduationCap, color: '#10B981' },
    { role: 'parent', title: 'Parent / Guardian', name: 'Robert Johnson', email: 'robert.johnson@example.com', icon: Users, color: '#F59E0B' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top, #1E1B4B 0%, #0F172A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', background: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
        
        {/* Left Side: Standard Login */}
        <div style={{ padding: '3.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(79, 70, 229, 0.35)' }}>
              <School size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>TechSchool <span style={{ color: '#4F46E5' }}>SMS</span></h1>
              <p style={{ fontSize: '0.8125rem', color: '#64748B' }}>Next-Generation School Management Portal</p>
            </div>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.25rem' }}>Sign In to Portal</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Access your personalized academic dashboard</p>
          </div>

          {error && (
            <div style={{ padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@techschool.edu"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.9375rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In Securely'}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Right Side: Instant 1-Click Role Logins */}
        <div style={{ background: '#F8FAFC', padding: '3rem 2.5rem', borderLeft: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6366F1' }}>
              Instant Demo Access
            </span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginTop: '0.25rem' }}>
              One-Click Persona Login
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B' }}>
              Click any role profile below to test its role-specific capabilities without typing credentials:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {demoPresets.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.role}
                  id={`demo-card-${p.role}`}
                  onClick={() => handleDemoClick(p.role)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = p.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${p.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color={p.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{p.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: p.color }}>
                    <span>Launch</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
