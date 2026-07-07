import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

function QuizSession() {
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [quizStatus, setQuizStatus] = useState('IDLE'); // IDLE, GENERATING, READY, SUBMITTING, DONE
  
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { question_id: "A" }
  const [score, setScore] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, timeRes] = await Promise.all([
          api.get('/syllabus/subjects'),
          api.get('/planning/timetable')
        ]);
        setSubjects(subRes.data);
        setTimetable(timeRes.data);
        
        // If topicIds list is passed in state, auto-generate the multi-topic adaptive quiz immediately
        if (location.state && location.state.topicIds) {
          const tIds = location.state.topicIds;
          setSelectedTopics(tIds.map(String));
          setQuizStatus('GENERATING');
          
          // Clear history state so that browser refresh or resetting does not re-trigger auto-generation
          navigate(location.pathname, { replace: true, state: {} });
          
          try {
            const quizRes = await api.post('/ai/quiz/generate', { topic_ids: tIds });
            setQuestions(quizRes.data.questions);
            setQuizStatus('READY');
            setAnswers({});
          } catch (err) {
            alert(err.response?.data?.detail || 'Failed to auto-generate adaptive quiz. Is Ollama running?');
            setQuizStatus('IDLE');
          }
        } else if (location.state && location.state.topicId) {
          // Fallback if a single topicId is passed
          const tId = location.state.topicId.toString();
          setSelectedTopics([tId]);
          setQuizStatus('GENERATING');
          
          // Clear history state
          navigate(location.pathname, { replace: true, state: {} });
          
          try {
            const quizRes = await api.post('/ai/quiz/generate', { topic_ids: [parseInt(tId)] });
            setQuestions(quizRes.data.questions);
            setQuizStatus('READY');
            setAnswers({});
          } catch (err) {
            alert(err.response?.data?.detail || 'Failed to auto-generate quiz. Is Ollama running?');
            setQuizStatus('IDLE');
          }
        }
      } catch (err) {
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate, location]);

  const handleGenerateQuiz = async () => {
    if (selectedTopics.length === 0) return;
    setQuizStatus('GENERATING');
    try {
      const res = await api.post('/ai/quiz/generate', { topic_ids: selectedTopics.map(id => parseInt(id)) });
      setQuestions(res.data.questions);
      setQuizStatus('READY');
      setAnswers({});
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to generate quiz. Make sure Ollama is running!');
      setQuizStatus('IDLE');
    }
  };

  const handleSelectAnswer = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSelectMultiAnswer = (qId, option) => {
    const currentVal = answers[qId] || '';
    let selected = currentVal ? currentVal.split(',') : [];
    if (selected.includes(option)) {
      selected = selected.filter(o => o !== option);
    } else {
      selected.push(option);
    }
    selected.sort();
    setAnswers(prev => ({ ...prev, [qId]: selected.join(',') }));
  };

  const handleSubmitQuiz = async () => {
    setQuizStatus('SUBMITTING');
    const submissionData = {
      topic_id: selectedTopics.length > 0 ? parseInt(selectedTopics[0]) : null,
      answers: questions.map(q => ({
        question_id: q.question_id,
        selected_option: answers[q.question_id] || null,
        response_time: 15.0, // Hardcoded for MVP, ideally tracked in frontend
        is_skipped: !answers[q.question_id]
      }))
    };

    try {
      const res = await api.post('/ai/assessment/submit', submissionData);
      setScore(res.data.score);
      setQuizStatus('DONE');
    } catch (err) {
      alert('Failed to submit assessment');
      setQuizStatus('READY');
    }
  };

  const getTopicName = (topicId) => {
    for (let s of subjects) {
      const t = s.topics.find(t => t.topic_id === topicId);
      if (t) return t.topic_name;
    }
    return `Topic #${topicId}`;
  };

  const completedTopicIds = Array.from(new Set(
    timetable.filter(s => s.is_completed).map(s => s.topic_id)
  ));

  return (
    <div style={{maxWidth: '800px', margin: '0 auto'}}>
      <h1 style={{marginBottom: '32px'}}>🧠 AI Quiz Engine</h1>

      {quizStatus === 'IDLE' && (
        <div className="glass-panel">
          <h2>Select Topics</h2>
          <p>Choose one or more topics to generate a custom adaptive quiz. Topics you have completed study sessions for are highlighted.</p>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0'}}>
            {subjects.map(subject => (
              <div key={subject.subject_id} style={{border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', background: '#fff'}}>
                <h3 style={{margin: '0 0 12px 0', color: 'var(--accent-color)', fontSize: '1.05rem'}}>{subject.subject_name}</h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                  {subject.topics.map(t => {
                    const isCompleted = completedTopicIds.includes(t.topic_id);
                    const isChecked = selectedTopics.includes(t.topic_id.toString());
                    return (
                      <label 
                        key={t.topic_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: isChecked ? '#eff6ff' : '#f9fafb',
                          border: `1px solid ${isChecked ? 'var(--accent-color)' : 'var(--border-color)'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTopics([...selectedTopics, t.topic_id.toString()]);
                            } else {
                              setSelectedTopics(selectedTopics.filter(id => id !== t.topic_id.toString()));
                            }
                          }}
                          style={{accentColor: 'var(--accent-color)'}}
                        />
                        <span style={{flex: 1}}>{t.topic_name}</span>
                        {isCompleted && (
                          <span style={{fontSize: '0.7rem', padding: '2px 6px', background: '#10b981', color: '#fff', borderRadius: '4px', fontWeight: 600}}>
                            Completed
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button 
            className="btn" 
            onClick={handleGenerateQuiz} 
            disabled={selectedTopics.length === 0} 
            style={{width: '100%', padding: '12px'}}
          >
            ✨ Generate Adaptive Quiz ({selectedTopics.length} Topics selected)
          </button>
        </div>
      )}

      {quizStatus === 'GENERATING' && (
        <div className="glass-panel flex-center" style={{flexDirection: 'column', height: '200px'}}>
          <div style={{fontSize: '3rem', marginBottom: '16px'}}>🤖</div>
          <h3>Ollama is generating your quiz...</h3>
          <p>This may take a minute depending on your local hardware.</p>
        </div>
      )}

      {quizStatus === 'READY' && (
        <div className="glass-panel">
          <h2 style={{marginBottom: '24px'}}>Quiz Time!</h2>
          
          {questions.map((q, idx) => {
            const isFIB = q.question_type === 'FIB';
            const isDescriptive = q.question_type === 'DESCRIPTIVE';
            
            return (
              <div key={q.question_id} style={{marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)'}}>
                <h3 style={{fontSize: '1.1rem', marginBottom: '16px'}}>
                  <span style={{color: 'var(--accent-color)', marginRight: '8px'}}>Q{idx + 1}.</span> 
                  {q.question_text}
                  <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '8px', padding: '2px 6px', background: '#e5e7eb', borderRadius: '4px', display: 'inline-block'}}>
                    {q.question_type || 'MCQ'}
                  </span>
                  <span style={{fontSize: '0.75rem', color: '#1e3a8a', marginLeft: '6px', padding: '2px 6px', background: '#dbeafe', borderRadius: '4px', display: 'inline-block'}}>
                    {q.difficulty || 'Medium'}
                  </span>
                  <span style={{fontSize: '0.75rem', color: '#065f46', marginLeft: '6px', padding: '2px 6px', background: '#d1fae5', borderRadius: '4px', display: 'inline-block'}}>
                    {getTopicName(q.topic_id)}
                  </span>
                </h3>
                
                {isFIB && (
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Type your answer here..."
                    value={answers[q.question_id] || ''}
                    onChange={e => handleSelectAnswer(q.question_id, e.target.value)}
                    style={{width: '100%', maxWidth: '400px'}}
                  />
                )}
                
                {isDescriptive && (
                  <textarea
                    className="input-field"
                    rows="3"
                    placeholder="Write your answer here..."
                    value={answers[q.question_id] || ''}
                    onChange={e => handleSelectAnswer(q.question_id, e.target.value)}
                    style={{width: '100%'}}
                  />
                )}
                
                {q.question_type === 'MULTI_MCQ' && (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 8px 0'}}><em>Select all that apply (Multiple Correct Answers):</em></p>
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const optionText = q[`option_${opt.toLowerCase()}`];
                      if (!optionText) return null;
                      const isChecked = (answers[q.question_id] || '').split(',').includes(opt);
                      return (
                        <label 
                          key={opt}
                          style={{
                            padding: '12px 16px', 
                            border: '1px solid',
                            borderColor: isChecked ? 'var(--accent-color)' : 'var(--border-color)',
                            borderRadius: '8px',
                            background: isChecked ? '#eff6ff' : '#f9fafb',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => handleSelectMultiAnswer(q.question_id, opt)}
                            style={{accentColor: 'var(--accent-color)', width: '18px', height: '18px'}}
                          />
                          <span><strong>{opt}.</strong> {optionText}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.question_type === 'MCQ' && (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const optionText = q[`option_${opt.toLowerCase()}`];
                      if (!optionText) return null;
                      const isSelected = answers[q.question_id] === opt;
                      return (
                        <label 
                          key={opt}
                          style={{
                            padding: '12px 16px', 
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)',
                            borderRadius: '8px',
                            background: isSelected ? '#eff6ff' : '#f9fafb',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <input 
                            type="radio" 
                            name={`q_${q.question_id}`} 
                            checked={isSelected} 
                            onChange={() => handleSelectAnswer(q.question_id, opt)}
                            style={{accentColor: 'var(--accent-color)', width: '18px', height: '18px'}}
                          />
                          <span><strong>{opt}.</strong> {optionText}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <button className="btn" onClick={handleSubmitQuiz} style={{width: '100%', padding: '16px', fontSize: '1.1rem'}}>
            Submit Quiz
          </button>
        </div>
      )}

      {quizStatus === 'SUBMITTING' && (
        <div className="glass-panel flex-center" style={{height: '200px'}}>
          <h3>Grading...</h3>
        </div>
      )}

      {quizStatus === 'DONE' && (
        <div className="glass-panel">
          <div style={{textAlign: 'center', marginBottom: '32px'}}>
            <h2 style={{fontSize: '2rem'}}>Quiz Completed!</h2>
            <div style={{
              fontSize: '4rem', 
              fontWeight: 800, 
              color: score >= 50 ? 'var(--success-color)' : 'var(--danger-color)',
              margin: '16px 0'
            }}>
              {score.toFixed(1)}%
            </div>
            <p>Your behavioural metrics and scores have been recorded for the Phase 4 ML Engine.</p>
          </div>

          <h3 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px'}}>Explanations</h3>
          {questions.map((q, idx) => {
            const userAns = answers[q.question_id] || '';
            const isFIB = q.question_type === 'FIB';
            const isDescriptive = q.question_type === 'DESCRIPTIVE';
            
            let isCorrect = false;
            if (isFIB) {
              isCorrect = userAns.trim().toLowerCase() === q.correct_option.trim().toLowerCase();
            } else if (isDescriptive) {
              isCorrect = userAns.trim().length >= 10;
            } else if (q.question_type === 'MULTI_MCQ') {
              const uList = userAns.split(',').map(s => s.trim()).filter(Boolean).sort().join(',');
              const cList = q.correct_option.split(',').map(s => s.trim()).filter(Boolean).sort().join(',');
              isCorrect = uList === cList;
            } else {
              isCorrect = userAns === q.correct_option;
            }
            
            return (
              <div key={q.question_id} style={{marginBottom: '24px', padding: '16px', borderRadius: '8px', background: isCorrect ? '#ecfdf5' : '#fef2f2', border: `1px solid ${isCorrect ? '#a7f3d0' : '#fecaca'}`}}>
                <h4 style={{marginBottom: '8px'}}>Q{idx + 1}. {q.question_text}</h4>
                <p style={{margin: '0 0 8px 0'}}>
                  <strong>Your Answer:</strong> {userAns || 'Skipped'} {isCorrect ? '✅' : '❌'} <br/>
                  <strong>Model Answer / Key:</strong> {q.correct_option}
                </p>
                <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                  <strong>Explanation:</strong> {q.explanation}
                </p>
              </div>
            );
          })}

          <button className="btn" onClick={() => { setQuizStatus('IDLE'); setScore(null); }} style={{width: '100%', marginTop: '16px'}}>
            Take Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizSession;
