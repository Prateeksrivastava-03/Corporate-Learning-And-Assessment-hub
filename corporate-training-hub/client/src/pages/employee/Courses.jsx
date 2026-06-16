import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Spinner, EmptyState, Badge, ProgressBar, Modal } from '../../components/common/UI';
import toast from 'react-hot-toast';

export default function EmployeeCourses() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | enrolled | available
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoCourse, setVideoCourse] = useState(null);

  const normalizeUrl = (value) => {
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
  };

  const getEmbedUrl = (value) => {
    const url = normalizeUrl(value);
    if (!url) return '';
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtu.be')) {
        const id = parsed.pathname.replace('/', '');
        return id ? `https://www.youtube.com/embed/${id}` : '';
      }
      if (parsed.hostname.includes('youtube.com')) {
        if (parsed.pathname.startsWith('/embed/')) return url;
        const id = parsed.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : '';
      }
      return url;
    } catch {
      return '';
    }
  };

  const getVideoSource = (course) => {
    if (course?.videoFile) return { type: 'file', src: course.videoFile };
    const embedUrl = getEmbedUrl(course?.link);
    if (embedUrl) return { type: 'embed', src: embedUrl };
    return null;
  };

  useEffect(() => {
    Promise.all([api.getCourses(), api.getMyProgress()])
      .then(([c, p]) => { setCourses(c.data.courses); setProgress(p.data.progress); })
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  const getProgress = (courseId) => progress.find(p => p.course?._id === courseId || p.course === courseId);
  const isEnrolled = (courseId) => !!getProgress(courseId);

  const handleEnroll = async (courseId) => {
    try {
      await api.enrollCourse(courseId);
      toast.success('Enrolled successfully!');
      const [c, p] = await Promise.all([api.getCourses(), api.getMyProgress()]);
      setCourses(c.data.courses);
      setProgress(p.data.progress);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    if (filter === 'enrolled') return matchSearch && isEnrolled(c._id);
    if (filter === 'available') return matchSearch && !isEnrolled(c._id);
    return matchSearch;
  });

  const handleContinue = (course) => {
    const source = getVideoSource(course);
    if (!source) {
      toast.error('Course video is not available');
      return;
    }
    setVideoCourse({ ...course, videoSource: source });
    setVideoOpen(true);
  };

  if (loading) return <Spinner text="Loading courses..." />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Training Courses</h1>
        <p className="page-subtitle">Browse and enroll in available training programs</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input className="form-input" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        {['all', 'enrolled', 'available'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📚" title="No courses found" subtitle="Try adjusting your search or filters." />
      ) : (
        <div className="grid-3">
          {filtered.map(course => {
            const prog = getProgress(course._id);
            const enrolled = !!prog;
            return (
              <div key={course._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'border-color 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <span className="badge badge-accent">{course.category}</span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Badge variant={course.level === 'beginner' ? 'green' : course.level === 'intermediate' ? 'gold' : 'red'}>{course.level}</Badge>
                    </div>
                  </div>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.4rem' }}>{course.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>📖 {course.lessons?.length || 0} lessons</span>
                  <span>⏱ {course.duration || 0} min</span>
                  <span>🎯 {course.passingScore}% to pass</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                  {course.tags?.slice(0, 3).map(tag => (
                    <span key={tag} style={{ background: 'var(--navy-light)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 12, color: 'var(--text-muted)' }}>{tag}</span>
                  ))}
                </div>

                {enrolled && prog && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Your progress</span>
                      <span style={{ color: prog.isCompleted ? 'var(--green)' : 'var(--accent)' }}>
                        {prog.isCompleted ? '✓ Completed' : `${prog.completionPercentage}%`}
                      </span>
                    </div>
                    <ProgressBar value={prog.completionPercentage} color={prog.isCompleted ? 'var(--green)' : 'var(--accent)'} />
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                  {!enrolled ? (
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleEnroll(course._id)}>
                      Enroll Now
                    </button>
                  ) : (
                    <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleContinue(course)}>
                      {prog?.isCompleted ? '✓ Completed' : '▶ Continue Learning'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={videoOpen} onClose={() => setVideoOpen(false)} title={videoCourse?.title || 'Course Video'}>
        <div style={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
          {videoCourse?.videoSource?.type === 'embed' && (
            <iframe
              title="Course video"
              src={videoCourse.videoSource.src}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            />
          )}
          {videoCourse?.videoSource?.type === 'file' && (
            <video
              controls
              src={videoCourse.videoSource.src}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
