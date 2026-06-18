import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Spinner, StatCard, ProgressBar, Badge } from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMyProgress(), api.getMyCertificates(), api.getAssessments()])
      .then(([p, c, a]) => {
        setProgress(p.data.progress);
        setCertificates(c.data.certificates);
        setAssessments(a.data.assessments);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading your dashboard..." />;

  const completed = progress.filter(p => p.isCompleted).length;
  const inProgress = progress.filter(p => !p.isCompleted && p.completionPercentage > 0).length;
  const avgProgress = progress.length > 0 ? Math.round(progress.reduce((s, p) => s + p.completionPercentage, 0) / progress.length) : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Track your learning journey and achievements</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard icon="📚" label="Enrolled Courses" value={progress.length} color="var(--accent)" iconBg="var(--accent-dim)" />
        <StatCard icon="✅" label="Completed" value={completed} color="var(--green)" iconBg="var(--green-dim)" />
        <StatCard icon="⚡" label="In Progress" value={inProgress} color="var(--gold)" iconBg="var(--gold-dim)" />
        <StatCard icon="🏆" label="Certificates" value={certificates.length} color="var(--purple)" iconBg="rgba(139,92,246,0.15)" />
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Continue Learning */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: '1rem' }}>Continue Learning</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/employee/courses')}>View All →</button>
          </div>
          {progress.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
              <p style={{ fontSize: '0.85rem' }}>No courses enrolled yet</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => navigate('/employee/courses')}>Browse Courses</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {progress.slice(0, 4).map(p => (
                <div key={p._id}>
                  <div className="flex-between" style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{p.course?.title || 'Course'}</span>
                    <span style={{ fontSize: '0.78rem', color: p.isCompleted ? 'var(--green)' : 'var(--accent)' }}>
                      {p.isCompleted ? '✓ Done' : `${p.completionPercentage}%`}
                    </span>
                  </div>
                  <ProgressBar value={p.completionPercentage} color={p.isCompleted ? 'var(--green)' : 'var(--accent)'} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Assessments */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: '1rem' }}>Available Assessments</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/employee/assessments')}>View All →</button>
          </div>
          {assessments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No assessments available</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {assessments.slice(0, 4).map(a => (
                <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'var(--navy-light)', borderRadius: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>📝</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.questions?.length || 0} questions · {a.timeLimit} min</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/employee/assessments')}>Take</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Certificates */}
      {certificates.length > 0 && (
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: '1rem' }}>Recent Certificates</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/employee/certificates')}>View All →</button>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {certificates.slice(0, 3).map(cert => (
              <div key={cert._id} style={{ background: 'var(--navy-light)', border: '1px solid var(--gold)', borderRadius: 10, padding: '1rem', minWidth: 200, textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>🏆</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.2rem' }}>{cert.course?.title}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--gold)', fontFamily: 'monospace' }}>{cert.certificateId}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
