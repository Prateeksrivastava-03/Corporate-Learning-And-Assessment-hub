import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Spinner, StatCard, Badge } from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function TrainerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [allProgress, setAllProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCourses(), api.getAssessments(), api.getAllProgress()])
      .then(([c, a, p]) => {
        setCourses(c.data.courses.filter(c => c.instructor?._id === user.id || c.instructor === user.id));
        setAssessments(a.data.assessments);
        setAllProgress(p.data.progress);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading dashboard..." />;

  const totalStudents = [...new Set(allProgress.map(p => p.user?._id))].length;
  const completedCount = allProgress.filter(p => p.isCompleted).length;
  const avgCompletion = allProgress.length > 0
    ? Math.round(allProgress.reduce((s, p) => s + p.completionPercentage, 0) / allProgress.length)
    : 0;

  const recentProgress = allProgress
    .filter(p => p.user && p.course)
    .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))
    .slice(0, 8);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Trainer Dashboard</h1>
        <p className="page-subtitle">Welcome, {user?.name} — here's your training overview</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard icon="📚" label="My Courses" value={courses.length} color="var(--accent)" iconBg="var(--accent-dim)" />
        <StatCard icon="👥" label="Total Students" value={totalStudents} color="var(--purple)" iconBg="rgba(139,92,246,0.15)" />
        <StatCard icon="✅" label="Completions" value={completedCount} color="var(--green)" iconBg="var(--green-dim)" />
        <StatCard icon="📈" label="Avg Completion" value={`${avgCompletion}%`} color="var(--gold)" iconBg="var(--gold-dim)" />
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* My Courses */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: '1rem' }}>My Courses</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/trainer/courses')}>View All →</button>
          </div>
          {courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No courses yet.
              <button className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', display: 'block', margin: '0.75rem auto 0' }} onClick={() => navigate('/trainer/courses')}>Create Course</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {courses.slice(0, 5).map(c => (
                <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'var(--navy-light)', borderRadius: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>📖</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.enrolledStudents?.length || 0} enrolled</div>
                  </div>
                  <Badge variant={c.isPublished ? 'green' : 'gold'}>{c.isPublished ? 'Live' : 'Draft'}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assessments */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: '1rem' }}>Assessments</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/trainer/assessments')}>View All →</button>
          </div>
          {assessments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No assessments yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {assessments.slice(0, 5).map(a => (
                <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'var(--navy-light)', borderRadius: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>📝</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.questions?.length || 0} questions</div>
                  </div>
                  <Badge variant={a.isPublished ? 'green' : 'gold'}>{a.isPublished ? 'Live' : 'Draft'}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Student Activity */}
      <div className="card">
        <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: '1.25rem' }}>Recent Student Activity</h3>
        {recentProgress.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No student activity yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {recentProgress.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 500 }}>{p.user?.name || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.course?.title || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 80, background: 'var(--navy-light)', borderRadius: 999, height: 5, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${p.completionPercentage}%`, background: p.isCompleted ? 'var(--green)' : 'var(--accent)', borderRadius: 999 }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>{p.completionPercentage}%</span>
                      </div>
                    </td>
                    <td><Badge variant={p.isCompleted ? 'green' : p.completionPercentage > 0 ? 'gold' : 'accent'}>{p.isCompleted ? 'Done' : p.completionPercentage > 0 ? 'Active' : 'Started'}</Badge></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(p.lastAccessedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
