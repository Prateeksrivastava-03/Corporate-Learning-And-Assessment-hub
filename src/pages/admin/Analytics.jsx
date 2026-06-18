import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';
import { Spinner, EmptyState, Badge } from '../../components/common/UI';
import toast from 'react-hot-toast';

// ===== CERTIFICATES =====
export function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllCertificates().then(r => setCerts(r.data.certificates)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading certificates..." />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Certificates Issued</h1>
        <p className="page-subtitle">{certs.length} certificates have been awarded</p>
      </div>
      {certs.length === 0 ? <EmptyState icon="🏆" title="No certificates yet" subtitle="Certificates are issued when employees complete courses." /> : (
        <div className="grid-3">
          {certs.map(cert => (
            <div key={cert._id} className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--navy-mid), var(--surface))', border: '1px solid var(--gold)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: 'var(--gold-dim)', borderRadius: '0 0 0 80px' }} />
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏆</div>
              <div style={{ fontFamily: 'Syne', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>{cert.user?.name || 'Unknown'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{cert.user?.department || ''}</div>
              <div style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{cert.course?.title || 'N/A'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>{cert.course?.category}</div>
              {cert.score != null && <div style={{ color: 'var(--green)', fontSize: '0.82rem', marginBottom: '0.5rem' }}>Score: {cert.score}%</div>}
              <div style={{ background: 'var(--gold-dim)', color: 'var(--gold)', fontSize: '0.72rem', padding: '3px 8px', borderRadius: 6, display: 'inline-block', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{cert.certificateId}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.5rem' }}>{new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== ANALYTICS =====
const COLORS = ['#00d4ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
const TT = { contentStyle: { background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: '0.82rem' } };

export function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [courseStats, setCourseStats] = useState(null);
  const [asmtStats, setAsmtStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getOverview(), api.getUserAnalytics(), api.getCourseAnalytics(), api.getAssessmentAnalytics()])
      .then(([o, u, c, a]) => { setOverview(o.data); setUserStats(u.data); setCourseStats(c.data); setAsmtStats(a.data); })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading analytics..." />;

  const roleData = userStats?.usersByRole?.map(r => ({ name: r._id, value: r.count })) || [];
  const deptData = userStats?.usersByDept?.filter(d => d._id).map(d => ({ name: d._id, value: d.count })) || [];
  const enrollData = courseStats?.enrollmentData?.slice(0, 8).map(c => ({ name: c.title?.slice(0, 20), enrolled: c.enrolledCount })) || [];
  const scoreData = asmtStats?.scoreDistribution?.map(b => ({ range: `${b._id}–${+b._id + 19}%`, count: b.count })) || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Platform-wide insights and performance data</p>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: '1.25rem' }}>Users by Role</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${value}`} fontSize={11}>
              {roleData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie><Tooltip {...TT} /></PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: '1.25rem' }}>Users by Department</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData} margin={{ bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip {...TT} />
              <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: '1.25rem' }}>Top Course Enrollments</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={enrollData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} width={100} />
              <Tooltip {...TT} />
              <Bar dataKey="enrolled" fill="var(--purple)" radius={[0, 4, 4, 0]} name="Enrolled" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: '1.25rem' }}>Assessment Score Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="range" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip {...TT} />
              <Bar dataKey="count" fill="var(--green)" radius={[4, 4, 0, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
