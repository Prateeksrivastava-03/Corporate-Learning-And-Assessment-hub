import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = {
  admin: [
    { path: '/admin/dashboard', icon: '◈', label: 'Dashboard' },
    { path: '/admin/users', icon: '⬡', label: 'Users' },
    { path: '/admin/courses', icon: '◉', label: 'Courses' },
    { path: '/admin/assessments', icon: '◎', label: 'Assessments' },
    { path: '/admin/certificates', icon: '✦', label: 'Certificates' },
    { path: '/admin/analytics', icon: '▣', label: 'Analytics' },
  ],
  trainer: [
    { path: '/trainer/dashboard', icon: '◈', label: 'Dashboard' },
    { path: '/trainer/courses', icon: '◉', label: 'My Courses' },
    { path: '/trainer/assessments', icon: '◎', label: 'Assessments' },
    { path: '/trainer/students', icon: '⬡', label: 'Students' },
    { path: '/trainer/analytics', icon: '▣', label: 'Analytics' },
  ],
  employee: [
    { path: '/employee/dashboard', icon: '◈', label: 'Dashboard' },
    { path: '/employee/courses', icon: '◉', label: 'Courses' },
    { path: '/employee/assessments', icon: '◎', label: 'Assessments' },
    { path: '/employee/progress', icon: '◐', label: 'My Progress' },
    { path: '/employee/certificates', icon: '✦', label: 'Certificates' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const links = NAV[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: collapsed ? 72 : 240, minHeight: '100vh', background: 'var(--navy-mid)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s', flexShrink: 0, position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '1.25rem 0' : '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', minHeight: 68 }}>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)', letterSpacing: '-0.02em' }}>CorpLearn</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Training Hub</div>
          </div>
        )}
        {collapsed && <span style={{ color: 'var(--accent)', fontSize: '1.3rem', fontFamily: 'Syne', fontWeight: 800 }}>C</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '0.9rem' }}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 700, color: 'var(--accent)', fontSize: '0.9rem', flexShrink: 0 }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {links.map(link => (
          <NavLink key={link.path} to={link.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: collapsed ? '0.65rem' : '0.65rem 0.9rem',
              borderRadius: '8px', fontSize: '0.88rem', fontWeight: 500,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              border: isActive ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
              transition: 'all 0.15s', justifyContent: collapsed ? 'center' : 'flex-start',
            })}
          >
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{link.icon}</span>
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', gap: '0.75rem', padding: '0.65rem 0.9rem', color: 'var(--red)' }}>
          <span>⏻</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
