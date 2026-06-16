import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Spinner, EmptyState, ProgressBar, Badge } from '../../components/common/UI';
import toast from 'react-hot-toast';

// ===== PROGRESS PAGE =====
export function ProgressPage() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyProgress()
      .then(r => setProgress(r.data.progress))
      .catch(() => toast.error('Failed to load progress'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading your progress..." />;

  const completed = progress.filter(p => p.isCompleted).length;
  const totalTime = progress.reduce((s, p) => s + (p.timeSpent || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Learning Progress</h1>
        <p className="page-subtitle">Track your journey across all enrolled courses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {[
          { icon: '📚', label: 'Total Enrolled', value: progress.length, color: 'var(--accent)', bg: 'var(--accent-dim)' },
          { icon: '✅', label: 'Completed', value: completed, color: 'var(--green)', bg: 'var(--green-dim)' },
          { icon: '⏱', label: 'Time Spent (min)', value: totalTime, color: 'var(--gold)', bg: 'var(--gold-dim)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: 'Syne', fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {progress.length === 0 ? (
        <EmptyState icon="📊" title="No progress yet" subtitle="Enroll in a course to start tracking your progress." />
      ) : (
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: '1.25rem' }}>Course Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {progress.map(p => {
              const lessonsTotal = p.lessonsProgress?.length || 0;
              const lessonsDone = p.lessonsProgress?.filter(l => l.completed).length || 0;
              return (
                <div key={p._id} style={{ padding: '1rem', background: 'var(--navy-light)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontFamily: 'Syne', fontSize: '0.95rem', fontWeight: 600 }}>{p.course?.title || 'Course'}</h4>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{p.course?.category} · {lessonsTotal} lessons</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Badge variant={p.isCompleted ? 'green' : p.completionPercentage > 0 ? 'gold' : 'accent'}>
                        {p.isCompleted ? 'Completed' : p.completionPercentage > 0 ? 'In Progress' : 'Not Started'}
                      </Badge>
                      {p.completedAt && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Done {new Date(p.completedAt).toLocaleDateString()}</div>}
                    </div>
                  </div>
                  <div className="flex-between" style={{ marginBottom: '6px', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{lessonsDone}/{lessonsTotal} lessons completed</span>
                    <span style={{ color: p.isCompleted ? 'var(--green)' : 'var(--accent)', fontWeight: 600 }}>{p.completionPercentage}%</span>
                  </div>
                  <ProgressBar value={p.completionPercentage} color={p.isCompleted ? 'var(--green)' : 'var(--accent)'} />
                  {p.timeSpent > 0 && <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>⏱ {p.timeSpent} min spent</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== CERTIFICATES PAGE =====
export function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyCertificates()
      .then(r => setCerts(r.data.certificates))
      .catch(() => toast.error('Failed to load certificates'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading certificates..." />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Certificates</h1>
        <p className="page-subtitle">{certs.length} certificates earned</p>
      </div>

      {certs.length === 0 ? (
        <EmptyState icon="🏆" title="No certificates yet" subtitle="Complete a course and pass its assessment to earn a certificate." />
      ) : (
        <div className="grid-2">
          {certs.map(cert => (
            <div key={cert._id} className="card" style={{
              background: 'linear-gradient(135deg, var(--navy-mid) 0%, var(--surface) 100%)',
              border: '2px solid var(--gold)', position: 'relative', overflow: 'hidden', padding: '2rem',
            }}>
              {/* Decorative corner */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'var(--gold-dim)' }} />
              <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(245,158,11,0.05)' }} />

              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2.5rem' }}>🏆</div>
                  <div style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold)', borderRadius: 6, padding: '3px 10px', fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--gold)', letterSpacing: '0.05em' }}>{cert.certificateId}</div>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Certificate of Completion</div>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1.3 }}>{cert.course?.title}</h3>
                </div>

                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem' }}>{cert.course?.category}</div>

                {cert.score != null && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--green-dim)', color: 'var(--green)', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    ✓ Scored {cert.score}%
                  </div>
                )}

                <div style={{ borderTop: '1px solid rgba(245,158,11,0.2)', paddingTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Issued on {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
