import React, { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import { Spinner, EmptyState, Badge } from '../../components/common/UI';
import toast from 'react-hot-toast';

function QuizRunner({ assessment, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(assessment.timeLimit * 60);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());
  const timerRef = useRef(null);
  const submitOnceRef = useRef(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) handleSubmit();
    };
    const handlePageHide = () => handleSubmit();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  const handleSubmit = async () => {
    if (submitOnceRef.current || submitting) return;
    submitOnceRef.current = true;
    clearInterval(timerRef.current);
    setSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    const answerArr = Object.entries(answers).map(([questionId, selectedOption]) => ({ questionId, selectedOption }));
    try {
      const res = await api.submitAssessment(assessment._id, { answers: answerArr, timeTaken });
      onFinish(res.data.result);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      submitOnceRef.current = false;
      setSubmitting(false);
    }
  };

  const q = assessment.questions[current];
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const answered = Object.keys(answers).length;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="flex-between">
          <div>
            <h2 style={{ fontFamily: 'Syne', fontSize: '1.1rem' }}>{assessment.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 2 }}>Question {current + 1} of {assessment.questions.length}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Syne', fontSize: '1.4rem', fontWeight: 700, color: timeLeft < 60 ? 'var(--red)' : 'var(--accent)' }}>{mins}:{secs}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{answered}/{assessment.questions.length} answered</div>
          </div>
        </div>
        {/* Progress */}
        <div style={{ marginTop: '0.75rem', background: 'var(--navy-light)', borderRadius: 999, height: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 999, width: `${((current + 1) / assessment.questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Question */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
          <span style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.82rem', padding: '4px 10px', borderRadius: 20, flexShrink: 0, marginTop: 2 }}>Q{current + 1}</span>
          <p style={{ fontFamily: 'Syne', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.4 }}>{q.question}</p>
        </div>

        {(q.type === 'mcq' || q.type === 'true_false') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {q.options.map((opt, i) => {
              const selected = answers[q._id] === opt.text;
              return (
                <button key={i} onClick={() => setAnswers(p => ({ ...p, [q._id]: opt.text }))}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: 10, border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`, background: selected ? 'var(--accent-dim)' : 'var(--navy-light)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', color: 'var(--text)' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`, background: selected ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                    {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--navy)' }} />}
                  </div>
                  <span style={{ fontSize: '0.9rem' }}>{opt.text}</span>
                </button>
              );
            })}
          </div>
        )}

        {q.type === 'short_answer' && (
          <input className="form-input" placeholder="Type your answer here..." value={answers[q._id] || ''} onChange={e => setAnswers(p => ({ ...p, [q._id]: e.target.value }))} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex-between">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>← Previous</button>
          <button className="btn btn-ghost" onClick={() => window.confirm('Cancel and submit your assessment now?') && handleSubmit()} disabled={submitting}>Cancel Test</button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {current < assessment.questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrent(c => c + 1)}>Next →</button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} style={{ background: 'var(--green)' }}>
              {submitting ? 'Submitting...' : '✓ Submit Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultScreen({ result, assessment, onRetry, onBack }) {
  const { percentage, passed, score, totalPoints, attemptNumber } = result;
  return (
    <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <div className="card" style={{ padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{passed ? '🎉' : '😔'}</div>
        <h2 style={{ fontFamily: 'Syne', fontSize: '1.8rem', marginBottom: '0.5rem', color: passed ? 'var(--green)' : 'var(--red)' }}>{passed ? 'Passed!' : 'Not Passed'}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{passed ? 'Congratulations on completing this assessment.' : `You need ${assessment.passingScore}% to pass. Keep practicing!`}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Your Score', value: `${percentage}%`, color: passed ? 'var(--green)' : 'var(--red)' },
            { label: 'Points Earned', value: `${score}/${totalPoints}`, color: 'var(--accent)' },
            { label: 'Passing Score', value: `${assessment.passingScore}%`, color: 'var(--text-muted)' },
            { label: 'Attempt', value: `#${attemptNumber}`, color: 'var(--text-muted)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--navy-light)', borderRadius: 10, padding: '1rem' }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: s.color }}>{s.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={onBack}>← Back</button>
          {!passed && attemptNumber < assessment.maxAttempts && <button className="btn btn-primary" onClick={onRetry}>Retry</button>}
        </div>
      </div>
    </div>
  );
}

export default function EmployeeAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [result, setResult] = useState(null);

  const load = () => api.getAssessments().then(r => setAssessments(r.data.assessments)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const startAssessment = async (id) => {
    try {
      const res = await api.getAssessment(id);
      setActive(res.data.assessment);
      setResult(null);
    } catch { toast.error('Failed to load assessment'); }
  };

  if (loading) return <Spinner text="Loading assessments..." />;

  if (active && !result) return <QuizRunner assessment={active} onFinish={(r) => setResult(r)} />;
  if (active && result) return <ResultScreen result={result} assessment={active} onRetry={() => { setResult(null); }} onBack={() => { setActive(null); setResult(null); load(); }} />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Assessments</h1>
        <p className="page-subtitle">Test your knowledge and earn certificates</p>
      </div>

      {assessments.length === 0 ? (
        <EmptyState icon="📝" title="No assessments available" subtitle="Check back later for new assessments." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {assessments.map(a => (
            <div key={a._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>📝</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', marginBottom: '0.2rem' }}>{a.title}</h3>
                {a.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>{a.description}</p>}
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>❓ {a.questions?.length || 0} questions</span>
                  <span>⏱ {a.timeLimit} min</span>
                  <span>🎯 {a.passingScore}% to pass</span>
                  <span>🔄 {a.maxAttempts} attempts max</span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => startAssessment(a._id)}>Start →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
