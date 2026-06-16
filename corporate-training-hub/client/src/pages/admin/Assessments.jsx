import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Spinner, EmptyState, Badge, Modal } from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EMPTY = { title: '', description: '', timeLimit: 30, passingScore: 70, maxAttempts: 3, isPublished: false, shuffleQuestions: false, questions: [] };
const EMPTY_Q = { question: '', type: 'mcq', points: 1, explanation: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }], correctAnswer: '' };

export default function AssessmentsPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState('details'); // 'details' | 'questions'

  const load = () => api.getAssessments().then(r => setAssessments(r.data.assessments)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setTab('details'); setModal(true); };
  const openEdit = (a) => { setForm(a); setEditing(a._id); setTab('details'); setModal(true); };

  const addQuestion = () => setForm(p => ({ ...p, questions: [...p.questions, { ...EMPTY_Q, options: EMPTY_Q.options.map(o => ({ ...o })) }] }));
  const removeQuestion = (i) => setForm(p => ({ ...p, questions: p.questions.filter((_, qi) => qi !== i) }));
  const updateQuestion = (i, field, val) => setForm(p => ({ ...p, questions: p.questions.map((q, qi) => qi === i ? { ...q, [field]: val } : q) }));
  const updateOption = (qi, oi, field, val) => setForm(p => ({
    ...p, questions: p.questions.map((q, qidx) => qidx !== qi ? q : {
      ...q, options: q.options.map((o, oidx) => oidx !== oi ? (field === 'isCorrect' ? { ...o, isCorrect: false } : o) : { ...o, [field]: val })
    })
  }));

  const handleSubmit = async () => {
    try {
      if (editing) { await api.updateAssessment(editing, form); toast.success('Updated'); }
      else { await api.createAssessment(form); toast.success('Created'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assessment?')) return;
    try { await api.deleteAssessment(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  if (loading) return <Spinner text="Loading assessments..." />;

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Assessments</h1>
          <p className="page-subtitle">{assessments.length} assessments configured</p>
        </div>
        {(user.role === 'admin' || user.role === 'trainer') && <button className="btn btn-primary" onClick={openCreate}>+ New Assessment</button>}
      </div>

      {assessments.length === 0 ? <EmptyState icon="📝" title="No assessments yet" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {assessments.map(a => (
            <div key={a._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '1rem' }}>{a.title}</h3>
                  <Badge variant={a.isPublished ? 'green' : 'gold'}>{a.isPublished ? 'Published' : 'Draft'}</Badge>
                </div>
                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>❓ {a.questions?.length || 0} questions</span>
                  <span>⏱ {a.timeLimit} min</span>
                  <span>🎯 {a.passingScore}% to pass</span>
                  <span>🔄 Max {a.maxAttempts} attempts</span>
                </div>
              </div>
              {(user.role === 'admin' || user.role === 'trainer') && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Assessment Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Assessment' : 'Create Assessment'}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          {['details', 'questions'].map(t => (
            <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
          ))}
        </div>

        {tab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>
            <div className="grid-3">
              <div className="form-group"><label className="form-label">Time (min)</label><input className="form-input" type="number" value={form.timeLimit} onChange={e => setForm(p => ({ ...p, timeLimit: +e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Pass Score %</label><input className="form-input" type="number" value={form.passingScore} onChange={e => setForm(p => ({ ...p, passingScore: +e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Max Attempts</label><input className="form-input" type="number" value={form.maxAttempts} onChange={e => setForm(p => ({ ...p, maxAttempts: +e.target.value }))} /></div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} style={{ accentColor: 'var(--accent)' }} />
                Publish
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.shuffleQuestions} onChange={e => setForm(p => ({ ...p, shuffleQuestions: e.target.checked }))} style={{ accentColor: 'var(--accent)' }} />
                Shuffle Questions
              </label>
            </div>
          </div>
        )}

        {tab === 'questions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: 400, overflowY: 'auto', paddingRight: '0.25rem' }}>
            {form.questions.map((q, qi) => (
              <div key={qi} style={{ background: 'var(--navy-light)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent)' }}>Q{qi + 1}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => removeQuestion(qi)}>Remove</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <input className="form-input" placeholder="Question text" value={q.question} onChange={e => updateQuestion(qi, 'question', e.target.value)} style={{ fontSize: '0.85rem' }} />
                  <div className="grid-2">
                    <select className="form-input form-select" value={q.type} onChange={e => updateQuestion(qi, 'type', e.target.value)} style={{ fontSize: '0.82rem' }}>
                      <option value="mcq">Multiple Choice</option>
                      <option value="true_false">True/False</option>
                      <option value="short_answer">Short Answer</option>
                    </select>
                    <input className="form-input" type="number" placeholder="Points" value={q.points} onChange={e => updateQuestion(qi, 'points', +e.target.value)} style={{ fontSize: '0.82rem' }} />
                  </div>
                  {(q.type === 'mcq' || q.type === 'true_false') && q.options.slice(0, q.type === 'true_false' ? 2 : 4).map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="radio" name={`correct-${qi}`} checked={opt.isCorrect} onChange={() => updateOption(qi, oi, 'isCorrect', true)} style={{ accentColor: 'var(--green)', flexShrink: 0 }} />
                      <input className="form-input" value={opt.text} onChange={e => updateOption(qi, oi, 'text', e.target.value)} placeholder={q.type === 'true_false' ? (oi === 0 ? 'True' : 'False') : `Option ${oi + 1}`} style={{ fontSize: '0.82rem' }} />
                    </div>
                  ))}
                  {q.type === 'short_answer' && <input className="form-input" placeholder="Correct answer" value={q.correctAnswer} onChange={e => updateQuestion(qi, 'correctAnswer', e.target.value)} style={{ fontSize: '0.82rem' }} />}
                </div>
              </div>
            ))}
            <button className="btn btn-outline btn-sm" onClick={addQuestion} style={{ width: '100%', justifyContent: 'center' }}>+ Add Question</button>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</button>
        </div>
      </Modal>
    </div>
  );
}
