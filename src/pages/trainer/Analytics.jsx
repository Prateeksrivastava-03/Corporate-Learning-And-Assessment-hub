import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import api from '../../utils/api';
import { Spinner } from '../../components/common/UI';
import toast from 'react-hot-toast';

const TT = {
  contentStyle: {
    background: 'var(--navy-mid)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontSize: '0.82rem'
  }
};
const COLORS = ['#00d4ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function TrainerAnalytics() {
  const [overview, setOverview] = useState(null);
  const [courseStats, setCourseStats] = useState(null);
  const [asmtStats, setAsmtStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getOverview(), api.getCourseAnalytics(), api.getAssessmentAnalytics()])
      .then(([o, c, a]) => { setOverview(o.data); setCourseStats(c.data); setAsmtStats(a.data); })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading analytics..." />;

  const { stats } = overview || {};

  const enrollData = courseStats?.enrollmentData?.slice(0, 6).map(c => ({
    name: c.title?.length > 16 ? c.title.slice(0, 16) + '…' : c.title,
    enrolled: c.enrolledCount,
  })) || [];

  const scoreDistData = asmtStats?.scoreDistribution?.map(b => ({
    range: `${b._id}–${+b._id + 19}`,
    students: b.count,
  })) || [];

  const passFailData = [
    { name: 'Passed', value: stats?.passedAssessments || 0 },
    { name: 'Total Attempts', value: (stats?.totalAssessments || 0) * 2 },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Performance insights for your courses and assessments</p>
      </div>

      {/* Summary Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Courses', value: stats?.totalCourses || 0, color: 'var(--accent)' },
          { label: 'Assessments', value: stats?.totalAssessments || 0, color: 'var(--purple)' },
          { label: 'Completions', value: stats?.completedCourses || 0, color: 'var(--green)' },
          { label: 'Certificates', value: stats?.totalCertificates || 0, color: 'var(--gold)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne', fontSize: '2.2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Course Enrollments */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: '1.25rem' }}>Course Enrollments</h3>
          {enrollData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={enrollData} margin={{ bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip {...TT} />
                <Bar dataKey="enrolled" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Enrolled" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Score Distribution */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: '1.25rem' }}>Assessment Score Ranges</h3>
          {scoreDistData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No assessment results yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreDistData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="range" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...TT} />
                <Bar dataKey="students" fill="var(--green)" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Courses Table */}
      {overview?.topCourses?.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: '1.25rem' }}>Top Performing Courses</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Enrolled Students</th>
                </tr>
              </thead>
              <tbody>
                {overview.topCourses.map((c, i) => (
                  <tr key={c._id}>
                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{c.title}</td>
                    <td><span className="badge badge-accent">{c.category}</span></td>
                    <td style={{ color: 'var(--text-dim)' }}>{c.enrolledStudents?.length || 0}</td>
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
