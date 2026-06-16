import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Spinner, EmptyState, Badge, ProgressBar } from '../../components/common/UI';
import toast from 'react-hot-toast';

export default function TrainerStudents() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    api.getAllProgress()
      .then(r => setProgress(r.data.progress))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = progress.filter(p => {
    const name = p.user?.name?.toLowerCase() || '';
    const course = p.course?.title?.toLowerCase() || '';
    const matchSearch = name.includes(search.toLowerCase()) || course.includes(search.toLowerCase());
    if (statusFilter === 'completed') return matchSearch && p.isCompleted;
    if (statusFilter === 'inprogress') return matchSearch && !p.isCompleted && p.completionPercentage > 0;
    if (statusFilter === 'notstarted') return matchSearch && p.completionPercentage === 0;
    return matchSearch;
  });

  if (loading) return <Spinner text="Loading students..." />;

  const uniqueStudents = [...new Map(progress.map(p => [p.user?._id, p.user])).values()].filter(Boolean);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        <p className="page-subtitle">{uniqueStudents.length} students enrolled across all courses</p>
      </div>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Enrollments', value: progress.length, color: 'var(--accent)' },
          { label: 'Completions', value: progress.filter(p => p.isCompleted).length, color: 'var(--green)' },
          { label: 'In Progress', value: progress.filter(p => !p.isCompleted && p.completionPercentage > 0).length, color: 'var(--gold)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne', fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input className="form-input" placeholder="Search by student or course..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
        {[
          { key: 'all', label: 'All' },
          { key: 'completed', label: 'Completed' },
          { key: 'inprogress', label: 'In Progress' },
          { key: 'notstarted', label: 'Not Started' },
        ].map(f => (
          <button key={f.key} className={`btn btn-sm ${statusFilter === f.key ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter(f.key)}>{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="👥" title="No students found" subtitle="Try changing your filters." />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Department</th>
                  <th>Course</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Time Spent</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                          {p.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: '0.88rem' }}>{p.user?.name || '—'}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{p.user?.department || '—'}</td>
                    <td style={{ fontSize: '0.85rem', maxWidth: 180 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.course?.title || '—'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 100 }}>
                        <div style={{ flex: 1 }}><ProgressBar value={p.completionPercentage} color={p.isCompleted ? 'var(--green)' : 'var(--accent)'} /></div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', flexShrink: 0 }}>{p.completionPercentage}%</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={p.isCompleted ? 'green' : p.completionPercentage > 0 ? 'gold' : 'accent'}>
                        {p.isCompleted ? 'Completed' : p.completionPercentage > 0 ? 'In Progress' : 'Not Started'}
                      </Badge>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.timeSpent || 0} min</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(p.lastAccessedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
