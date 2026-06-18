import React from 'react';

export const Spinner = ({ size = 36, text = '' }) => (
  <div className="loading-screen">
    <div className="spinner" style={{ width: size, height: size }} />
    {text && <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{text}</p>}
  </div>
);

export const EmptyState = ({ icon = '📭', title = 'Nothing here yet', subtitle = '' }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h3 style={{ color: 'var(--text-dim)', fontFamily: 'Syne', marginBottom: '0.5rem' }}>{title}</h3>
    {subtitle && <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{subtitle}</p>}
  </div>
);

export const StatCard = ({ icon, label, value, color = 'var(--accent)', iconBg = 'var(--accent-dim)' }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: iconBg, color }}>{icon}</div>
    <div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export const ProgressBar = ({ value = 0, color = 'var(--accent)' }) => (
  <div className="progress-bar">
    <div className="progress-fill" style={{ width: `${Math.min(100, value)}%`, background: color }} />
  </div>
);

export const Badge = ({ children, variant = 'accent' }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

export const Modal = ({ open, onClose, title, children, actions }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span>{title}</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: '1.2rem', padding: '2px 8px' }}>×</button>
        </div>
        {children}
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
};

export const CourseCard = ({ course, onEnroll, onEdit, onDelete, enrolled, progress, role }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'border-color 0.2s, transform 0.2s' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
      <div>
        <span className="badge badge-accent" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>{course.category}</span>
        <h3 style={{ fontSize: '1rem', fontFamily: 'Syne', fontWeight: 700, lineHeight: 1.3 }}>{course.title}</h3>
      </div>
      <span className={`badge ${course.isPublished ? 'badge-green' : 'badge-gold'}`}>{course.isPublished ? 'Live' : 'Draft'}</span>
    </div>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
      <span>📚 {course.lessons?.length || 0} lessons</span>
      <span>👤 {course.enrolledStudents?.length || 0} enrolled</span>
      <span style={{ textTransform: 'capitalize' }}>⚡ {course.level}</span>
    </div>
    {progress != null && (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Progress</span>
          <span style={{ color: 'var(--accent)' }}>{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>
    )}
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
      {role === 'employee' && !enrolled && <button className="btn btn-primary btn-sm" onClick={() => onEnroll?.(course._id)} style={{ flex: 1 }}>Enroll</button>}
      {role === 'employee' && enrolled && <button className="btn btn-outline btn-sm" style={{ flex: 1 }}>Continue</button>}
      {(role === 'admin' || role === 'trainer') && (
        <>
          <button className="btn btn-outline btn-sm" onClick={() => onEdit?.(course)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete?.(course._id)}>Delete</button>
        </>
      )}
    </div>
  </div>
);
