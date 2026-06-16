import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../utils/api';
import { Spinner, StatCard, Badge } from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const COLORS = ['#00d4ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([api.getOverview(), api.getUserAnalytics()])
      .then(([o, u]) => { setData(o.data); setUserStats(u.data); })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading dashboard..." />;

  const { stats, recentActivity = [], topCourses = [] } = data || {};
  const roleData = userStats?.usersByRole?.map(r => ({ name: r._id, value: r.count })) || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name} — here's your platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard icon="👥" label="Total Users" value={stats?.totalUsers || 0} color="var(--accent)" iconBg="var(--accent-dim)" />
        <StatCard icon="📚" label="Active Courses" value={stats?.totalCourses || 0} color="var(--purple)" iconBg="rgba(139,92,246,0.15)" />
        <StatCard icon="✦" label="Certificates Issued" value={stats?.totalCertificates || 0} color="var(--gold)" iconBg="var(--gold-dim)" />
        <StatCard icon="✅" label="Assessments Passed" value={stats?.passedAssessments || 0} color="var(--green)" iconBg="var(--green-dim)" />
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Top Courses */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: '1.25rem' }}>Top Enrolled Courses</h3>
          {topCourses.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No courses yet</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topCourses.map((c, i) => (
                <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.category}</div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>{c.enrolledStudents?.length || 0} enrolled</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Roles */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: '1.25rem' }}>Users by Role</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--navy-mid)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: '1.25rem' }}>Recent Assessment Activity</h3>
        {recentActivity.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No activity yet</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Assessment</th><th>Score</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {recentActivity.map(r => (
                  <tr key={r._id}>
                    <td><span style={{ fontWeight: 500 }}>{r.user?.name || 'Unknown'}</span></td>
                    <td style={{ color: 'var(--text-dim)' }}>{r.assessment?.title || 'N/A'}</td>
                    <td><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{r.percentage}%</span></td>
                    <td><Badge variant={r.passed ? 'green' : 'red'}>{r.passed ? 'Passed' : 'Failed'}</Badge></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(r.submittedAt).toLocaleDateString()}</td>
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
