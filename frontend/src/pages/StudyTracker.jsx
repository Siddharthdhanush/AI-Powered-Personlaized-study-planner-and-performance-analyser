import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function StudyTracker() {
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [aiContent, setAiContent] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, timeRes] = await Promise.all([
          api.get('/syllabus/subjects'),
          api.get('/planning/timetable')
        ]);
        setSubjects(subRes.data);
        setTimetable(timeRes.data);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  // Calculate per-subject stats
  const getSubjectStats = (subject) => {
    const topicIds = subject.topics.map(t => t.topic_id);
    const subSessions = timetable.filter(s => topicIds.includes(s.topic_id));
    const completed = subSessions.filter(s => s.is_completed);
    const totalMinutes = completed.reduce((sum, s) => sum + (s.planned_minutes || 0), 0);
    const completionPct = subSessions.length > 0
      ? Math.round((completed.length / subSessions.length) * 100)
      : 0;
    return { total: subSessions.length, completed: completed.length, completionPct, totalMinutes };
  };

  // Get sessions for a specific topic
  const getTopicSessions = (topicId) => {
    return timetable.filter(s => s.topic_id === topicId);
  };

  const handleAIAction = async (type, topicId) => {
    setAiLoading(true);
    setAiContent(null);
    try {
      const res = await api.post(`/ai/${type}/${topicId}`);
      setAiContent({ type, data: res.data });
    } catch (err) {
      alert(err.response?.data?.detail || `Failed to generate ${type}. Is Ollama running?`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubjectAI = async (type, payload) => {
    setAiLoading(true);
    setAiContent(null);
    try {
      const res = await api.post(`/ai/${type}`, payload);
      setAiContent({ type, data: res.data });
    } catch (err) {
      alert(err.response?.data?.detail || `Failed to generate ${type}. Is Ollama running?`);
    } finally {
      setAiLoading(false);
    }
  };

  const activeSubObj = subjects.find(s => s.subject_id === activeSubject);

  return (
    <div>
      <h1 style={{marginBottom: '32px'}}>Study Tracker</h1>

      <div className="grid grid-cols-2">
        {/* Left: Subjects Overview */}
        <div className="glass-panel" style={{alignSelf: 'start'}}>
          <h2>Subjects Overview</h2>

          {subjects.length === 0 ? (
            <div style={{background: '#f9fafb', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center'}}>
              <p>No subjects yet! Add some in the Syllabus Manager.</p>
              <button className="btn" onClick={() => navigate('/syllabus')} style={{marginTop: '12px'}}>
                Go to Syllabus Manager
              </button>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {subjects.map(sub => {
                const stats = getSubjectStats(sub);
                const isActive = activeSubject === sub.subject_id;
                return (
                  <div
                    key={sub.subject_id}
                    onClick={() => setActiveSubject(isActive ? null : sub.subject_id)}
                    style={{
                      background: isActive ? '#eff6ff' : '#fff',
                      padding: '16px',
                      borderRadius: '12px',
                      border: isActive ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                      <h3 style={{margin: 0, fontSize: '1.1rem'}}>{sub.subject_name}</h3>
                      <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                        {sub.topics?.length || 0} topics
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{background: '#e5e7eb', borderRadius: '999px', height: '8px', overflow: 'hidden', marginBottom: '8px'}}>
                      <div style={{
                        background: stats.completionPct >= 80 ? 'var(--success-color)' : stats.completionPct >= 40 ? 'var(--accent-color)' : '#f59e0b',
                        height: '100%',
                        width: `${stats.completionPct}%`,
                        borderRadius: '999px',
                        transition: 'width 0.5s'
                      }} />
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                      <span>{stats.completionPct}% complete</span>
                      <span>{stats.totalMinutes} min studied</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Overall Stats */}
          {timetable.length > 0 && (
            <div style={{marginTop: '24px', padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0'}}>
              <h3 style={{margin: '0 0 8px 0', fontSize: '1rem', color: '#166534'}}>Overall Progress</h3>
              <div style={{display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
                <div>
                  <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#166534'}}>{timetable.filter(s => s.is_completed).length}</div>
                  <div style={{fontSize: '0.8rem', color: '#15803d'}}>Completed</div>
                </div>
                <div>
                  <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#b45309'}}>{timetable.filter(s => !s.is_completed).length}</div>
                  <div style={{fontSize: '0.8rem', color: '#92400e'}}>Pending</div>
                </div>
                <div>
                  <div style={{fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-color)'}}>
                    {timetable.filter(s => s.is_completed).reduce((sum, s) => sum + (s.planned_minutes || 0), 0)} min
                  </div>
                  <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Total Study</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Topic Detail + AI Tools */}
        <div className="glass-panel" style={{alignSelf: 'start'}}>
          {!activeSubObj ? (
            <div style={{textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)'}}>
              <p style={{fontSize: '1.1rem'}}>Select a subject to see topic-level progress and AI tools.</p>
            </div>
          ) : (
            <>
              <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px'}}>
                <span style={{color: 'var(--accent-color)'}}>{activeSubObj.subject_name}</span> — Topics
              </h2>

              {(!activeSubObj.topics || activeSubObj.topics.length === 0) ? (
                <div style={{background: '#fefce8', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a', textAlign: 'center'}}>
                  <p style={{margin: 0}}>No topics yet! Use "Extract Topics with AI" in Syllabus Manager or add them manually.</p>
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  {activeSubObj.topics.map(topic => {
                    const sessions = getTopicSessions(topic.topic_id);
                    const completedSessions = sessions.filter(s => s.is_completed);
                    const topicPct = sessions.length > 0
                      ? Math.round((completedSessions.length / sessions.length) * 100)
                      : 0;

                    return (
                      <div key={topic.topic_id} style={{
                        background: '#fff',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                      }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                          <h4 style={{margin: 0, fontSize: '1rem'}}>{topic.topic_name}</h4>
                          <span className={`badge ${topicPct === 100 ? 'badge-success' : topicPct > 0 ? 'badge-warning' : ''}`}
                            style={{fontSize: '0.75rem', padding: '2px 8px'}}>
                            {topicPct === 100 ? 'Done' : topicPct > 0 ? `${topicPct}%` : 'Not Started'}
                          </span>
                        </div>

                        {/* Topic progress bar */}
                        <div style={{background: '#e5e7eb', borderRadius: '999px', height: '6px', overflow: 'hidden', marginBottom: '8px'}}>
                          <div style={{
                            background: topicPct === 100 ? 'var(--success-color)' : 'var(--accent-color)',
                            height: '100%',
                            width: `${topicPct}%`,
                            borderRadius: '999px',
                            transition: 'width 0.5s'
                          }} />
                        </div>

                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px'}}>
                          <span>Difficulty: {topic.difficulty_weight}/5</span>
                          <span>Est. {topic.estimated_hours}h</span>
                          <span>{completedSessions.length}/{sessions.length} sessions</span>
                        </div>

                        {/* AI Action Buttons */}
                        <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
                          <button
                            className="btn"
                            style={{padding: '4px 10px', fontSize: '0.75rem', background: '#6366f1'}}
                            disabled={aiLoading}
                            onClick={() => handleAIAction('summary', topic.topic_id)}
                          >
                            Summary
                          </button>
                          <button
                            className="btn"
                            style={{padding: '4px 10px', fontSize: '0.75rem', background: '#0ea5e9'}}
                            disabled={aiLoading}
                            onClick={() => handleAIAction('flashcards', topic.topic_id)}
                          >
                            Flashcards
                          </button>
                          <button
                            className="btn"
                            style={{padding: '4px 10px', fontSize: '0.75rem', background: '#f59e0b'}}
                            disabled={aiLoading}
                            onClick={() => handleAIAction('hints', topic.topic_id)}
                          >
                            Hints
                          </button>
                          <button
                            className="btn"
                            style={{padding: '4px 10px', fontSize: '0.75rem', background: '#8b5cf6'}}
                            disabled={aiLoading}
                            onClick={() => handleAIAction('explanation', topic.topic_id)}
                          >
                            Explain
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* AI Content Display Panel */}
              {aiLoading && (
                <div style={{marginTop: '24px', padding: '24px', background: '#f9fafb', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center'}}>
                  <p style={{fontSize: '1.1rem', color: 'var(--accent-color)'}}>Generating with Llama 3... This may take 15-30 seconds.</p>
                </div>
              )}

              {aiContent && !aiLoading && (
                <div style={{marginTop: '24px', padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                    <h3 style={{margin: 0, fontSize: '1rem'}}>
                      {aiContent.type === 'summary' && 'AI Summary'}
                      {aiContent.type === 'flashcards' && 'AI Flashcards'}
                      {aiContent.type === 'hints' && 'AI Study Hints'}
                      {aiContent.type === 'explanation' && 'AI Explanation'}
                      {aiContent.type === 'study-strategy' && 'AI Study Strategy'}
                      {aiContent.type === 'wellness' && 'Wellness Tip'}
                      {aiContent.type === 'mocktest' && 'Mock Test'}
                      {aiContent.data.topic_name ? ` — ${aiContent.data.topic_name}` : ''}
                    </h3>
                    <button onClick={() => setAiContent(null)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-secondary)'}}>x</button>
                  </div>

                  {/* Summary */}
                  {aiContent.type === 'summary' && (
                    <div style={{lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-wrap'}}>{aiContent.data.summary}</div>
                  )}

                  {/* Flashcards */}
                  {aiContent.type === 'flashcards' && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                      {aiContent.data.flashcards.map((card, i) => (
                        <FlashcardWidget key={i} front={card.front} back={card.back} index={i} />
                      ))}
                    </div>
                  )}

                  {/* Hints */}
                  {aiContent.type === 'hints' && (
                    <ul style={{paddingLeft: '20px', lineHeight: 1.8}}>
                      {aiContent.data.hints.map((hint, i) => (
                        <li key={i} style={{fontSize: '0.95rem', marginBottom: '6px'}}>{hint}</li>
                      ))}
                    </ul>
                  )}

                  {/* Explanation */}
                  {aiContent.type === 'explanation' && (
                    <div style={{lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-wrap'}}>{aiContent.data.explanation}</div>
                  )}

                  {/* Study Strategy */}
                  {aiContent.type === 'study-strategy' && aiContent.data && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                      <p style={{fontSize: '0.95rem', lineHeight: 1.6, fontStyle: 'italic'}}>{aiContent.data.strategy_summary}</p>
                      
                      {aiContent.data.topic_order?.length > 0 && (
                        <div>
                          <h4 style={{margin: '0 0 8px 0', fontSize: '0.9rem'}}>Recommended Study Order:</h4>
                          <ol style={{paddingLeft: '20px', margin: 0}}>
                            {aiContent.data.topic_order.map((t, i) => <li key={i} style={{marginBottom: '4px'}}>{t}</li>)}
                          </ol>
                        </div>
                      )}

                      {aiContent.data.time_allocation?.length > 0 && (
                        <div>
                          <h4 style={{margin: '0 0 8px 0', fontSize: '0.9rem'}}>Time Allocation:</h4>
                          {aiContent.data.time_allocation.map((a, i) => (
                            <div key={i} style={{padding: '8px 12px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '6px'}}>
                              <strong>{a.topic}</strong> — {a.hours}h {a.technique && `(${a.technique})`}
                            </div>
                          ))}
                        </div>
                      )}

                      {aiContent.data.revision_tips?.length > 0 && (
                        <div>
                          <h4 style={{margin: '0 0 8px 0', fontSize: '0.9rem'}}>Revision Tips:</h4>
                          <ul style={{paddingLeft: '20px', margin: 0}}>
                            {aiContent.data.revision_tips.map((t, i) => <li key={i} style={{marginBottom: '4px'}}>{t}</li>)}
                          </ul>
                        </div>
                      )}

                      {aiContent.data.motivation && (
                        <div style={{padding: '12px', background: '#fef3c7', borderRadius: '8px', textAlign: 'center', fontStyle: 'italic'}}>
                          {aiContent.data.motivation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Wellness */}
                  {aiContent.type === 'wellness' && aiContent.data && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      <div style={{fontSize: '2rem', textAlign: 'center'}}>{aiContent.data.mood_emoji || '😊'}</div>
                      <div style={{padding: '12px', background: '#ecfdf5', borderRadius: '8px'}}>
                        <strong>Wellness Tip:</strong> {aiContent.data.wellness_tip}
                      </div>
                      <div style={{padding: '12px', background: '#fef3c7', borderRadius: '8px', fontStyle: 'italic', textAlign: 'center'}}>
                        "{aiContent.data.motivation_quote}"
                      </div>
                      <div style={{padding: '12px', background: '#eff6ff', borderRadius: '8px'}}>
                        <strong>Break Activity:</strong> {aiContent.data.break_activity}
                      </div>
                      <div style={{padding: '12px', background: '#fef2f2', borderRadius: '8px'}}>
                        <strong>Health:</strong> {aiContent.data.health_reminder}
                      </div>
                    </div>
                  )}

                  {/* Mock Test */}
                  {aiContent.type === 'mocktest' && aiContent.data?.questions && (
                    <MockTestPanel questions={aiContent.data.questions} />
                  )}
                </div>
              )}

              {/* Subject-Level AI Actions */}
              {activeSubObj.topics?.length > 0 && (
                <div style={{marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                  <button className="btn" style={{fontSize: '0.85rem', background: '#059669'}} disabled={aiLoading}
                    onClick={() => handleSubjectAI('mocktest', { subject_id: activeSubObj.subject_id, num_questions: 10 })}>
                    Generate Mock Test
                  </button>
                  <button className="btn" style={{fontSize: '0.85rem', background: '#7c3aed'}} disabled={aiLoading}
                    onClick={() => handleSubjectAI('study-strategy', { subject_id: activeSubObj.subject_id, days_until_exam: 14, hours_per_day: 3 })}>
                    AI Study Strategy
                  </button>
                  <button className="btn" style={{fontSize: '0.85rem', background: '#ec4899'}} disabled={aiLoading}
                    onClick={() => handleSubjectAI('wellness', { study_hours_today: 2, days_until_exam: 14 })}>
                    Wellness Tip
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple flip-card component
function FlashcardWidget({ front, back, index }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      onClick={() => setFlipped(!flipped)}
      style={{
        background: flipped ? '#dcfce7' : '#fff',
        padding: '14px 16px',
        borderRadius: '10px',
        border: '1px solid ' + (flipped ? '#86efac' : 'var(--border-color)'),
        cursor: 'pointer',
        transition: 'all 0.3s'
      }}
    >
      <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px'}}>
        Card {index + 1} — {flipped ? 'Answer' : 'Click to flip'}
      </div>
      <div style={{fontSize: '0.95rem', fontWeight: flipped ? 400 : 600}}>
        {flipped ? back : front}
      </div>
    </div>
  );
}

// Mock Test Component
function MockTestPanel({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIdx, option) => {
    if (submitted) return;
    setAnswers({ ...answers, [qIdx]: option });
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const getCorrectCount = () => {
    let count = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_option) {
        count++;
      }
    });
    return count;
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <h4 style={{ marginBottom: '16px' }}>Mock Test Questions</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {questions.map((q, idx) => {
          const selected = answers[idx];
          const isCorrect = selected === q.correct_option;
          return (
            <div key={idx} style={{ padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Question {idx + 1} ({q.difficulty})</span>
                {q.topic && <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)' }}>{q.topic}</span>}
              </div>
              <p style={{ fontWeight: 600, margin: '0 0 12px 0' }}>{q.question_text}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['A', 'B', 'C', 'D'].map(opt => {
                  const label = opt === 'A' ? q.option_a : opt === 'B' ? q.option_b : opt === 'C' ? q.option_c : q.option_d;
                  const isOptSelected = selected === opt;
                  
                  let bg = '#fff';
                  let border = '1px solid var(--border-color)';
                  if (submitted) {
                    if (opt === q.correct_option) {
                      bg = '#dcfce7';
                      border = '1px solid #86efac';
                    } else if (isOptSelected && !isCorrect) {
                      bg = '#fee2e2';
                      border = '1px solid #fca5a5';
                    }
                  } else if (isOptSelected) {
                    bg = '#eff6ff';
                    border = '2px solid var(--accent-color)';
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelect(idx, opt)}
                      disabled={submitted}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        background: bg,
                        border: border,
                        borderRadius: '6px',
                        cursor: submitted ? 'default' : 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <strong>{opt}.</strong> {label}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div style={{ marginTop: '12px', padding: '10px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: isCorrect ? 'var(--success-color)' : 'var(--danger-color)' }}>
                    {isCorrect ? 'Correct! ' : 'Incorrect. '}
                  </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="btn"
          style={{ marginTop: '20px', width: '100%', background: 'var(--success-color)' }}
        >
          Submit Mock Test
        </button>
      ) : (
        <div style={{ marginTop: '20px', padding: '16px', background: '#eff6ff', borderRadius: '8px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--accent-color)' }}>Mock Test Completed</h3>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            Score: <strong>{getCorrectCount()} / {questions.length}</strong> ({Math.round((getCorrectCount() / questions.length) * 100)}%)
          </p>
        </div>
      )}
    </div>
  );
}

export default StudyTracker;
