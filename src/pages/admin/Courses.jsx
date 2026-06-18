import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Spinner, EmptyState, CourseCard, Modal } from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EMPTY_COURSE = { title: '', description: '', category: '', link: '', videoFile: '', level: 'beginner', duration: 0, passingScore: 70, isPublished: false, tags: '', lessons: [] };

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_COURSE);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [videoFile, setVideoFile] = useState(null);

  const load = () => api.getCourses().then(r => setCourses(r.data.courses)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_COURSE); setEditing(null); setVideoFile(null); setModal(true); };
  const openEdit = (c) => { setForm({ ...c, tags: c.tags?.join(', ') || '' }); setEditing(c._id); setVideoFile(null); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] };
    try {
      if (editing) { await api.updateCourse(editing, payload); toast.success('Course updated'); }
      else { await api.createCourse(payload); toast.success('Course created'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try { await api.deleteCourse(id); toast.success('Course deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const handleVideoUpload = async () => {
    if (!editing) return toast.error('Save the course first');
    if (!videoFile) return toast.error('Select a video file');
    try {
      const res = await api.uploadCourseVideo(editing, videoFile);
      setForm(p => ({ ...p, videoFile: res.data.course.videoFile }));
      toast.success('Video uploaded');
      setVideoFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  const filtered = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Spinner text="Loading courses..." />;

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Course Management</h1>
          <p className="page-subtitle">{courses.length} courses in the platform</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Course</button>
      </div>

      <input className="form-input" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320, marginBottom: '1.5rem' }} />

      {filtered.length === 0 ? <EmptyState icon="📚" title="No courses yet" subtitle="Create your first course to get started." /> : (
        <div className="grid-3">
          {filtered.map(c => <CourseCard key={c._id} course={c} role={user.role} onEdit={openEdit} onDelete={handleDelete} />)}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Course' : 'Create New Course'}
        actions={<>
          <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group"><label className="form-label">Course Title *</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
          <div className="form-group"><label className="form-label">Description *</label><textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Category *</label><input className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Compliance" /></div>
            <div className="form-group">
              <label className="form-label">Level</label>
              <select className="form-input form-select" value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Course Video Link (YouTube)</label><input className="form-input" value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="https://www.youtube.com/watch?v=..." /></div>
          <div className="form-group">
            <label className="form-label">Upload Course Video</label>
            <input className="form-input" type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={handleVideoUpload} disabled={!editing}>Upload Video</button>
              {form.videoFile && <a className="btn btn-ghost btn-sm" href={form.videoFile} target="_blank" rel="noreferrer">View Uploaded</a>}
            </div>
            {!editing && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem' }}>Save the course before uploading a video.</div>}
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Duration (minutes)</label><input className="form-input" type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: +e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Passing Score (%)</label><input className="form-input" type="number" min={0} max={100} value={form.passingScore} onChange={e => setForm(p => ({ ...p, passingScore: +e.target.value }))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Tags (comma-separated)</label><input className="form-input" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="safety, onboarding" /></div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
            <input type="checkbox" id="published" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
            <label htmlFor="published" className="form-label" style={{ margin: 0 }}>Publish immediately</label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
